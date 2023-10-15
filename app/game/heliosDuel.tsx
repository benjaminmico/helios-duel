import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Player,
  Card,
  playCard,
  skipTurn,
  Game,
  canPlayMultipleCards,
  canPlayCard,
  rollDiceAndSkipTurn,
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
  const [lastCardPlayedCount, setLastCardPlayedCount] = useState<number>(0);

  console.log('sssss', selectedCards);

  const handlePlayCard = (player: Player, card: Card) => {
    const isPlayerTurn = player === game.currentPlayer;
    const lastCardPlayed =
      game.cardsHistory.length > 0 ? game.cardsHistory[0].cardsPlayed[0] : null;

    const foundedLastCardPlayed =
      game.cardsHistory.length > 0 ? game.cardsHistory[0].cardsPlayed : null;

    if (foundedLastCardPlayed?.length !== lastCardPlayedCount)
      setLastCardPlayedCount(foundedLastCardPlayed?.length || 0);

    if (
      selectedCards.length &&
      selectedCards[0].position &&
      card.position !== selectedCards[0].position
    ) {
      const newSelectedCards = [...selectedCards];
      const cardIndex = newSelectedCards.findIndex(
        (selectedCard) => selectedCard.id === card.id
      );

      if (cardIndex !== -1) {
        // La carte est déjà sélectionnée, donc nous la retirons de la sélection
        newSelectedCards.splice(cardIndex, 1);
      }
      console.log('AAAA');
      setSelectedCards(newSelectedCards);
      return;
    }

    if (
      foundedLastCardPlayed &&
      foundedLastCardPlayed?.length === selectedCards?.length
    ) {
      const newSelectedCards = [...selectedCards];
      const cardIndex = newSelectedCards.findIndex(
        (selectedCard) =>
          selectedCard.type === card.type && selectedCard.value === card.value
      );
      if (cardIndex !== -1) {
        console.log('BBBBB', cardIndex);

        // La carte est déjà sélectionnée, donc nous la retirons de la sélection
        newSelectedCards.splice(cardIndex, 1);
      }
      setSelectedCards(newSelectedCards);
      return;
    }

    if (isPlayerTurn) {
      const newSelectedCards = [...selectedCards];

      if (
        !lastCardPlayed ||
        (newSelectedCards.length === 0 && card.position === card.position) ||
        (newSelectedCards.length > 0 &&
          newSelectedCards[0].position === card.position &&
          newSelectedCards.length < 2 &&
          card.position >= lastCardPlayed.position)
      ) {
        const cardIndex = newSelectedCards.findIndex(
          (selectedCard) =>
            selectedCard.type === card.type && selectedCard.value === card.value
        );

        if (cardIndex !== -1) {
          // La carte est déjà sélectionnée, donc nous la retirons de la sélection
          newSelectedCards.splice(cardIndex, 1);
        } else {
          // La carte n'est pas sélectionnée, nous l'ajoutons à la sélection
          newSelectedCards.push(card);
        }
      }

      setSelectedCards(newSelectedCards);
    }
  };

  // Function to handle player's turn when they skip their turn
  const handleSkipTurn = () => {
    const newGame = rollDiceAndSkipTurn(game);
    if (newGame) {
      dispatch(actionPlayCard(newGame));
    }
    setSelectedCards([]); // Clear selected cards after skipping turn
    setLastCardPlayedCount(0);
  };

  // Function to play the selected cards
  const playSelectedCards = (playedCards: Card[]) => {
    console.log('playedCards', playedCards);
    const newGame = playCard(game, game.currentPlayer, playedCards);

    console.log('newGame', newGame);

    if (playedCards.length >= 1) {
      const newGame = playCard(game, game.currentPlayer, playedCards);
      if (newGame) {
        dispatch(actionPlayCard(newGame));
      }
      setSelectedCards([]); // Clear selected cards after playing
      setLastCardPlayedCount(0);
    }
  };

  const playBotTurnIfNecessary = async () => {
    console.log('PLAYER BOT');
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

  // Handle bot's turn when the component mounts
  React.useEffect(() => {
    setTimeout(() => playBotTurnIfNecessary(), 100);
  }, [game.currentPlayer.id]);

  // Sort the player's cards in ascending order
  const sortedCards = game.players
    .find((player) => player.id !== 'bot')
    .cards.sort((a, b) => a.position - b.position);

  const gameCards = game.cardsHistory.map((card) => {
    return {
      playerId: card.playerId,
      cardsPlayed: card.cardsPlayed.map((c) => c.value),
    };
  });

  console.log('LLL', lastCardPlayedCount, selectedCards?.length);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Card Game</Text>
      <View>
        <Text>Current Player: {game.currentPlayer.id}</Text>
        {}
        <Text>Cards Played: </Text>
        {gameCards.map((card, item) => {
          return <Text key={item}>{JSON.stringify(card)}</Text>;
        })}
      </View>
      <View style={styles.buttonContainer}>
        {sortedCards.map((card, index) => {
          const canPlay = canPlayCard(game, game.currentPlayer, card);
          const isCardSelected = selectedCards.some(
            (selectedCard) =>
              selectedCard.type === card.type &&
              selectedCard.value === card.value
          );

          return (
            <Pressable
              key={`${game.currentPlayer.id}_${index}_${card.type}_${card.value}`}
              onPress={() => handlePlayCard(game.currentPlayer, card)}
              disabled={!canPlay}
              style={{
                width: 60,
                height: 90,
                marginHorizontal: 4,
                padding: 16,
                backgroundColor: isCardSelected ? 'green' : 'black',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: canPlay ? 1.0 : 0.3,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '800',
                }}
              >
                {card.value.toString()}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={handleSkipTurn}
          style={{
            marginHorizontal: 4,
            padding: 16,
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '800' }}>Skip turn</Text>
        </Pressable>
      </View>
      <Button
        title='Play Selected Cards'
        onPress={() => playSelectedCards(selectedCards)}
        disabled={
          selectedCards?.length < lastCardPlayedCount ||
          selectedCards.length === 0
        }
      />
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
