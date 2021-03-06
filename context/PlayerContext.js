import React from 'react'

export const LOADING_STRING = 'Laden...'
export const BUFFERING_STRING = 'Bufferen...'

export default React.createContext({
  data: [],
  setData: () => null,
  itemToPlay: null,
  setItemToPlay: () => null,
  showPlayer: true,
  setShowPlayer: () => null,
  insightId: null,
  setInsightId: () => null,
  numberToPlay: 0,
  setNumberToPlay: () => null,
  isPlaying: false,
  setIsPlaying: () => null,
  playbackInstance: null,
  setPlaybackInstance: () => null,
  playbackInstanceName: LOADING_STRING,
  setPlaybackInstanceName: () => null,
  playbackInstancePosition: null,
  setPlaybackInstancePosition: () => null,
  playbackInstanceDuration: null,
  setPlaybackInstanceDuration: () => null,
  shouldPlay: false,
  setShouldPlay: () => null,
  isBuffering: false,
  setIsBuffering: () => null,
  isLoading: true,
  setIsLoading: () => null,
  fontLoaded: true,
  setFontLoaded: () => null,
  volume: 1.0,
  setVolume: () => null,
  portrait: null,
  setPortrait: () => null,
  showNote: null,
  setShowNote: () => null,
})
