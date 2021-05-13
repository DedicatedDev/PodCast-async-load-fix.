import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Login from '../components/Login'

const Stack = createStackNavigator()

const AuthNavigator = () => {
  return (
    <Stack.Navigator initialRouteName='Inloggen voor Masters in Finance'>
      <Stack.Screen
        name='Inloggen'
        component={Login}
        options={{
          headerTitle: '',
          headerStyle: {
            shadowColor: 'transparent',
            backgroundColor: '#fff',
          },
        }}
      />
    </Stack.Navigator>
  )
}

AuthNavigator.propTypes = {}
AuthNavigator.defaultProps = {}

export default AuthNavigator