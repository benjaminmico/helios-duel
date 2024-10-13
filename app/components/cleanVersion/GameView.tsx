// App.js

import 'react-native-gesture-handler'; // Must be at the top
import React, { RefObject, useCallback, useEffect, useRef } from 'react';
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
import CardsPile, { CardsPileHandle } from './CardsPile';
import ButtonAction from './ButtonAction';
import { RootState } from 'app/reducers';
import { useSelector } from 'react-redux';
import useCardsAnimation from './useCardsAnimation';
import { withSpring } from 'react-native-reanimated';

const GameView: React.FC = () => {
  const game = useSelector((state: RootState) => state.game);
  const { skipTurn, setCurrentPlayer } = useGameplay();
  const { onCardsPlayed, moveCardsReceivedFromDeck } = useCardsAnimation();

  const selfPlayerCards = sortedCards(game.players);
  const opponentPlayerCards = sortedBotCards(game.players);
  const cardsPlayed = game?.cardsPlayed || [];
  const deckCards = game.deck;
  const selfPlayerCardsRef = useRef<PlayerCardsHandle>(null);
  const opponentPlayerCardsRef = useRef<PlayerCardsHandle>(null);
  const deckCardsRef = useRef<CardsPileHandle>(null);

  console.log('deckCards', game.deck.length, game.deckCardsGiven.length);

  if (!game) return <View />;

  useEffect(() => {
    setTimeout(() => {
      setCurrentPlayer(game.currentPlayer);
    }, 2000);
  }, [game?.currentPlayer]);

  const onSkipTurn = async () => {
    const { drawnCard, targetPlayer } = await skipTurn();

    if (drawnCard && targetPlayer) {
      console.log('ok');
      const targetRef =
        targetPlayer.id === 'bot' ? opponentPlayerCardsRef : selfPlayerCardsRef;
      moveCardsReceivedFromDeck(deckCardsRef, targetRef, [drawnCard]);
    }
  };

  return (
    <GameBackgroundView>
      <Text
        style={{ position: 'absolute', color: 'white', top: 270, left: 200 }}
      >
        {game.currentPlayer.id}
      </Text>

      <GameInformations game={game} style={styles.gameInformationsContainer} />
      <CardsPile ref={deckCardsRef} cards={deckCards} />
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
        onPress={onSkipTurn}
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
