import React from 'react'
import { Text, Image, View, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { createStackNavigator } from '@react-navigation/stack'

import Menu from '../components/Menu'
import About from '../components/About'
import Home from '../components/Home'
import Player from '../components/Player'
import Insight from '../components/Insight'
import Profile from '../components/Profile'

import * as RootNavigation from '../navigation/RootNavigation'

const { width: DEVICE_WIDTH } = Dimensions.get('window')
const Stack = createStackNavigator()

const AuthNavigator = () => {
  return (
    <Stack.Navigator initialRouteName='Inloggen'>
      <Stack.Screen
        name='Mijn Shows'
        component={Home}
        options={{
          headerTitle: <Text>Shows</Text>,
          headerStyle: {
            backgroundColor: '#333333',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <Ionicons
              name='md-menu'
              style={{ paddingRight: 5 }}
              size={40}
              color='white'
              onPress={() => RootNavigation.navigate('Menu')}
            />
          ),
        }}
      />
      <Stack.Screen
        name='Insight'
        component={Insight}
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: '#333333',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons
                name='md-menu'
                style={{ paddingRight: 5 }}
                size={40}
                color='white'
                onPress={() => RootNavigation.navigate('Menu')}
              />
            </View>
          ),
        }}
      />
      <Stack.Screen
        name='About'
        component={About}
        options={{
          headerTitle: 'Over ons',
          headerStyle: {
            backgroundColor: '#333333',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name='Profile'
        component={Profile}
        options={{
          headerTitle: 'Mijn gegevens',
          headerStyle: {
            backgroundColor: '#333333',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name='Menu'
        component={Menu}
        options={{
          headerBackTitle: 'Vorige',
          headerStyle: {
            backgroundColor: '#333333',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name='Player'
        component={Player}
        options={{
          headerBackTitle: 'Vorige',
          headerTitle: (
            <Image
              style={{ width: 40, height: 30 }}
              source={require('../assets/header-icon-white.png')}
            />
          ),
          headerStyle: {
            backgroundColor: '#333333',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <Ionicons
              name='md-menu'
              style={{ paddingRight: 5 }}
              size={40}
              color='white'
              onPress={() => RootNavigation.navigate('Menu')}
            />
          ),
        }}
      />
    </Stack.Navigator>
  )
}

AuthNavigator.propTypes = {}
AuthNavigator.defaultProps = {}

export default AuthNavigator