import React, {
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WithPreventDoubleClick from "./withPreventDoubleClick";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import PlayerContext, {
  LOADING_STRING,
  BUFFERING_STRING,
} from "../context/PlayerContext";

const ICON_SIZE = 40;
const { width: DEVICE_WIDTH } = Dimensions.get("window");
const BACKGROUND_COLOR = "#000000";
const FONT_SIZE = 14;

const TouchableOpacityEx = WithPreventDoubleClick(TouchableOpacity);

const MiniPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const [isSeeking, setIsSeeking] = useState(false);
  const [shouldPlayAtEndOfSeek, setShouldPlayAtEndOfSeek] = useState(false);
  const [rate, setRate] = useState(1);

  const {
    data,
    itemToPlay,
    insightId,
    numberToPlay,
    isPlaying,
    volume,
    isBuffering,
    isLoading,
    shouldPlay,
    playbackInstance,
    playbackInstanceName,
    playbackInstanceDuration,
    playbackInstancePosition,
    showNote,
    portrait,
    setNumberToPlay,
    setPlaybackInstance,
    setPlaybackInstanceName,
    setPlaybackInstancePosition,
    setPlaybackInstanceDuration,
    setShouldPlay,
    setIsPlaying,
    setIsBuffering,
    setIsLoading,
    setVolume,
    setPortrait,
    setShowNote,
    setData,
  } = useContext(PlayerContext);

  const togglePlayer = useCallback(() => {
    setIsExpanded((_isExpanded) => !_isExpanded);
  }, []);

  // useEffect(() => {
  //   console.log("+-+-+-+-");
  //   console.log("test")
  //   BackgroundFetch.registerTaskAsync("background-fetch", {
  //     minimumInterval: 40, // 1 minute
  //     stopOnTerminate: false,
  //     startOnBoot: true,
  //   });
  // });

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  useEffect(() => {
    if (!itemToPlay.isDownloaded || !isLoading) {
        downloadFile()
    } else {
      _loadNewPlaybackInstance(true);
    }
  }, [itemToPlay.id]);

  // TaskManager.defineTask("background-fetch", async () => {
  //   downloadFile();
  //   return BackgroundFetch.Result.NewData;
  // });

  const _downloadCallback = useCallback(
    (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite

      if (progress >= 1) {
        _loadNewPlaybackInstance(true)
        setIsPlaying(false)
        setIsLoading(true)
      }
    },
    [_loadNewPlaybackInstance, setIsLoading, setIsPlaying],
  )

  const downloadFile = useCallback(async () => {
    const gifDir = FileSystem.cacheDirectory + "lifa/";
    const dirInfo = await FileSystem.getInfoAsync(gifDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(gifDir, { intermediates: true });
    }
    const fileInfo = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + itemToPlay.uid + ".mp3"
    );
    if (!fileInfo.exists) {
      const downloadResumable = FileSystem.createDownloadResumable(
        "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
        FileSystem.documentDirectory + itemToPlay.uid + ".mp3",
        {},
        _downloadCallback
      );
      await downloadResumable.downloadAsync();
      console.log("is downloaded");
      itemToPlay.isDownloaded = true;
      var newData = data;
      for (var i = 0; i < newData.length; i++) {
        if (newData[i].id == itemToPlay.id) {
          newData[i] = itemToPlay;
        }
      }
      setData(newData);
      _loadNewPlaybackInstance(true);
    } else {
      _loadNewPlaybackInstance(true);
    }
    return () =>{
      _downloadCallback
    }
  }, [_downloadCallback,itemToPlay.bestand, itemToPlay.uid]);

  const _getAudioSource = useCallback(async () => {
    let uri = itemToPlay.bestand;
    if (itemToPlay.isDownloaded) {
      const _path = FileSystem.documentDirectory + itemToPlay.uid + ".mp3";
      const tmp = await FileSystem.getInfoAsync(_path);
      if (tmp.exists) {
        uri = _path;
      }
    }

    return { uri };
  }, [itemToPlay]);

  const _loadNewPlaybackInstance = useCallback(
    async (playing, shouldReload = true) => {
      if (playbackInstance !== null) {
        await playbackInstance.unloadAsync();
        playbackInstance.setOnPlaybackStatusUpdate(null);
        setPlaybackInstance(null);
      }
      const source = await _getAudioSource();
      const initialStatus = {
        shouldPlay: playing,
        rate,
        androidImplementation: "MediaPlayer",
        volume,
      };

      const { sound } = await Audio.Sound.createAsync(
        source,
        initialStatus,
        _onPlaybackStatusUpdate
      );
      setPlaybackInstance(sound);

      if (shouldReload) {
        _updateScreenForLoading(false);
      }
    },
    [
      // playbackInstance,
      // setPlaybackInstance,
      // _getAudioSource,
      // rate,
      // volume,
      // _onPlaybackStatusUpdate,
      // _updateScreenForLoading,
    ]
  );

  const _onPlaybackStatusUpdate = useCallback(
    (status) => {
      const {
        isLoaded,
        didJustFinish,
        positionMillis,
        durationMillis,
        shouldPlay: _shouldPlay,
        isPlaying: _isPlaying,
        isBuffering: _isBuffering,
        rate: _rate,
        volume: _volume,
        error,
      } = status;

      if (isLoaded) {
        setPlaybackInstancePosition(positionMillis);
        setPlaybackInstanceDuration(durationMillis);
        setShouldPlay(_shouldPlay);
        setIsPlaying(_isPlaying);
        setIsBuffering(_isBuffering);
        setRate(_rate);
        setVolume(_volume);
        if (didJustFinish) {
          if (data.length === numberToPlay + 1) {
            _markInsightComplete();
          }
        }
      } else {
        if (error) {
          console.log(`FATAL PLAYER ERROR: ${status.error}`);
        }
      }
    },
    [
      data,
      numberToPlay,
      setPlaybackInstancePosition,
      setPlaybackInstanceDuration,
      setShouldPlay,
      setIsPlaying,
      setIsBuffering,
      setRate,
      setVolume,
      _markInsightComplete,
    ]
  );

  const _markInsightComplete = useCallback(() => {
    AsyncStorage.getItem("userProfile").then((value) => {
      const localUSer = JSON.parse(value);

      if (localUSer.authToken) {
        fetch(
          "https://app.leadersinfinanceacademy.nl/wp-json/lifa/v1/progress",
          {
            method: "POST",
            body: JSON.stringify({
              userId: localUSer.user_id,
              insightId,
            }),
            headers: {
              Authorization: localUSer.authToken + ":" + localUSer.user_id,
              "Content-Type": "application/json",
              Accept: "*/*",
            },
          }
        )
          .then((response) => response.text())
          .then((resJson) => {})
          .catch((error) => {
            console.error({ error });
          });
      }
    });
  }, [insightId]);

  const _updateScreenForLoading = useCallback(
    (_isLoading) => {
      if (_isLoading) {
        setIsPlaying(false);
        setPlaybackInstanceName(LOADING_STRING);
        setPlaybackInstanceDuration(null);
        setPlaybackInstancePosition(null);
        setIsLoading(true);
      } else {
        setPlaybackInstanceName(itemToPlay.titel);
        setPortrait(itemToPlay.artwork);
        setShowNote(itemToPlay.shownotes);
        setIsLoading(false);
      }
    },
    [
      itemToPlay,
      setIsPlaying,
      setPlaybackInstanceName,
      setPlaybackInstanceDuration,
      setPlaybackInstancePosition,
      setIsLoading,
      setPortrait,
      setShowNote,
    ]
  );

  const _advanceIndex = useCallback(
    (forward) => {
      if (playbackInstance !== null) {
        setNumberToPlay((_numberToPlay) => {
          const index =
            (_numberToPlay + (forward ? 1 : data.length - 1)) % data.length;

          return index;
        });
        _updateScreenForLoading(true);
      }
    },
    [_updateScreenForLoading, data.length, playbackInstance, setNumberToPlay]
  );

  const _trySetRate = useCallback(
    async (_rate) => {
      if (playbackInstance !== null) {
        try {
          await playbackInstance.setRateAsync(_rate);
        } catch (error) {
          // Rate changing could not be performed, possibly because the client's Android API is too old.
        }
      }
    },
    [playbackInstance]
  );

  const unsetPlayer = useCallback(() => {
    if (playbackInstance !== null) {
      playbackInstance.unloadAsync();
      playbackInstance.setOnPlaybackStatusUpdate(null);
      setPlaybackInstance(null);
      setRate(1);
    }
  }, [playbackInstance, setPlaybackInstance]);

  useEffect(() => {
    _trySetRate(rate);
  }, [rate, _trySetRate]);

  useEffect(() => {
    return () => unsetPlayer();
  }, [unsetPlayer]);

  const _onSkipBackwards = useCallback(
    (value) => {
      if (playbackInstance != null) {
        setIsSeeking(false);
        const seekPosition = Math.max(playbackInstancePosition - 15000, 0);

        if (shouldPlayAtEndOfSeek) {
          playbackInstance.playFromPositionAsync(seekPosition);
        } else {
          playbackInstance.setPositionAsync(seekPosition);
        }
      }
    },
    [shouldPlayAtEndOfSeek, playbackInstance, playbackInstancePosition]
  );

  const _onSkipForwards = useCallback(
    (value) => {
      if (playbackInstance != null) {
        setIsSeeking(false);
        const seekPosition = Math.min(
          playbackInstanceDuration,
          playbackInstancePosition + 15000
        );

        if (shouldPlayAtEndOfSeek) {
          playbackInstance.playFromPositionAsync(seekPosition);
        } else {
          playbackInstance.setPositionAsync(seekPosition);
        }
      }
    },
    [
      playbackInstance,
      playbackInstanceDuration,
      playbackInstancePosition,
      shouldPlayAtEndOfSeek,
    ]
  );

  const _onSeekSliderValueChange = useCallback(
    (value) => {
      if (playbackInstance != null && !isSeeking) {
        playbackInstance.pauseAsync();
        setIsSeeking(true);
        setShouldPlayAtEndOfSeek(shouldPlay);
      }
    },
    [playbackInstance, isSeeking, shouldPlay]
  );

  const _onSeekSliderSlidingComplete = useCallback(
    (value) => {
      if (playbackInstance != null) {
        setIsSeeking(false);
        const seekPosition = value * playbackInstanceDuration;
        if (shouldPlayAtEndOfSeek) {
          playbackInstance.playFromPositionAsync(seekPosition);
        } else {
          playbackInstance.setPositionAsync(seekPosition);
        }
      }
    },
    [shouldPlayAtEndOfSeek, playbackInstance, playbackInstanceDuration]
  );

  const _getSeekSliderPosition = useMemo(() => {
    if (
      playbackInstance != null &&
      playbackInstancePosition != null &&
      playbackInstanceDuration != null
    ) {
      return playbackInstancePosition / playbackInstanceDuration;
    }
    return 0;
  }, [playbackInstance, playbackInstancePosition, playbackInstanceDuration]);

  const _getMMSSFromMillis = useCallback((millis) => {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = (number) => `${+number < 10 ? "0" : ""}${number}`;
    return padWithZero(minutes) + ":" + padWithZero(seconds);
  }, []);

  const _getTimestamp = useCallback(() => {
    if (
      playbackInstance != null &&
      playbackInstancePosition != null &&
      playbackInstanceDuration != null
    ) {
      return `${_getMMSSFromMillis(
        playbackInstancePosition
      )} / ${_getMMSSFromMillis(playbackInstanceDuration)}`;
    }
    return "";
  }, [
    playbackInstance,
    playbackInstancePosition,
    playbackInstanceDuration,
    _getMMSSFromMillis,
  ]);

  const title = useMemo(() => {
    const string = isBuffering ? BUFFERING_STRING : _getTimestamp();
    if (string) {
      return <Text style={[styles.text]}>{string}</Text>;
    }

    return null;
  }, [isBuffering, _getTimestamp]);

  const loadingColor = useMemo(
    () => (isLoading ? "#bbbbbb" : "#ffffff"),
    [isLoading]
  );

  return (
    <View style={styles.playerContainer}>
      {!isExpanded ? (
        <View style={styles.miniPlayerContainer}>
          <TouchableOpacity style={styles.expandButton} onPress={togglePlayer}>
            <MaterialIcons
              name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-up"}
              size={ICON_SIZE}
              color="#ffffff"
            />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {playbackInstanceName}
            </Text>
            {title}
          </View>
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={() =>
              isPlaying
                ? playbackInstance?.pauseAsync()
                : playbackInstance?.playAsync()
            }
            disabled={isLoading}
          >
            <MaterialIcons
              name={isPlaying ? "pause-circle-outline" : "play-circle-outline"}
              size={ICON_SIZE}
              color={loadingColor}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <Modal animationType="slide">
          <View style={[styles.container, styles.modalContainer]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsExpanded(false)}
            >
              <MaterialIcons
                name="keyboard-arrow-down"
                size={ICON_SIZE}
                color="#ffffff"
              />
            </TouchableOpacity>
            <View style={styles.portraitContainer}>
              <Image
                style={styles.portrait}
                source={{
                  uri: portrait,
                }}
              />
            </View>
            <View style={styles.detailsContainer}>
              <Text style={[styles.textTitel]}>{playbackInstanceName}</Text>
              <Text style={[styles.text]}>
                {isBuffering ? BUFFERING_STRING : _getTimestamp()}
              </Text>
            </View>
            <View
              style={[
                styles.buttonsContainerBase,
                styles.buttonsContainerTopRow,
              ]}
            >
              <TouchableOpacityEx
                style={styles.controlButton}
                onPress={() => _advanceIndex(false)}
                disabled={isLoading}
              >
                <MaterialIcons
                  name="fast-rewind"
                  size={40}
                  color={loadingColor}
                />
              </TouchableOpacityEx>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.controlButton}
                onPress={_onSkipBackwards}
                disabled={isLoading}
              >
                <View>
                  <AntDesign
                    name="reload1"
                    size={24}
                    color={loadingColor}
                    style={{ transform: [{ rotateY: "180deg" }] }}
                  />
                  <Text style={styles.controlButtonText}>15sec</Text>
                </View>
              </TouchableHighlight>

              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.controlButton}
                onPress={() =>
                  isPlaying
                    ? playbackInstance?.pauseAsync()
                    : playbackInstance?.playAsync()
                }
                disabled={isLoading}
              >
                <View>
                  {isPlaying ? (
                    <MaterialIcons
                      name="pause"
                      size={40}
                      color={loadingColor}
                    />
                  ) : (
                    <MaterialIcons
                      name="play-arrow"
                      size={40}
                      color={loadingColor}
                    />
                  )}
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.controlButton}
                onPress={_onSkipForwards}
                disabled={isLoading}
              >
                <View>
                  <AntDesign name="reload1" size={24} color={loadingColor} />
                  <Text style={styles.controlButtonText}>15sec</Text>
                </View>
              </TouchableHighlight>
              <TouchableOpacityEx
                underlayColor={BACKGROUND_COLOR}
                style={styles.controlButton}
                onPress={() => _advanceIndex(true)}
                disabled={isLoading}
              >
                <MaterialIcons
                  name="fast-forward"
                  size={40}
                  color={loadingColor}
                />
              </TouchableOpacityEx>
            </View>
            <View style={[styles.playbackContainer]}>
              <Slider
                style={styles.playbackSlider}
                value={_getSeekSliderPosition}
                onValueChange={_onSeekSliderValueChange}
                onSlidingComplete={_onSeekSliderSlidingComplete}
                thumbTintColor="#ffffff"
                maximumTrackTintColor="#ffffff"
                disabled={isLoading}
              />
            </View>
            <View>
              <Text style={styles.textShownotes}>{showNote}</Text>
            </View>
            <View
              style={[
                styles.buttonsContainerBase,
                styles.buttonsContainerMiddleRow,
              ]}
            >
              <View style={styles.volumeContainer}>
                <View>
                  <MaterialIcons name="volume-down" size={30} color="#ffffff" />
                </View>
                <Slider
                  style={styles.volumeSlider}
                  value={1}
                  onValueChange={(value) =>
                    playbackInstance?.setVolumeAsync(value)
                  }
                  thumbTintColor="#ffffff"
                  minimumTrackTintColor="#cccccc"
                />
                <View>
                  <MaterialIcons name="volume-up" size={30} color="#ffffff" />
                </View>
              </View>
            </View>
            <View
              style={[
                styles.buttonsContainerBase,
                styles.buttonsContainerBottomRow,
              ]}
            >
              <View>
                <TouchableOpacityEx
                  debounce={500}
                  onPress={() =>
                    playbackInstance?.setRateAsync(rate >= 2 ? 1 : rate + 0.5)
                  }
                >
                  <Text style={[styles.textPlayRate]}>{rate} x</Text>
                </TouchableOpacityEx>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};
