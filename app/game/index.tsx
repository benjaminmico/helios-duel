// app/game/screens/StartScreen.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BotDifficulty, Player, deck, initializeGame } from 'gameFunctions';
import { startGame, playBotTurn } from './actions/gameActions';
import { RouteProp, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from 'types/NavigationTypes';
import { router } from 'expo-router';
import { RootState } from './reducers';

type StartScreenRouteProp = RouteProp<RootStackParamList, 'start'>;
type StartScreenNavigationProp = NavigationProp<RootStackParamList, 'start'>;

type Props = {
  route: StartScreenRouteProp;
  navigation: StartScreenNavigationProp;
};

const StartScreen: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const [playerName, setPlayerName] = useState('');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>(
    BotDifficulty.HARD
  );

  const game = useSelector((state: RootState) => state.game);

  // Function to handle starting the game
  const handleStartGame = () => {
    if (!playerName) {
      alert('Please enter your name.');
      return;
    }

    // Create the player and bot objects
    const player: Player = {
      id: playerName,
      cards: [], // Initialize with an empty hand
    };
    const bot: Player = {
      id: 'bot',
      cards: [], // Initialize with an empty hand
    };

    // Initialize the game using the provided functions
    const game = initializeGame([player, bot], deck);

    // Dispatch the startGame action with the initialized game
    dispatch(startGame(game));

    // // Optionally, let the bot play its turn after the player starts the game
    // // dispatch(playBotTurn());

    router.push({ pathname: '/game/heliosDuel' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to the Card Game!</Text>
      <View style={styles.inputContainer}>
        <Text>Your Name:</Text>
        <TextInput
          style={styles.input}
          value={playerName}
          onChangeText={(text) => setPlayerName(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text>Bot Difficulty:</Text>
        <Text>{botDifficulty}</Text>
      </View>
      <Button title='Start Game' onPress={handleStartGame} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 5,
  },
});

export default StartScreen;
