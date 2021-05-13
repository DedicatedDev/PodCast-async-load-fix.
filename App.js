import React, { useEffect, useMemo, useCallback, useState } from 'react'
import { View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { ActivityIndicator } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import mainContext from './context/Context'
import { MainStackNavigator } from './navigation/StackNavigator'
import { navigationRef } from './navigation/RootNavigation'
import { loginUrl } from './const/const'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLogged, setIsLogged] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [loggingIn, setloggingIn] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    AsyncStorage.getItem('userProfile').then((value) => {
      const _data = JSON.parse(value)

      if (_data?.authToken) {
        setUserProfile(_data)
        setIsLoading(false)
        setIsLogged(true)
      } else {
        setIsLoading(false)
        setIsLogged(false)
      }
    })
  }, [])

  const doLogin = useCallback(async (email, password) => {
    setloggingIn(true)
    setError(null)
    let formData = new FormData()
    formData.append('type', 'login')
    formData.append('email', email)
    formData.append('password', password)
    try {
      let response = await fetch(loginUrl, {
        method: 'POST',
        body: formData,
      })
      let json = await response.json()
      if (json.status != false) {
        setError(null)
        try {
          await AsyncStorage.setItem(
            'userProfile',
            JSON.stringify({
              isLoggedIn: json.status,
              authToken: json.token,
              user_id: json.user_id,
            }),
          )
        } catch {
          setError('Error storing data on device')
        }
        setUserProfile({
          isLoggedIn: json.status,
          authToken: json.token,
          user_id: json.user_id,
        })
        setIsLogged(true)
        setUserProfile(json)
      } else {
        setIsLogged(false)
        setError(json.msg)
      }
      setloggingIn(false)
    } catch (e) {
      setError('Server onbereikbaar')
      setloggingIn(false)
    }
  }, [])

  const doLogout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('userProfile')
      setUserProfile(null)
      setloggingIn(false)
      setIsLogged(false)
      return true
    } catch (exception) {
      setError('Error deleting data')
      return false
    }
  }, [])

  const wContext = useMemo(
    () => ({
      userProfile: userProfile,
      loggingIn: loggingIn,
      isLogged: isLogged,
      error: error,
      doLogin: (email, password) => {
        doLogin(email, password)
      },
      doLogout: () => {
        doLogout()
      },
    }),
    [doLogin, doLogout, error, isLogged, loggingIn, userProfile],
  )

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating={true} size='large' />
      </View>
    )
  }

  return (
    <mainContext.Provider value={wContext}>
      <StatusBar style='dark' />
      <NavigationContainer ref={navigationRef}>
        <MainStackNavigator />
      </NavigationContainer>
    </mainContext.Provider>
  )
}