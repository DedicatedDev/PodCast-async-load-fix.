import React, { useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput, Button, Text, Snackbar } from "react-native-paper";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      firstName: "",
      lastName: "",
      buttonText: "Wijzigingen opslaan",
    };
  }

  updateFirstName(event) {
    this.setState({
      firstName: event.target.value,
    });
  }

  updateLastName(event) {
    this.setState({
      lastName: event.target.value,
    });
  }

  doSave() {
    AsyncStorage.getItem("userProfile").then((value) => {
      const localUSer = JSON.parse(value);

      this.setState({ buttonText: 'Wordt opgeslagen...' });
      if (localUSer.authToken) {
        fetch(
          "/v1/profile",
          {
            method: "POST",
            body: JSON.stringify({
              firstName: this.state.firstName,
              lastName: this.state.lastName,
            }),
            headers: {
              Authorization: localUSer.authToken + ":" + localUSer.user_id,
              'Content-Type': 'application/json',
              Accept: '*/*',
            },
          }
        )
          .then((response) => response.text())
          .then((resJson) => {
            this.setState({ buttonText: 'Wijzigingen opgeslagen' });

            setTimeout(() => {
              this.setState({ buttonText: 'Wijzigingen opslaan' });
            }, 3000)

          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  }

  componentDidMount() {
    this.fetchProfile();
  }

  fetchProfile() {
    AsyncStorage.getItem("userProfile").then((value) => {
      const localUSer = JSON.parse(value);

      if (localUSer.authToken) {
        fetch(
          "/wp-json/lifa/v1/profile",
          {
            headers: {
              Authorization: localUSer.authToken + ":" + localUSer.user_id,
            },
          }
        )
          .then((response) => response.json())
          .then((resJson) => {
            this.setState({ firstName: resJson[0].firstName });
            this.setState({ lastName: resJson[0].lastName });
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          <View style={styles.inputContainer}>
            <TextInput
              value={this.state.firstName}
              onChangeText={(firstName) => this.setState({ firstName })}
              placeholder="Voornaam"
              label="Voornaam"
              keyboardType={"default"}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Achternaam"
              value={this.state.lastName}
              onChangeText={(lastName) => this.setState({ lastName })}
              label="Achternaam"
            />
          </View>
          <Button
            style={styles.inputButton}
            onPress={() => this.doSave(this.firstName, this.lastName)}
          >
            {this.state.buttonText}
          </Button>
          <Text style={styles.text}>Mocht je informatie willen ontvangen over het verwijderen van je gegevens dan kun je ons mailen.</Text>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    flex: 1,
    color: "#fff",
    padding: 20,
  },
  text: {
    marginTop: 80,
    fontSize: 15,
    lineHeight: 24,
    color: '#fff',
    textAlign: 'center'
  },  
  inputContainer: {
    marginBottom: 10,
  },
  inputButton: {
    marginTop: 10,
    color: "#000",
    backgroundColor: "#ccc",
  },
});
