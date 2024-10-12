// App.js

import 'react-native-gesture-handler'; // Must be at the top
import React, { RefObject, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { ActionName, canNoPlayerPlayAnyCard, Card, Game } from 'gameFunctions';

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
  const { skipTurn } = useGameplay();
  const { onCardsPlayed } = useCardsAnimation();

  const selfPlayerCards = sortedCards(game.players);
  const opponentPlayerCards = sortedBotCards(game.players);
  const selfPlayerReceivedCards = sortedCards(game.players, 'cardsReceived');
  const opponentPlayerReceivedCards = sortedBotCards(
    game.players,
    'cardsReceived'
  );
  const cardsPlayed = game?.cardsPlayed || [];

  const selfPlayerCardsRef = useRef<PlayerCardsHandle>(null);
  const opponentPlayerCardsRef = useRef<PlayerCardsHandle>(null);

  if (!game) return <View />;

  function getPlayableCards(player: Player, game: Game): Card[] {
    // Collect all cards received by opponents
    const opponentCardsReceived = game.players
      .filter((opponent) => opponent.id !== player.id)
      .flatMap((opponent) => opponent.cardsReceived);

    // Collect all cards that have been played currently
    const playedCards = game.cardsPlayed.flatMap(
      (history) => history.cardsPlayed
    );

    // Collect all cards that have been played and discarded already
    const discardedCards = game.discardPile;

    // Add cards received by the current player from others
    const currentPlayerCards = [...player.cards, ...player.cardsReceived];

    // Filter out cards that have been given to opponents or already played
    return currentPlayerCards.filter(
      (card) =>
        !opponentCardsReceived.some(
          (receivedCard) => receivedCard.id === card.id
        ) &&
        !playedCards.some((playedCard) => playedCard.id === card.id) &&
        !discardedCards.some((playedCard) => playedCard.id === card.id)
    );
  }

  console.log(
    'bbb',
    game.players[0].id,
    getPlayableCards(game.players[1], game)?.map((c) => c.value)
  );

  return (
    <GameBackgroundView>
      <GameInformations game={game} style={styles.gameInformationsContainer} />
      <CardsPile game={game} style={styles.cardsPileContainer} />
      <PlayerCards
        ref={opponentPlayerCardsRef}
        cards={opponentPlayerCards}
        cardsPlayed={cardsPlayed}
        cardsReceived={opponentPlayerReceivedCards}
        gameCreatedAt={game.createdAt}
        onCardsPlayed={(cards: Card[]) =>
          onCardsPlayed(opponentPlayerCardsRef, selfPlayerCardsRef, cards)
        }
        isOpponent
        isOnArtemisSelection={game.action?.id === ActionName.ARTEMIS}
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
        cardsReceived={selfPlayerReceivedCards}
        gameCreatedAt={game.createdAt}
        onCardsPlayed={(cards: Card[]) =>
          onCardsPlayed(selfPlayerCardsRef, opponentPlayerCardsRef, cards)
        }
        isOnArtemisSelection={game.action?.id === ActionName.ARTEMIS}
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
