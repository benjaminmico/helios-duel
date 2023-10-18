import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Button,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './reducers';
import { actionPlayCard } from './actions/gameActions';
import {
  Card,
  Player,
  canPlayCard,
  playCard,
  rollDiceAndSkipTurn,
} from 'gameFunctions';
import { getBotCards } from 'bot/bot.service';

const GameScreen: React.FC = () => {
  const dispatch = useDispatch();
  const game = useSelector((state: RootState) => state.game);
  const [selectedCards, setSelectedCards] = React.useState<Card[]>([]);
  const [lastCardPlayedCount, setLastCardPlayedCount] = useState<number>(0);

  const handlePlayCard = (card: Card) => {
    if (isCardAlreadySelected(card)) {
      const updatedSelectedCards = selectedCards.filter(
        (selectedCard) =>
          selectedCard.type !== card.type || selectedCard.value !== card.value
      );
      setSelectedCards(updatedSelectedCards);
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleSkipTurn = () => {
    const newGame = rollDiceAndSkipTurn(game);
    if (newGame) {
      dispatch(actionPlayCard(newGame));
    }
    setSelectedCards([]);
    setLastCardPlayedCount(0);
  };

  const playSelectedCards = (playedCards: Card[]) => {
    if (playedCards.length >= 1) {
      const newGame = playCard(game, game.currentPlayer, playedCards);
      if (newGame) {
        dispatch(actionPlayCard(newGame));
      }
      setSelectedCards([]);
      setLastCardPlayedCount(0);
    }
  };

  const playBotTurnIfNecessary = async () => {
    const currentPlayer = game.currentPlayer;
    if (currentPlayer.id === 'bot') {
      const botCards = await getBotCards(game, currentPlayer.id);
      if (!botCards?.length) {
        handleSkipTurn();
        return;
      }
      playSelectedCards(botCards);
    }
  };

  React.useEffect(() => {
    setTimeout(() => playBotTurnIfNecessary(), 100);
  }, [game.currentPlayer.id]);

  const isCardAlreadySelected = (card: Card) => {
    return selectedCards.some(
      (selectedCard) =>
        selectedCard.type === card.type && selectedCard.value === card.value
    );
  };

  const isButtonDisabled =
    selectedCards?.length < lastCardPlayedCount || selectedCards.length === 0;

  const renderGameCard = ({ item, index }: { item: any; index: number }) => (
    <Text key={index}>{JSON.stringify(item)}</Text>
  );

  const renderSortedCard = ({ item, index }: { item: Card; index: number }) => {
    const canPlay = canPlayCard(game, game.currentPlayer, item);
    const isCardSelected = isCardAlreadySelected(item);
    return (
      <Pressable
        key={`${game.currentPlayer.id}_${index}_${item.type}_${item.value}`}
        onPress={() => handlePlayCard(item)}
        disabled={!canPlay}
        style={[
          styles.cardButton,
          { backgroundColor: isCardSelected ? 'green' : 'black' },
          { opacity: canPlay ? 1.0 : 0.3 },
        ]}
      >
        <Text style={styles.cardButtonText}>{item.value.toString()}</Text>
      </Pressable>
    );
  };

  const currentPlayerCards =
    game.players.find((player) => player.id !== 'bot')?.cards || [];
  const sortedCards = [...currentPlayerCards].sort(
    (a, b) => a.position - b.position
  );
  const gameCards = game.cardsHistory.map((card) => ({
    playerId: card.playerId,
    cardsPlayed: card.cardsPlayed.map((c) => c.value),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Card Game</Text>
      <View>
        <Text>Current Player: {game.currentPlayer.id}</Text>
        <Text>Cards Played: </Text>
        <FlatList
          data={gameCards}
          renderItem={renderGameCard}
          keyExtractor={(item, index) => `gameCard_${index}`}
        />
      </View>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={sortedCards}
        renderItem={renderSortedCard}
        keyExtractor={(item, index) => `sortedCard_${index}`}
        horizontal
        style={styles.buttonContainer}
      />
      <Pressable onPress={handleSkipTurn} style={styles.skipButton}>
        <Text style={styles.cardButtonText}>Skip turn</Text>
      </Pressable>

      <Button
        title='Play Selected Cards'
        onPress={() => playSelectedCards(selectedCards)}
        disabled={isButtonDisabled}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  cardButton: {
    minWidth: 30,
    maxHeight: 90,
    marginHorizontal: 4,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardButtonText: {
    color: 'white',
    fontWeight: '800',
  },
  skipButton: {
    marginHorizontal: 4,
    padding: 16,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GameScreen;
