import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WithPreventDoubleClick from "./withPreventDoubleClick";
import { decode } from "html-entities";
import PlayerContext from "../context/PlayerContext";
import * as RootNavigation from "../navigation/RootNavigation";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

const TouchableOpacityEx = WithPreventDoubleClick(TouchableOpacity);

const Insight = ({ route }) => {
  const { setInsightId, setNumberToPlay, setShowPlayer, data, setData } =
    useContext(PlayerContext);
  const [refreshing, setRefreshing] = useState(true);

  const {
    insightId,
    insightArtwork,
    insightTitle,
    insightShowNotes,
    insightEpisode,
  } = route.params || {};

  const handleResponse = async () => {
    const _items = [];
    const promise = insightEpisode.map(async (prop, key) => {
      try {
        const tmp = await FileSystem.getInfoAsync(
          FileSystem.documentDirectory + prop.uid + ".mp3"
        );
        _items.push({ ...prop, isDownloaded: tmp.exists });
      } catch (error) {
        console.log(error);
      }
    });

    await Promise.all(promise);
    setRefreshing(false);
    setData(_items);
  };

  const deleteFile = useCallback(
    async (item, index) => {
      const fileInfo = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + item.uid + ".mp3"
      );
      await FileSystem.deleteAsync(fileInfo.uri);
      let _items = [...data];
      _items[index] = { ..._items[index], isDownloaded: false };
      setData(_items);
    },
    [data, setData]
  );

  const onDownloaded = useCallback(
    async (index) => {
      let _items = [...data];
      const tmp = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + _items[index].uid + ".mp3"
      );
      _items[index] = {
        ..._items[index],
        isDownloading: false,
        isDownloaded: Platform.OS === "ios" ? true : tmp.exists,
      };
      setData(_items);
    },
    [data, setData]
  );

  const downloadCallback = useCallback(
    async (downloadProgress, index) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;

      let _items = [...data];

      if (progress < 1) {
        _items[index] = {
          ..._items[index],
          isDownloading: true,
        };
        setData(_items);
      } else {
        onDownloaded(index);
      }
    },
    [data, setData, onDownloaded]
  );

  const downloadFile = useCallback(async (item, index) => {
    
    const gifDir = FileSystem.cacheDirectory + "adyen/";
    const dirInfo = await FileSystem.getInfoAsync(gifDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(gifDir, { intermediates: true });
    }
    const fileInfo = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + item.uid + ".mp3"
    );
    if (!fileInfo.exists) {
      const downloadResumable = FileSystem.createDownloadResumable(
        //item.bestand,
        "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
        FileSystem.documentDirectory + item.uid + ".mp3",
        {},
        (progress) => downloadCallback(progress, index)
      );
      downloadResumable.downloadAsync();
    }
  }, []);

  const onPressItem = useCallback(
    (key) => {
      setInsightId(insightId);
      setNumberToPlay(key);
      setShowPlayer(false);
      setTimeout(() => {
        setShowPlayer(true);
      }, 50);
    },

    [(insightId, setInsightId, setNumberToPlay, setShowPlayer)]
  );

  useEffect(() => {
    handleResponse();
  }, [data]);

  useEffect(()=>{
    //downloadFile();
    // BackgroundFetch.registerTaskAsync("background-fetch", {
    //   minimumInterval: 40, // 1 minute
    //   stopOnTerminate: false,
    //   startOnBoot: true,
    // });
  })

  // TaskManager.defineTask("background-fetch", async () => {
  //   console.log("this is working now");
  //   downloadFile();
  //   return BackgroundFetch.Result.NewData;
  // });
  
  const renderList = useMemo(() => {
    const getButton = (_item, index) => {
      if (_item.isDownloading) {
        return <ActivityIndicator size="small" color="#FFFFFF" />;
      } else if (_item.isDownloaded) {
        return (
          <TouchableOpacity onPress={() => deleteFile(_item, index)}>
            <Ionicons name="cloud-done-outline" size={24} color="white" />
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity onPress={() => downloadFile(_item, index)}>
            <Ionicons name="cloud-outline" size={24} color="white" />
          </TouchableOpacity>
        );
      }
    };

    return (
      <View style={styles.list}>
        {data.map((prop, index) => (
          <View key={index.toString()} style={styles.listItem}>
            <TouchableOpacityEx onPress={() => {
              return onPressItem(index);
            }}>
              <Text style={styles.listItemText}>{prop.title}</Text>
            </TouchableOpacityEx>
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "90%" }}>
                <Text style={styles.listItemDuration}>{prop.duration}</Text>
              </View>
              <View style={{ width: "10%" }}>{getButton(prop, index)}</View>
            </View>
          </View>
        ))}
      </View>
    );
  }, [data, deleteFile, downloadFile, onPressItem]);

  return (
    <ScrollView style={styles.container}>
      <View>
        <Image
          source={{ uri: insightArtwork }}
          style={{ width: "100%", height: 250 }}
        />
      </View>

      <Text style={styles.title}>{insightTitle}</Text>
      <Text style={styles.text}>{decode(insightShowNotes)}</Text>
      {renderList}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#000",
  },
  text: {
    marginLeft: 15,
    marginRight: 15,
    fontSize: 15,
    lineHeight: 24,
    color: "#fff",
  },
  title: {
    margin: 15,
    fontSize: 26,
    marginTop: 25,
    fontWeight: "bold",
    color: "#fff",
  },
  list: {
    margin: 15,
    marginTop: 25,
  },
  listItem: {
    padding: 15,
    borderTopWidth: 0.5,
    fontWeight: "normal",
    borderTopColor: "#ccc",
  },
  listItemText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  listItemDuration: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 8,
  },
});

export default Insight;
