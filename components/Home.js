import React, { Component } from "react";
import {
  Image,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
} from "react-native";

export default class Office extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      data: [],
    };
  }

  componentDidMount() {
    return fetch("https://adyen.thomasjacobs.dev/app.json")
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ data: responseJson, isLoading: false });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  goToInsight(
    insightId,
    insightTitle,
    insightShowNotes,
    insightArtwork,
    insightEpisode
  ) {
    this.props.navigation.navigate("Insight", {
      insightId,
      insightTitle,
      insightShowNotes,
      insightArtwork,
      insightEpisode,
    });
  }

  renderItemComponent = ({ item }) => (
    <TouchableOpacity
      style={styles.listitem}
      onPress={
        this.goToInsight.bind(
        this,
        item.id,
        item.title,
        item.description,
        item.artwork,
        item.episodes
      )}
    >
      <Image style={styles.image} source={{ uri: item.artwork }} />
    </TouchableOpacity>
  );

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.data}
          renderItem={(item) => {
            var newItem = item;
            var newEpisodes = [];
            item.item.episodes &&
              item.item.episodes.forEach((episode) => {
                var uid =
                  episode.podcast_id.toString() + "-" + episode.id.toString();
                var newEpisode = { ...episode, uid: uid };
                newEpisodes.push(newEpisode);
              });
            newItem.item.episodes = newEpisodes;
            return this.renderItemComponent(newItem);
          }}
          keyExtractor={(item, id) => id.toString()}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    flex: 1,
  },
  list: {
    margin: 10,
  },
  listitem: {
    height: 230,
    margin: 10,
    position: "relative",
  },
  image: {
    height: "100%",
    borderRadius: 10,
  },
  text: {
    textShadowColor: "rgba(51,51,51,0.31)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    position: "absolute",
    padding: 15,
    fontSize: 20,
    color: "#fff",
  },
});
