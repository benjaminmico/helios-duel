// App.js

import 'react-native-gesture-handler'; // Must be at the top
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { Game } from 'gameFunctions';

import { sortedBotCards, sortedCards } from 'app/handlers';
import PlayerCards from './PlayerCards';
import { useGameplay } from './useGameplay';
import GameBackgroundView from './GameBackgroundView';
import GameInformations from './GameInformations';
import CardsPile from './CardsPile';
import ButtonAction from './ButtonAction';
import { RootState } from 'app/reducers';
import { useSelector } from 'react-redux';
import GameModalArtemis from './GameModalArtemis';

const GameView: React.FC = () => {
  const game = useSelector((state: RootState) => state.game);
  const { playCards, skipTurn } = useGameplay();

  const selfPlayerCards = sortedCards(game.players);
  const opponentPlayerCards = sortedBotCards(game.players);
  const cardsPlayed = game.cardsPlayed;

  const selfPlayerCardsRef = useRef<any>(null);
  const opponentPlayerCardsRef = useRef<any>(null);

  console.log('gaaame', game?.cardsPlayed?.length);

  //  const cardsPlayed = game.cardsPlayed.map((card) => card.cardsPlayed).flat();

  game.cardsPlayed?.length &&
    console.log(
      'cardsPlayed',
      game.cardsPlayed.map((c) => `${c.playerId}---${c.cardsPlayed?.[0].value}`)
    );

  if (!game) return <View />;

  return (
    <GameBackgroundView>
      <GameInformations game={game} style={styles.gameInformationsContainer} />
      <CardsPile game={game} style={styles.cardsPileContainer} />
      <PlayerCards
        ref={opponentPlayerCardsRef}
        cards={opponentPlayerCards}
        cardsPlayed={cardsPlayed}
        gameCreatedAt={game.createdAt}
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
        cards={selfPlayerCards}
        cardsPlayed={cardsPlayed}
        gameCreatedAt={game.createdAt}
        onCardsPlayed={playCards}
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
