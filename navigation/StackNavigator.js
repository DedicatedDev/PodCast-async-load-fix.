import React, { useEffect, useContext, useMemo, useState } from "react";

import AuthNavigator from "../navigation/AuthNavigator";
import AppNavigator from "../navigation/AppNavigator";
import mainContext from "../context/Context";
import PlayerContext, { LOADING_STRING } from "../context/PlayerContext";

import MiniPlayer from "../components/MiniPlayer";

const MainStackNavigator = () => {
  const { isLogged } = useContext(mainContext);

  const [data, setData] = useState([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [insightId, setInsightId] = useState(undefined);
  const [playbackInstanceName, setPlaybackInstanceName] =
    useState(LOADING_STRING);

  const [itemToPlay, setItemToPlay] = useState(null);
  const [playbackInstance, setPlaybackInstance] = useState(null);
  const [playbackInstancePosition, setPlaybackInstancePosition] =
    useState(null);
  const [playbackInstanceDuration, setPlaybackInstanceDuration] =
    useState(null);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(true);
  const [numberToPlay, setNumberToPlay] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [portrait, setPortrait] = useState(null);
  const [showNote, setShowNote] = useState(null);

  const contextValue = useMemo(
    () => ({
      data,
      setData,
      itemToPlay,
      setItemToPlay,
      showPlayer,
      setShowPlayer,
      isPlaying,
      setIsPlaying,
      insightId,
      setInsightId,
      playbackInstance,
      setPlaybackInstance,
      playbackInstanceName,
      setPlaybackInstanceName,
      playbackInstancePosition,
      setPlaybackInstancePosition,
      playbackInstanceDuration,
      setPlaybackInstanceDuration,
      shouldPlay,
      setShouldPlay,
      isBuffering,
      setIsBuffering,
      isLoading,
      setIsLoading,
      fontLoaded,
      setFontLoaded,
      numberToPlay,
      setNumberToPlay,
      volume,
      setVolume,
      portrait,
      setPortrait,
      showNote,
      setShowNote,
    }),
    [
      data,
      itemToPlay,
      showPlayer,
      isPlaying,
      insightId,
      playbackInstance,
      playbackInstanceName,
      playbackInstancePosition,
      playbackInstanceDuration,
      shouldPlay,
      isBuffering,
      isLoading,
      fontLoaded,
      numberToPlay,
      volume,
      portrait,
      showNote,
    ]
  );

  useEffect(() => {
    setItemToPlay(data[numberToPlay]);
  }, [data, numberToPlay]);

  useEffect(() => {
    if (!showPlayer) {
      setIsPlaying(false);
      setPlaybackInstanceName(LOADING_STRING);
      setPlaybackInstancePosition(null);
      setPlaybackInstanceDuration(null);
      setShouldPlay(false);
      setIsBuffering(false);
      setIsLoading(true);
      setPortrait(null);
      setShowNote(null);
    }
  }, [showPlayer]);

  /*
  if (isLogged != true) {
    return <AuthNavigator />
  }
  */

  return (
    <PlayerContext.Provider value={contextValue}>
      <AppNavigator />
      {showPlayer && <MiniPlayer />}
    </PlayerContext.Provider>
  );
};

export { MainStackNavigator };
