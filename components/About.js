import React, { useContext } from 'react'
import { View, StyleSheet, ScrollView, Linking } from 'react-native'

import { Text } from 'react-native-paper'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
    }
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputContainerTitle}>Wat doen we en waarom?</Text>
          <Text style={styles.inputContainerText}>
            Informatie over Adyen en podcasting.
          </Text>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
    color: '#fff',
    padding: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputContainerTitle: {
    color: '#fff',
    lineHeight: 20,
    fontWeight: 'bold',
  },
  inputContainerText: {
    color: '#fff',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainerText3: {
    color: '#fff',
    lineHeight: 20,
  },
  inputContainerText4: {
    color: '#fff',
    lineHeight: 20,
    marginBottom: 180,
  },  
  inputButton: {
    marginTop: 10,
    color: '#000',
    backgroundColor: '#ccc',
  },
})
