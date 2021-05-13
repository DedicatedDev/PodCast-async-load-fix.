import React, { Component } from 'react'
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { Audio } from 'expo-av'
import { MaterialIcons, AntDesign } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

class PlaylistItem {
  constructor(name, uri, image) {
    this.name = name
    this.uri = uri
    this.image = image
  }
}

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')
const BACKGROUND_COLOR = '#000000'
const FONT_SIZE = 14
const LOADING_STRING = 'Laden...'
const BUFFERING_STRING = 'Buffered...'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.index = 0
    this.rate = 1
    this.isSeeking = false
    this.shouldPlayAtEndOfSeek = false
    this.playbackInstance = null
    this.state = {
      playbackInstanceName: LOADING_STRING,
      playbackInstancePosition: null,
      playbackInstanceDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isBuffering: false,
      isLoading: true,
      fontLoaded: true,
      numberToPlay: 0,
      insightId: null,
      volume: 1.0,
      rate: 1.0,
      portrait: null,
    }
  }

  componentDidMount() {
    this.index = this.props.route.params.numberToPlay
    this.insightId = this.props.route.params.insightId

    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
      playThroughEarpieceAndroid: true,
    })

    this._loadNewPlaybackInstance(false)
  }

  async _loadNewPlaybackInstance(playing) {
    if (this.playbackInstance != null) {
      await this.playbackInstance.unloadAsync()
      this.playbackInstance.setOnPlaybackStatusUpdate(null)
      this.playbackInstance = null
    }

    const source = { uri: this.props.route.params.data[this.index].bestand }
    const initialStatus = {
      shouldPlay: playing,
      rate: this.state.rate,
      volume: this.state.volume,
    }

    const { sound, status } = await Audio.Sound.createAsync(
      source,
      initialStatus,
      this._onPlaybackStatusUpdate,
    )
    this.playbackInstance = sound
    
    this._updateScreenForLoading(false)
  }

  _updateScreenForLoading(isLoading) {
    if (isLoading) {
      this.setState({
        isPlaying: false,
        playbackInstanceName: LOADING_STRING,
        playbackInstanceDuration: null,
        playbackInstancePosition: null,
        isLoading: true,
      })
    } else {
      this.setState({
        playbackInstanceName: this.props.route.params.data[this.index].titel,
        portrait: this.props.route.params.data[this.index].artwork,
        shownotes: this.props.route.params.data[this.index].shownotes,
        isLoading: false,
      })
    }
  }

  _onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      this.setState({
        playbackInstancePosition: status.positionMillis,
        playbackInstanceDuration: status.durationMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        isBuffering: status.isBuffering,
        rate: status.rate,
        volume: status.volume,
      })
      if (status.didJustFinish) {
        if (this.props.route.params.data.length == this.index + 1) {
          this._markInsightComplete(this.insightId)
        }

        //this._advanceIndex(true);
        //this._updatePlaybackInstanceForIndex(true);
      }
    } else {
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`)
      }
    }
  }

  _markInsightComplete(insightId) {
    AsyncStorage.getItem('userProfile').then((value) => {
      const localUSer = JSON.parse(value)

      if (localUSer.authToken) {
        fetch(
          'https://app.leadersinfinanceacademy.nl/wp-json/lifa/v1/progress',
          {
            method: 'post',
            body: JSON.stringify({
              userId: localUSer.user_id,
              insightId: insightId,
            }),
            headers: {
              Authorization: localUSer.authToken + ':' + localUSer.user_id,
            },
          },
        )
          .then((response) => response.text())
          .then((resJson) => {})
          .catch((error) => {
            console.error(error)
          })
      }
    })
  }

  _advanceIndex(forward) {
    this.index =
      (this.index + (forward ? 1 : this.props.route.params.data.length - 1)) %
      this.props.route.params.data.length
  }

  async _updatePlaybackInstanceForIndex(playing) {
    this._updateScreenForLoading(true)
    this._loadNewPlaybackInstance(playing)
  }

  _onPlayPausePressed = () => {
    if (this.playbackInstance != null) {
      if (this.state.isPlaying) {
        this.playbackInstance.pauseAsync()
      } else {
        this.playbackInstance.playAsync()
      }
    }
  }

  _onForwardPressed = () => {
    if (this.playbackInstance != null) {
      this._advanceIndex(true)
      this._updatePlaybackInstanceForIndex(this.state.shouldPlay)
    }
  }

  _onBackPressed = () => {
    if (this.playbackInstance != null) {
      this._advanceIndex(false)
      this._updatePlaybackInstanceForIndex(this.state.shouldPlay)
    }
  }

  _onVolumeSliderValueChange = (value) => {
    if (this.playbackInstance != null) {
      this.playbackInstance.setVolumeAsync(value)
    }
  }

  _trySetRate = async (rate) => {
    if (this.playbackInstance != null) {
      try {
        await this.playbackInstance.setRateAsync(rate)
      } catch (error) {
        // Rate changing could not be performed, possibly because the client's Android API is too old.
      }
    }
  }

  _onRateChange = async (value) => {
    if (this.state.rate == 1) {
      this.rate = 1.5
    }

    if (this.state.rate == 1.5) {
      this.rate = 2
    }

    if (this.state.rate == 2) {
      this.rate = 1
    }

    this.setState({
      rate: this.rate,
    })

    this._trySetRate(this.rate)
  }

  _onSkipBackwards = async (value) => {
    if (this.playbackInstance != null) {
      this.isSeeking = false
      const seekPosition = 15000 - this.state.playbackInstancePosition

      if (this.shouldPlayAtEndOfSeek) {
        this.playbackInstance.playFromPositionAsync(seekPosition)
      } else {
        this.playbackInstance.setPositionAsync(seekPosition)
      }
    }
  }

  _onSkipForwards = async (value) => {
    if (this.playbackInstance != null) {
      this.isSeeking = false
      const seekPosition = 15000 + this.state.playbackInstancePosition

      if (this.shouldPlayAtEndOfSeek) {
        this.playbackInstance.playFromPositionAsync(seekPosition)
      } else {
        this.playbackInstance.setPositionAsync(seekPosition)
      }
    }
  }

  _onSeekSliderValueChange = (value) => {
    if (this.playbackInstance != null && !this.isSeeking) {
      this.isSeeking = true
      this.shouldPlayAtEndOfSeek = this.state.shouldPlay
      this.playbackInstance.pauseAsync()
    }
  }

  _onSeekSliderSlidingComplete = async (value) => {
    if (this.playbackInstance != null) {
      this.isSeeking = false
      const seekPosition = value * this.state.playbackInstanceDuration
      if (this.shouldPlayAtEndOfSeek) {
        this.playbackInstance.playFromPositionAsync(seekPosition)
      } else {
        this.playbackInstance.setPositionAsync(seekPosition)
      }
    }
  }

  _getSeekSliderPosition() {
    if (
      this.playbackInstance != null &&
      this.state.playbackInstancePosition != null &&
      this.state.playbackInstanceDuration != null
    ) {
      return (
        this.state.playbackInstancePosition /
        this.state.playbackInstanceDuration
      )
    }
    return 0
  }

  _getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000
    const seconds = Math.floor(totalSeconds % 60)
    const minutes = Math.floor(totalSeconds / 60)

    const padWithZero = (number) => {
      const string = number.toString()
      if (number < 10) {
        return '0' + string
      }
      return string
    }
    return padWithZero(minutes) + ':' + padWithZero(seconds)
  }

  _getTimestamp() {
    if (
      this.playbackInstance != null &&
      this.state.playbackInstancePosition != null &&
      this.state.playbackInstanceDuration != null
    ) {
      return `${this._getMMSSFromMillis(
        this.state.playbackInstancePosition,
      )} / ${this._getMMSSFromMillis(this.state.playbackInstanceDuration)}`
    }
    return ''
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.portraitContainer}>
          <Image
            style={styles.portrait}
            source={{
              uri: this.state.portrait,
            }}
          />
        </View>
        <View style={styles.detailsContainer}>
          <Text style={[styles.textTitel]}>
            {this.state.playbackInstanceName}
          </Text>
          <Text style={[styles.text]}>
            {this.state.isBuffering ? BUFFERING_STRING : this._getTimestamp()}
          </Text>
        </View>
        <View
          style={[styles.buttonsContainerBase, styles.buttonsContainerTopRow]}>
          <TouchableHighlight
            underlayColor={BACKGROUND_COLOR}
            style={styles.controlButton}
            onPress={this._onBackPressed}
            disabled={this.state.isLoading}>
            <View>
              <MaterialIcons name='fast-rewind' size={40} color='#ffffff' />
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={BACKGROUND_COLOR}
            style={styles.controlButton}
            onPress={this._onSkipBackwards}
            disabled={this.state.isLoading}>
            <View>
              <AntDesign
                name='reload1'
                size={24}
                color='#ffffff'
                style={{ transform: [{ rotateY: '180deg' }] }}
              />
              <Text style={styles.controlButtonText}>15sec</Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            underlayColor={BACKGROUND_COLOR}
            style={styles.controlButton}
            onPress={this._onPlayPausePressed}
            disabled={this.state.isLoading}>
            <View>
              {this.state.isPlaying ? (
                <MaterialIcons name='pause' size={40} color='#ffffff' />
              ) : (
                <MaterialIcons name='play-arrow' size={40} color='#ffffff' />
              )}
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={BACKGROUND_COLOR}
            style={styles.controlButton}
            onPress={this._onSkipForwards}
            disabled={this.state.isLoading}>
            <View>
              <AntDesign name='reload1' size={24} color='#ffffff' />
              <Text style={styles.controlButtonText}>15sec</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={BACKGROUND_COLOR}
            style={styles.controlButton}
            onPress={this._onForwardPressed}
            disabled={this.state.isLoading}>
            <View>
              <MaterialIcons name='fast-forward' size={40} color='#ffffff' />
            </View>
          </TouchableHighlight>
        </View>
        <View style={[styles.playbackContainer]}>
          <Slider
            style={styles.playbackSlider}
            value={this._getSeekSliderPosition()}
            onValueChange={this._onSeekSliderValueChange}
            onSlidingComplete={this._onSeekSliderSlidingComplete}
            thumbTintColor='#ffffff'
            maximumTrackTintColor='green'
            maximumTrackTintColor='#ffffff'
            disabled={this.state.isLoading}
          />
        </View>
        <View>
          <Text style={styles.textShownotes}>{this.state.shownotes}</Text>
        </View>
        <View
          style={[
            styles.buttonsContainerBase,
            styles.buttonsContainerMiddleRow,
          ]}>
          <View style={styles.volumeContainer}>
            <View>
              <MaterialIcons name='volume-down' size={30} color='#ffffff' />
            </View>
            <Slider
              style={styles.volumeSlider}
              value={1}
              onValueChange={this._onVolumeSliderValueChange}
              thumbTintColor='#ffffff'
              minimumTrackTintColor='#cccccc'
            />
            <View>
              <MaterialIcons name='volume-up' size={30} color='#ffffff' />
            </View>
          </View>
        </View>
        <View
          style={[
            styles.buttonsContainerBase,
            styles.buttonsContainerBottomRow,
          ]}>
          <View>
            <TouchableHighlight onPress={this._onRateChange}>
              <Text style={[styles.textPlayRate]}>{this.rate} x</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
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
    alignItems: 'center',
  },
  playbackContainer: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  playbackSlider: {
    alignSelf: 'stretch',
    marginLeft: 40,
    marginRight: 40,
  },
  text: {
    fontSize: FONT_SIZE,
    color: '#ffffff',
    minHeight: FONT_SIZE,
  },
  controlButton: {
    marginLeft: 15,
    marginRight: 15,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 9,
    marginTop: 5,
  },
  textShownotes: {
    fontSize: FONT_SIZE,
    color: '#ffffff',
    textAlign: 'center',
    minWidth: DEVICE_WIDTH / 1.2,
    maxWidth: DEVICE_WIDTH / 1.2,
    marginTop: -15,
    marginBottom: 45,
  },
  textPlayRate: {
    fontSize: 18,
    marginTop: 0,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  textTitel: {
    fontSize: 20,
    marginTop: -25,
    color: '#ffffff',
    minHeight: FONT_SIZE,
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonsContainerTopRow: {
    maxHeight: 40,
  },
  buttonsContainerMiddleRow: {
    maxHeight: 40,
    alignSelf: 'stretch',
  },
  volumeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: DEVICE_WIDTH - 40,
    maxWidth: DEVICE_WIDTH - 40,
  },
  volumeSlider: {
    width: DEVICE_WIDTH - 80,
  },
  buttonsContainerBottomRow: {
    alignSelf: 'stretch',
  },
  rateSlider: {
    width: DEVICE_WIDTH - 80,
  },
})
