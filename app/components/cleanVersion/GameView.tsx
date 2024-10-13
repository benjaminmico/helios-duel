// App.js

import 'react-native-gesture-handler'; // Must be at the top
import React, { RefObject, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

import {
  ActionName,
  canNoPlayerPlayAnyCard,
  canPlayCard,
  Card,
  Game,
  Player,
} from 'gameFunctions';

import { sortedBotCards, sortedCards } from 'app/handlers';
import PlayerCards, { PlayerCardsHandle } from './PlayerCards';
import { useGameplay } from './useGameplay';
import GameBackgroundView from './GameBackgroundView';
import GameInformations from './GameInformations';
import CardsPile from './CardsPile';
import ButtonAction from './ButtonAction';
import { RootState } from 'app/reducers';
import { useSelector } from 'react-redux';
import useCardsAnimation from './useCardsAnimation';

const GameView: React.FC = () => {
  const game = useSelector((state: RootState) => state.game);
  const { skipTurn, setCurrentPlayer } = useGameplay();
  const { onCardsPlayed } = useCardsAnimation();

  const selfPlayerCards = sortedCards(game.players);
  const opponentPlayerCards = sortedBotCards(game.players);
  const selfPlayerReceivedCards = sortedCards(game.players, 'liveCards');
  const opponentPlayerReceivedCards = sortedBotCards(game.players, 'liveCards');
  const cardsPlayed = game?.cardsPlayed || [];

  const selfPlayerCardsRef = useRef<PlayerCardsHandle>(null);
  const opponentPlayerCardsRef = useRef<PlayerCardsHandle>(null);

  if (!game) return <View />;

  useEffect(() => {
    setTimeout(() => {
      setCurrentPlayer(game.currentPlayer);
    }, 2000);
  }, [game?.currentPlayer]);

  function getPlayableCards(game: Game): { playerId: string; cards: Card[] }[] {
    const playableCards: { playerId: string; cards: Card[] }[] = [];

    for (const player of game.players) {
      const currentPlayerCards = player.liveCards;
      const playerPlayableCards: Card[] = [];

      for (const card of currentPlayerCards) {
        const canPlay = canPlayCard(card, currentPlayerCards, game.cardsPlayed);

        if (canPlay) {
          playerPlayableCards.push(card);
        }
      }

      if (playerPlayableCards.length > 0) {
        playableCards.push({ playerId: player.id, cards: playerPlayableCards });
      }
    }

    // Log the playable cards for each player
    // for (const entry of playableCards) {
    //   console.log(
    //     `Player ${entry.playerId} can play:`,
    //     entry.cards.map((card) => card.value)
    //   );
    // }

    return playableCards; // Return the list of playable cards
  }

  getPlayableCards(game);

  return (
    <GameBackgroundView>
      <Text
        style={{ position: 'absolute', color: 'white', top: 270, left: 200 }}
      >
        {game.currentPlayer.id}
      </Text>
      <GameInformations game={game} style={styles.gameInformationsContainer} />
      <CardsPile game={game} style={styles.cardsPileContainer} />
      <PlayerCards
        ref={opponentPlayerCardsRef}
        cards={opponentPlayerCards}
        cardsPlayed={cardsPlayed}
        gameCreatedAt={game.createdAt}
        onCardsPlayed={(cards: Card[]) =>
          onCardsPlayed(opponentPlayerCardsRef, selfPlayerCardsRef, cards)
        }
        isOpponent
        isOnArtemisSelection={
          game.action?.id === ActionName.ARTEMIS &&
          game.currentPlayer.id === 'bot'
        }
        isPlayable={game.currentPlayer.id === 'bot'}
      />
      <ButtonAction
        label='Skip'
        onPress={skipTurn}
        style={styles.buttonActionContainer}
      />

      <PlayerCards
        ref={selfPlayerCardsRef}
        cards={selfPlayerCards}
        cardsPlayed={cardsPlayed}
        gameCreatedAt={game.createdAt}
        onCardsPlayed={(cards: Card[]) =>
          onCardsPlayed(selfPlayerCardsRef, opponentPlayerCardsRef, cards)
        }
        isOnArtemisSelection={
          game.action?.id === ActionName.ARTEMIS &&
          game.currentPlayer.id !== 'bot'
        }
        isPlayable={game.currentPlayer.id !== 'bot'}
      />
    </GameBackgroundView>
  );
};

const styles = StyleSheet.create({
  gameInformationsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  cardsPileContainer: {
    position: 'absolute',
    top: '45%',
    left: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  buttonActionContainer: { position: 'absolute', bottom: 170, left: 10 },
});

export default GameView;
