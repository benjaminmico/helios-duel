// App.js

import 'react-native-gesture-handler'; // Must be at the top
import React, { RefObject, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { Card, Game } from 'gameFunctions';

import { sortedBotCards, sortedCards } from 'app/handlers';
import PlayerCards, { PlayerCardsHandle } from './PlayerCards';
import { useGameplay } from './useGameplay';
import GameBackgroundView from './GameBackgroundView';
import GameInformations from './GameInformations';
import CardsPile from './CardsPile';
import ButtonAction from './ButtonAction';
import { RootState } from 'app/reducers';
import { useSelector } from 'react-redux';
import GameModalArtemis from './GameModalArtemis';
import { getLatestCardPlayed } from './utils';
import useCardsAnimation, { CardAnimatedType } from './useCardsAnimation';

const GameView: React.FC = () => {
  const game = useSelector((state: RootState) => state.game);
  const { playCards, playArtemis, skipTurn } = useGameplay();
  const { onCardsPlayed } = useCardsAnimation();

  const selfPlayerCards = sortedCards(game.players);
  const opponentPlayerCards = sortedBotCards(game.players);
  const opponentPlayerArtemisCards = sortedBotCards(
    game.players,
    'cardsArtemisReceived'
  );
  const cardsPlayed = game?.cardsPlayed || [];

  const selfPlayerCardsRef = useRef<PlayerCardsHandle>(null);
  const opponentPlayerCardsRef = useRef<PlayerCardsHandle>(null);

  if (!game) return <View />;

  return (
    <GameBackgroundView>
      <GameInformations game={game} style={styles.gameInformationsContainer} />
      <CardsPile game={game} style={styles.cardsPileContainer} />
      <PlayerCards
        ref={opponentPlayerCardsRef}
        cards={opponentPlayerCards}
        cardsPlayed={cardsPlayed}
        cardsArtemisReceived={opponentPlayerArtemisCards}
        gameCreatedAt={game.createdAt}
        onCardsPlayed={(cards: Card[]) =>
          onCardsPlayed(opponentPlayerCardsRef, selfPlayerCardsRef, cards)
        }
        isOpponent
      />
      {game.currentPlayer.id !== 'bot' && (
        <ButtonAction
          label='Skip'
          onPress={skipTurn}
          style={styles.buttonActionContainer}
        />
      )}
      <PlayerCards
        ref={selfPlayerCardsRef}
        cards={selfPlayerCards}
        cardsPlayed={cardsPlayed}
        cardsArtemisReceived={[]}
        gameCreatedAt={game.createdAt}
        onCardsPlayed={(cards: Card[]) =>
          onCardsPlayed(selfPlayerCardsRef, opponentPlayerCardsRef, cards)
        }
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
