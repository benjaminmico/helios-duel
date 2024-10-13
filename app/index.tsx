// App.js

import 'react-native-gesture-handler'; // Must be at the top
import React, { useState, useRef, useEffect, FunctionComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Touchable,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';

import {
  Card as CardType,
  changePlayerHand,
  deck,
  initializeGame,
  Player,
} from 'gameFunctions';
import CardItem, {
  CARD_PLAYABLE_HEIGHT,
  CARD_PLAYABLE_WIDTH,
  CARD_PREVIEW_HEIGHT,
  CARD_PREVIEW_WIDTH,
} from './components/cleanVersion/Card';
import CardAnimatedV2, {
  CARD_HEIGHT,
  CARD_WIDTH,
} from './components/cleanVersion/CardAnimated';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './reducers';
import { actionPlayGame, startGame } from './actions/gameActions';
import { selfPlayerCards, sortedBotCards, sortedCards } from './handlers';
import { useCardAnimation } from './components/cleanVersion/useCardAnimation';
import GameView from './components/cleanVersion/GameView';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Constants for card dimensions

const App = () => {
  const game = useSelector((state: RootState) => state.game);

  const dispatch = useDispatch();
  const playerName = 'Ben';

  // Function to handle starting the game
  const handleStartGame = () => {
    if (!playerName) {
      alert('Please enter your name.');
      return;
    }

    // Create the player and bot objects
    const player: Player = {
      id: playerName,
      cards: [],
      liveCards: [],
    };
    const bot: Player = {
      id: 'bot',
      cards: [],
      liveCards: [],
    };

    const game = initializeGame([player, bot], deck);
    dispatch(startGame(game));
  };

  if (!game?.id)
    return (
      <SafeAreaView>
        <TouchableOpacity
          style={{ width: 40, height: 40, backgroundColor: 'red' }}
          onPress={handleStartGame}
        />
      </SafeAreaView>
    );

  return <GameView game={game} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B6623',
  },
});

export default App;
