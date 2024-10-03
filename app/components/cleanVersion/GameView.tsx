// App.js

import 'react-native-gesture-handler'; // Must be at the top
import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { Card, Game, playCard } from 'gameFunctions';

import { getPlayer, sortedBotCards, sortedCards } from 'app/handlers';
import PlayerCards from './PlayerCards';
import { useGameplay } from './useGameplay';
import { useCardAnimation } from './useCardAnimation';
import GameBackgroundView from './GameBackgroundView';
import GameInformations from './GameInformations';
import CardPile from './CardsPile';
import CardsPile from './CardsPile';
import ButtonAction from './ButtonAction';
import { RootState } from 'app/reducers';
import { useSelector } from 'react-redux';
import GameArtemisModal from '../GameCards/GameArtemisModal';
import GameModalArtemis from './GameModalArtemis';
import { CardAnimatedType } from './CardAnimated';

const GameView: React.FC = () => {
  const game = useSelector((state: RootState) => state.game);
  const { playCards, skipTurn } = useGameplay();

  const { moveCardsToCenter } = useCardAnimation();

  const selfPlayerCards = sortedCards(game.players);
  const opponentPlayerCards = sortedBotCards(game.players);
  const selfPlayerCardsRef = useRef<any>(null);
  const opponentPlayerCardsRef = useRef<any>(null);

  const currentPlayerId = game.currentPlayer.id;
  const cardsPlayed = game.cardsPlayed.map((card) => card.cardsPlayed).flat();
  const lastCardPlayerId = game.cardsPlayed.at(0)?.playerId;

  game.cardsPlayed?.length &&
    console.log(
      'cardsPlayed',
      game.cardsPlayed.map((c) => `${c.playerId}---${c.cardsPlayed?.length}`)
    );

  // useEffect(() => {
  //   if (!game) return;
  //   if (game.currentPlayer.id === 'bot') {
  //     playBotCards()
  //       .then((botCards) => {
  //         if (!botCards?.length) return;
  //         const cardsRef = opponentPlayerCardsRef?.current?.getCardsRef();
  //         const onCurrentCardPlayed =
  //           opponentPlayerCardsRef?.current.onCurrentCardPlayed;

  //         const foundedCards = cardsRef.filter((card) =>
  //           botCards.some((botCard) => botCard.id === card.id)
  //         );
  //         if (!foundedCards) return;
  //         moveCardsToCenter(foundedCards, true, () => {
  //           foundedCards.map((c) => {
  //             onCurrentCardPlayed(c.id);
  //           });
  //         });
  //         botCards?.length && playCards(botCards);
  //       })
  //       .catch((error) => {
  //         console.error('Error playing bot cards:', error);
  //         // Handle the error appropriately, e.g., show an error message to the user
  //       });
  //   }
  // }, [game?.currentPlayer?.id, playBotCards, opponentPlayerCardsRef]);

  if (!game) return <View />;

  return (
    <GameBackgroundView>
      <GameInformations game={game} style={styles.gameInformationsContainer} />
      <CardsPile game={game} style={styles.cardsPileContainer} />
      <PlayerCards
        ref={opponentPlayerCardsRef}
        gameCreatedAt={game.createdAt}
        currentPlayerId={currentPlayerId}
        cards={opponentPlayerCards}
        cardsPlayed={cardsPlayed}
        onCardsPlayed={playCards}
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
        gameCreatedAt={game.createdAt}
        cards={selfPlayerCards}
        cardsPlayed={cardsPlayed}
        onCardsPlayed={playCards}
        isLastPlayer={'bot' !== lastCardPlayerId}
      />
      <GameModalArtemis
        game={game}
        onArtemisCardsSelected={(gameAfterArtemisPlay: Game) =>
          dispatch(actionPlayGame(gameAfterArtemisPlay))
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
