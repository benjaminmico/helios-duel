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
  CardType,
  Player,
  calculateCardValue,
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

  const [selectedCards, setSelectedCards] = React.useState<Card[]>([]);
  const [selectedArtemisCards, setSelectedArtemisCards] = React.useState<
    Card[]
  >([]);

  const handleSelectArtemisCard = (card: Card) => {
    console.log('onPress');
    const lastCardPlayedCount =
      (game.cardsHistory?.length &&
        game.cardsHistory[0]?.cardsPlayed?.length) ||
      undefined;

    // Check if the card is already selected
    if (
      selectedArtemisCards.some((selectedCard) => selectedCard.id === card.id)
    ) {
      // Card is already selected, so remove it from the selection
      const updatedSelectedArtemisCards = selectedArtemisCards.filter(
        (selectedCard) => selectedCard.id !== card.id
      );
      setSelectedArtemisCards(updatedSelectedArtemisCards);
    } else {
      if (!lastCardPlayedCount) return;
      // Card is not selected, so add it to the selection
      if (selectedArtemisCards.length < lastCardPlayedCount) {
        setSelectedArtemisCards([...selectedArtemisCards, card]);
      } else {
        console.log(
          'Cannot select more Artemis cards than the number of cards played in the last turn'
        );
      }
    }
  };

  const handlePlayCard = (card: Card) => {
    const lastCardPlayedCount =
      (game.cardsHistory?.length &&
        game.cardsHistory[0]?.cardsPlayed?.length) ||
      undefined;

    if (isCardAlreadySelected(card)) {
      const updatedSelectedCards = selectedCards.filter(
        (selectedCard) => selectedCard.id !== card.id
      );
      setSelectedCards(updatedSelectedCards);
      return;
    }

    // Check if there are already selected cards
    if (selectedCards.length > 0) {
      // Get the value of the first selected card
      const firstSelectedCardValue = selectedCards[0].value;

      // Only allow selecting cards with the same value
      if (card.value !== firstSelectedCardValue) {
        console.log(
          'Cannot select this card. Only cards with value',
          firstSelectedCardValue,
          'can be selected.'
        );
        return;
      }

      // Check if the number of selected cards is already equal to the number of cards played by the last player
      if (lastCardPlayedCount && selectedCards.length >= lastCardPlayedCount) {
        console.log(
          'Cannot select more cards. You can only play',
          lastCardPlayedCount,
          'cards.'
        );
        return;
      }
    }

    setSelectedCards([...selectedCards, card]);
  };
  const handleSkipTurn = () => {
    const newGame = rollDiceAndSkipTurn(game);
    if (newGame) {
      dispatch(actionPlayGame(newGame));
    }
    setSelectedCards([]);
  };

  const handlePlayArtemis = () => {
    if (selectedArtemisCards.length > 0) {
      const newGame = playArtemis(
        game,
        game.currentPlayer,
        selectedArtemisCards
      );
      if (newGame) {
        dispatch(actionPlayGame(newGame));
      }
      setSelectedArtemisCards([]); // Reset selected Artemis cards
      setSelectedCards([]); // Reset selected cards
    }
  };

  const playSelectedCards = (playedCards: Card[]) => {
    if (playedCards.length >= 1) {
      const newGame = playCard(game, game.currentPlayer, playedCards);
      if (newGame) {
        dispatch(actionPlayGame(newGame));
      }
      setSelectedCards([]);
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

      // Check for each Artemis card played by the bot
      botCards.forEach(async (card) => {
        if (card.type === CardType.ARTEMIS) {
          const weakestCard = getWeakestCard(currentPlayer); // Get the weakest card for each Artemis

          if (weakestCard) {
            const artemisPlay = playArtemis(game, currentPlayer, [weakestCard]);
            if (artemisPlay) {
              dispatch(actionPlayGame(artemisPlay));
            }
          }
        }
      });
    }
  };

  React.useEffect(() => {
    setTimeout(() => playBotTurnIfNecessary(), 100);
  }, [game.currentPlayer.id]);

  const isCardAlreadySelected = (card: Card) => {
    return selectedCards.some((selectedCard) => selectedCard.id === card.id);
  };

  const isButtonDisabled = selectedCards.length === 0;

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
    if (game.currentPlayer.id !== 'bot') return;
    if (isLastCardArtemis(game)) {
      // Sort cards from weakest to highest
      const sortedCards = currentPlayerCards
        .slice()
        .sort((a, b) => calculateCardValue(a) - calculateCardValue(b));

      return (
        <View>
          <Text>Select cards to give to another player:</Text>
          {sortedCards.map((card, index) => (
            <Pressable
              key={`artemisCard_${index}_${card.type}_${card.value}`}
              onPress={() => handleSelectArtemisCard(card)}
              style={[
                styles.cardButton,
                {
                  backgroundColor: selectedArtemisCards.includes(card)
                    ? 'green'
                    : 'black',
                  opacity: selectedArtemisCards.includes(card) ? 0.3 : 1.0,
                },
              ]}
            >
              <Text style={styles.cardButtonText}>{card.value.toString()}</Text>
            </Pressable>
          ))}
          {selectedArtemisCards.length > 0 && (
            <Button
              title={`Play Artemis on selected cards`}
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

      {renderSelectCardToGiveSection()}

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
