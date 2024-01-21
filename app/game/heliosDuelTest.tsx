import GameBackgroundView from 'app/components/GameBackgroundView';
import React, { FunctionComponent, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../reducers';
import GameCards from 'app/components/GameCards';
import { currentPlayerCards } from '../handlers';
import Animated from 'react-native-reanimated';
import { Card, CardType, isGameOver, playCard } from 'gameFunctions';
import { StatusBar } from 'expo-status-bar';
import { actionPlayGame } from 'app/actions/gameActions';

const startCardsAnimations = async (
  playerCardsRefs: React.MutableRefObject<Animated.View[]>,
  cardsIds: string[]
) => {
  console.log('startCardsAnimations');
  await Promise.all(
    cardsIds.map(async (cardId: string, index: number) => {
      if (
        playerCardsRefs &&
        playerCardsRefs.current &&
        playerCardsRefs.current[cardId]
      ) {
        const cardReference = playerCardsRefs?.current[cardId];
        if (cardReference) {
          await cardReference.startPlayAnimation(index);
        }
      }
    })
  );
};

const HeliosDuelTest: FunctionComponent = () => {
  const game = useSelector((state: RootState) => state.game);
  const [selectedCards, setSelectedCards] = useState<Card[] | undefined>();
  const [selectedCardOccurences, setSelectedCardOccurences] =
    useState<number>();
  const [hasPressedCard, setHasPressedCard] = useState<boolean>(false);
  const dispatch = useDispatch();

  const playerCardsRefs = useRef<Animated.View[]>([]);

  const onCardsSelected = async (cards: Card[]) => {
    setHasPressedCard(true);

    // if (cards?.length >= 1 && cards?.[0].type === CardType.ARTEMIS) {
    //   setSelectedCards(cards);
    //   setSelectedCardOccurences(cards?.length);
    //   // setCurrentModal(cards?.[0].god);
    //   return;
    // }

    const cardsPlayedIds = cards.map((card) => card.id);

    if (cards.length >= 1) {
      const newGame = playCard(game, game.currentPlayer, cards);

      if (newGame) {
        dispatch(actionPlayGame(newGame));
        const gameState = isGameOver(newGame);
        // if (gameState.isOver) {
        //   setShowModal(true); // Add this line
        //   // ... handle end game logic here
        // }
      }
      // if (newGame && isLastCardArtemis(newGame) && currentPlayer.id !== 'bot') {
      //   setShouldDisplayArtemisSelection(true);
      // }
      setSelectedCards([]);
    }

    // Start card animation
    await startCardsAnimations(playerCardsRefs, cardsPlayedIds);

    // playPresident(cards.map((card) => card.id));
  };

  return (
    <GameBackgroundView>
      <StatusBar style='light' />
      <View style={styles.container}>
        <GameCards
          style={{
            position: 'absolute',
            bottom: 0,
            alignSelf: 'center',
          }}
          playerCardsRefs={playerCardsRefs}
          game={game}
          onCardsSelected={onCardsSelected}
        />
      </View>
    </GameBackgroundView>
  );
};

export default HeliosDuelTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});