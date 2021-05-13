import React, { useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { Text } from 'react-native-paper';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputContainerText}>Voor al je vragen, opmerkingen, feedback of andere berichten, horen we graag van je.</Text>
        </View>
      </ScrollView>)
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
    fontWeight: 'bold'
  },
  inputContainerText: {
    color: '#fff',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputButton: {
    marginTop: 10,
    color: '#000',
    backgroundColor: '#ccc',
  }
});