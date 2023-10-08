import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Player,
  Card,
  playCard,
  skipTurn,
  Game,
  canPlayMultipleCards,
} from '@/gameFunctions';
import { RootState } from './reducers';
import { actionPlayCard } from './actions/gameActions';
import { RouteProp, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types/NavigationTypes';
import { getBotCards } from '@/bot/bot.service';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'game'>;
type GameScreenNavigationProp = NavigationProp<RootStackParamList, 'game'>;

type Props = {
  route: GameScreenRouteProp;
  navigation: GameScreenNavigationProp;
};
const GameScreen: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const game = useSelector((state: RootState) => state.game);
  const [selectedCards, setSelectedCards] = React.useState<Card[]>([]);

  // Function to handle player's turn when a card is played
  const handlePlayCard = (player: Player, card: Card) => {
    const isPlayerTurn = player === game.currentPlayer;

    if (isPlayerTurn) {
      const newSelectedCards = [...selectedCards, card];
      const isMultipleCardsPlayable = canPlayMultipleCards(
        game,
        player,
        newSelectedCards
      );

      if (isMultipleCardsPlayable) {
        setSelectedCards(newSelectedCards);
      }
    }
  };

  // Function to handle player's turn when they skip their turn
  const handleSkipTurn = (player: Player) => {
    const isPlayerTurn = player === game.currentPlayer;

    if (isPlayerTurn) {
      skipTurn(game, player, game.deck);
      setSelectedCards([]); // Clear selected cards after skipping turn
    }
  };

  // Function to play the selected cards
  const playSelectedCards = (playedCards: Card[]) => {
    console.log('cardssss', playedCards);
    if (playedCards.length >= 1) {
      const newGame = playCard(game, game.currentPlayer, playedCards);
      console.log('newGame', newGame);
      if (newGame) {
        dispatch(actionPlayCard(newGame));
      }
      setSelectedCards([]); // Clear selected cards after playing
    }
  };

  // Function to check if it's the bot's turn and play its turn
  const playBotTurnIfNecessary = async () => {
    const currentPlayer = game.currentPlayer;
    if (currentPlayer.id === 'bot') {
      const botCards = await getBotCards(game, currentPlayer.id);

      console.log('BOT CARDS', botCards);

      playSelectedCards(botCards);
    }
  };

  // Handle bot's turn when the component mounts
  React.useEffect(() => {
    playBotTurnIfNecessary();
  }, [game.currentPlayer]);

  // Sort the player's cards in ascending order
  const sortedCards = game.currentPlayer.cards.sort(
    (a, b) => a.value - b.value
  );

  console.log('game', game);
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Card Game</Text>
      <View>
        <Text>Current Player: {game.currentPlayer.id}</Text>
        <Text>Cards Played: {JSON.stringify(game.cardsHistory)}</Text>
      </View>
      <View style={styles.buttonContainer}>
        {sortedCards.map((card, index) => (
          <Button
            key={`${game.currentPlayer.id}_${index}_${card.type}_${card.value}`}
            title={card.value.toString()}
            onPress={() => handlePlayCard(game.currentPlayer, card)}
            disabled={selectedCards.includes(card)}
          />
        ))}
        <Button
          title='Skip Turn'
          onPress={() => handleSkipTurn(game.currentPlayer)}
        />
      </View>
      {selectedCards.length >= 1 && (
        <Button
          title='Play Selected Cards'
          onPress={() => playSelectedCards(selectedCards)}
        />
      )}
      <Button title='Next Turn' onPress={() => playBotTurnIfNecessary()} />
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
});

export default GameScreen;