export default MiniPlayer;

const styles = StyleSheet.create({
  playerContainer: {
    flexDirection: "row",
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    left: 10,
    top: 40,
    zIndex: 20,
  },
  modalContainer: {
    paddingTop: 40,
  },
  expandButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 16,
    color: "#ffffff",
  },
  miniPlayerContainer: {
    backgroundColor: "#757575",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  playPauseButton: {},
  slidingContainer: {
    borderColor: "red",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR,
  },
  portraitContainer: {
    marginTop: 20,
  },
  portrait: {
    height: 200,
    width: 200,
  },
  detailsContainer: {
    height: 40,
    marginTop: 40,
    alignItems: "center",
  },
  playbackContainer: {
    marginTop: 10,
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
  },
  playbackSlider: {
    alignSelf: "stretch",
    marginLeft: 40,
    marginRight: 40,
  },
  text: {
    fontSize: FONT_SIZE,
    color: "#ffffff",
  },
  controlButton: {
    marginLeft: 15,
    marginRight: 15,
  },
  controlButtonText: {
    color: "#ffffff",
    fontSize: 9,
    marginTop: 5,
  },
  textShownotes: {
    fontSize: FONT_SIZE,
    color: "#ffffff",
    textAlign: "center",
    minWidth: DEVICE_WIDTH / 1.2,
    maxWidth: DEVICE_WIDTH / 1.2,
    marginTop: -15,
    marginBottom: 45,
  },
  textPlayRate: {
    fontSize: 18,
    marginTop: 0,
    marginLeft: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  textTitel: {
    fontSize: 20,
    marginTop: -25,
    color: "#ffffff",
    minHeight: FONT_SIZE,
    paddingHorizontal: 7,
    textAlign: "center",
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonsContainerTopRow: {
    maxHeight: 40,
  },
  buttonsContainerMiddleRow: {
    maxHeight: 40,
    alignSelf: "stretch",
  },
  volumeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: DEVICE_WIDTH - 40,
    maxWidth: DEVICE_WIDTH - 40,
  },
  volumeSlider: {
    width: DEVICE_WIDTH - 80,
  },
  buttonsContainerBottomRow: {
    alignSelf: "stretch",
  },
  rateSlider: {
    width: DEVICE_WIDTH - 80,
  },
});
