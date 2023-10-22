import React, { useCallback, useState } from 'react';
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
import { actionPlayGame } from './actions/gameActions';
import {
  Card,
  Player,
  canPlayCard,
  getWeakestCard,
  isLastCardArtemis,
  playArtemis,
  playCard,
  playHades,
  playHypnos,
  rollDiceAndSkipTurn,
} from 'gameFunctions';
import { getBotCards } from 'bot/bot.service';

const GameScreen: React.FC = () => {
  const dispatch = useDispatch();
  const game = useSelector((state: RootState) => state.game);
  console.log({ game });
  const [selectedCards, setSelectedCards] = React.useState<Card[]>([]);
  const [selectedArtemisCard, setSelectedArtemisCard] =
    React.useState<Card | null>(null);

  const handleSelectArtemisCard = (card: Card) => {
    setSelectedArtemisCard(card);
  };

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
      dispatch(actionPlayGame(newGame));
    }
    setSelectedCards([]);
    setLastCardPlayedCount(0);
  };

  const handlePlayArtemis = () => {
    if (selectedArtemisCard) {
      const newGame = playArtemis(game, game.currentPlayer, [
        selectedArtemisCard,
      ]);
      if (newGame) {
        dispatch(actionPlayGame(newGame));
      }
      setSelectedArtemisCard(null); // Reset selected card after playing Artemis
      setSelectedCards([]); // Reset selected cards
      setLastCardPlayedCount(0);
    }
  };

  const playSelectedCards = (playedCards: Card[]) => {
    if (playedCards.length >= 1) {
      const newGame = playCard(game, game.currentPlayer, playedCards);
      if (newGame) {
        dispatch(actionPlayGame(newGame));
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
      // Check if the bot has just played Artemis on the weakest card
      if (isLastCardArtemis(game)) {
        console.log('bot plays artemis');
        const weakestCard = getWeakestCard(currentPlayer); // Assuming you have a function to get the weakest card
        console.log('weakestCard', weakestCard);

        if (weakestCard) {
          const artemisPlay = playArtemis(game, currentPlayer, [weakestCard]);
          if (artemisPlay) {
            dispatch(actionPlayGame(artemisPlay));
            return;
          }
        }
      }
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

  const renderGameCard = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <Text key={index}>{JSON.stringify(item)}</Text>
    ),
    []
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
  const currentBotCards =
    game.players.find((player) => player.id === 'bot')?.cards || [];

  const sortedBotCards = [...currentBotCards].sort(
    (a, b) => a.position - b.position
  );
  const sortedCards = [...currentPlayerCards].sort(
    (a, b) => a.position - b.position
  );
  const gameCards = game.cardsHistory.map((card) => ({
    playerId: card.playerId,
    cardsPlayed: card.cardsPlayed.map((c) => c.value),
  }));

  function renderSelectCardToGiveSection() {
    if (game.currentPlayer.id !== 'bot') {
      return (
        <View>
          <Text>Select a card to give to another player:</Text>
          {currentPlayerCards.map((card, index) => (
            <Pressable
              key={`artemisCard_${index}_${card.type}_${card.value}`}
              onPress={() => handleSelectArtemisCard(card)}
              disabled={selectedArtemisCard !== null}
              style={[
                styles.cardButton,
                {
                  backgroundColor:
                    selectedArtemisCard === card ? 'green' : 'black',
                  opacity: selectedArtemisCard === null ? 1.0 : 0.3,
                },
              ]}
            >
              <Text style={styles.cardButtonText}>{card.value.toString()}</Text>
            </Pressable>
          ))}
          {selectedArtemisCard && (
            <Button
              title={`Play Artemis on ${selectedArtemisCard.value}`}
              onPress={handlePlayArtemis}
            />
          )}
        </View>
      );
    } else {
      return null;
    }
  }

  // Inside your main render function:
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Card Game</Text>
      <View>
        <FlatList
          showsHorizontalScrollIndicator={false}
          data={sortedBotCards}
          renderItem={renderSortedCard}
          keyExtractor={(item, index) => `sortedCard_${index}`}
          horizontal
          style={styles.buttonContainer}
        />
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
        ListFooterComponent={() => {
          return (
            <Pressable onPress={handleSkipTurn} style={styles.skipButton}>
              <Text style={styles.cardButtonText}>Skip turn</Text>
            </Pressable>
          );
        }}
        horizontal
        style={styles.buttonContainer}
      />

      {isLastCardArtemis(game) && renderSelectCardToGiveSection()}

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

export default React.memo(GameScreen);
