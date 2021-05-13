import React, { useContext } from "react";
import { View, StyleSheet, SafeAreaView, Linking } from "react-native";
import { Menu } from "react-native-paper";
import * as RootNavigation from "../navigation/RootNavigation";
import mainContext from "../context/Context";

const MenuBlock = () => {
  const { doLogout } = useContext(mainContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.list}>
        <Menu.Item
          titleStyle={styles.listItem}
          onPress={() => {
            RootNavigation.navigate("Profile");
          }}
          title="Mijn gegevens"
        />
        <Menu.Item
          titleStyle={styles.listItem}
          onPress={() => {
            RootNavigation.navigate("About");
          }}
          title="Over deze app"
        />
        <Menu.Item
          titleStyle={styles.listItem}
          onPress={() => {
            Linking.openURL("https://www.adyen.com/nl_NL/policies-and-disclaimer/privacy-policy");
          }}
          title="Privacy policy"
        />
        <Menu.Item
          titleStyle={styles.listItem}
          onPress={() => {
            doLogout();
          }}
          title="Uitloggen"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    flex: 1,
    color: "#fff",
  },
  list: {
    marginTop: 10,
  },
  listItem: {
    color: "#fff",
  },
});

export default MenuBlock;