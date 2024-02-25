import GameBackgroundView from 'app/components/GameBackgroundView';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../reducers';
import GameCards from 'app/components/GameCards';
import { currentPlayerCards, handleSkipTurn } from '../handlers';
import Animated from 'react-native-reanimated';
import {
  Card,
  CardType,
  changePlayerHand,
  getWeakestCard,
  isGameOver,
  isLastCardArtemis,
  playArtemis,
  playCard,
} from 'gameFunctions';
import { StatusBar } from 'expo-status-bar';
import { actionCurrentCard, actionPlayGame } from 'app/actions/gameActions';
import { getBotCards } from 'bot/bot.service';

const startCardsAnimations = async (
  playerCardsRefs: React.MutableRefObject<Animated.View[]>,
  cardsIds: string[]
) => {
  await Promise.all(
    cardsIds.map(async (cardId: any, index: number) => {
      if (playerCardsRefs?.current?.[cardId]) {
        const cardReference = playerCardsRefs?.current[cardId];
        if (cardReference) {
          //@ts-ignore
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

  const playSelectedCards = (playedCards: Card[]) => {
    if (playedCards.length >= 1) {
      const newGame = playCard(game, game.currentPlayer, playedCards);

      if (newGame) {
        dispatch(actionPlayGame(newGame));
        const gameState = isGameOver(newGame);
        if (gameState.isOver) {
          // setShowModal(true); // Add this line
        }
      }
      if (
        newGame &&
        isLastCardArtemis(newGame) &&
        game.currentPlayer.id !== 'bot'
      ) {
        // setShouldDisplayArtemisSelection(true);
      }
      setSelectedCards([]);
    }
  };

  const boundHandleSkipTurn = useCallback(() => {
    const newGame = handleSkipTurn(game);
    dispatch(actionPlayGame(newGame));
    setSelectedCards([]);
  }, [game, dispatch]);

  const playBotTurnIfNecessary = async () => {
    if (game.currentPlayer.id === 'bot') {
      const botCards = await getBotCards(game, game.currentPlayer.id);
      if (!botCards?.length) {
        boundHandleSkipTurn();
        return;
      }

      playSelectedCards(botCards);

      let gameAfterArtemisPlay;

      botCards.forEach(async (card) => {
        if (card.type === CardType.ARTEMIS) {
          const weakestCard = getWeakestCard(game.currentPlayer); // Get the weakest card for each Artemis

          if (weakestCard) {
            gameAfterArtemisPlay = playArtemis(game, game.currentPlayer, [
              weakestCard,
            ]);
            if (gameAfterArtemisPlay) {
              dispatch(actionPlayGame(gameAfterArtemisPlay));
            }
          }
        }
      });

      setTimeout(() => actionPlayGame(changePlayerHand(game)), 2000);
    }
  };

  React.useEffect(() => {
    setTimeout(() => playBotTurnIfNecessary(), 100);
  }, [game.currentPlayer.id]);

  const onCardsSelected = async (cards: Card[]) => {
    setHasPressedCard(true);

    if (cards?.length >= 1 && cards?.[0].type === CardType.ARTEMIS) {
      setSelectedCards(cards);
      setSelectedCardOccurences(cards?.length);
      // setCurrentModal(cards?.[0].god);
      return;
    }

    const cardsPlayedIds = cards.map((card) => card.id);

    // Start card animation
    startCardsAnimations(playerCardsRefs, cardsPlayedIds);

    setTimeout(() => playSelectedCards(cards), 1400);
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
            backgroundColor: 'red',
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
