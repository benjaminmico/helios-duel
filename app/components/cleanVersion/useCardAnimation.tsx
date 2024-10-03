import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withSpring, runOnJS, SharedValue } from 'react-native-reanimated';
import { RootState } from 'app/reducers';
// import { actionPlayGame } from 'app/actions/gameActions';
import { Card as CardType, changePlayerHand } from 'gameFunctions';
import {
  CARD_HIDDEN_HEIGHT,
  CARD_HIDDEN_WIDTH,
  CARD_PLAYABLE_HEIGHT,
  CARD_PLAYABLE_WIDTH,
  CARD_PREVIEW_HEIGHT,
  CARD_PREVIEW_WIDTH,
} from './Card';
import { Dimensions } from 'react-native';
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CardAnimatedType,
  CARDS_PER_ROW,
} from './CardAnimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type CardAnimatedProps = {
  isPlayed: boolean;
  playedAt?: string;
  playedBy?: string;
  zIndex: number;
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
  scaleX: SharedValue<number>;
  scaleY: SharedValue<number>;
};

export const useCardAnimation = () => {
  const game = useSelector((state: RootState) => state.game);
  const dispatch = useDispatch();

  const moveCardToCenter = useCallback(
    (card: CardAnimatedType, isOpponent: boolean) => {
      const { id, isPlayed, offsetX, offsetY, scaleX, scaleY } = card;

      card.playedAt = new Date(Date.now()).toISOString();
      card.playedBy = isOpponent ? 'opponent' : 'self';
      card.zIndex = calculateCardZIndex(game.createdAt, card.playedAt);

      if (isOpponent) {
        // Handle opponent card logic
      }
      // dispatch(actionPlayGame(changePlayerHand(game)));

      if (isPlayed) return;

      const centerX = screenWidth / 2 - CARD_WIDTH / 2;
      const centerY = screenHeight / 2 - CARD_HEIGHT / 2 + 50;

      // Animate to center
      offsetX.value = withSpring(centerX, {
        stiffness: 300,
        damping: 20,
      });
      offsetY.value = withSpring(centerY, {
        stiffness: 300,
        damping: 20,
      });

      const scaleXValue = CARD_PREVIEW_WIDTH / CARD_HIDDEN_WIDTH;
      const scaleYValue = CARD_PREVIEW_HEIGHT / CARD_HIDDEN_HEIGHT;

      scaleX.value = withSpring(scaleXValue, {
        stiffness: 300,
      });
      scaleY.value = withSpring(scaleYValue, {
        stiffness: 300,
      });
    },
    [dispatch, game]
  );
  const moveOneOfMultipleCardToCenter = useCallback(
    (card: CardAnimatedType, position: number, isOpponent: boolean) => {
      const { id, isPlayed, offsetX, offsetY, scaleX, scaleY } = card;

      const index = position;

      if (isOpponent) {
        // Handle opponent card logic
      }
      // dispatch(actionPlayGame(changePlayerHand(game)));

      if (isPlayed) return;

      const centerX = screenWidth / 2 - CARD_WIDTH / 2;
      const centerY = screenHeight / 2 - CARD_HEIGHT / 2;

      // Animate to center
      offsetX.value = withSpring(
        centerX - 10 + index * 30,
        {
          stiffness: 300,
          damping: 20,
        }
        // () => {
        //   runOnJS(onCardPlayed)(id);
        // }
      );
      offsetY.value = withSpring(centerY, {
        stiffness: 300,
        damping: 20,
      });
      scaleX.value = withSpring(CARD_PREVIEW_WIDTH / CARD_PLAYABLE_WIDTH, {
        stiffness: 300,
      });
      scaleY.value = withSpring(CARD_PREVIEW_HEIGHT / CARD_PLAYABLE_HEIGHT, {
        stiffness: 300,
      });
    },
    [dispatch, game]
  );

  const moveCardsToCenter = useCallback(
    (
      cards: CardAnimatedType[],
      isOpponent: boolean,
      onCardsPlayed: () => void
    ) => {
      if (cards?.length === 1) {
        moveCardToCenter(cards[0], isOpponent);
        onCardsPlayed();
        return;
      }

      cards.forEach((card, index) => {
        moveOneOfMultipleCardToCenter(card, index, isOpponent);
      });
      onCardsPlayed();
    },
    [dispatch, game]
  );

  return {
    moveCardsToCenter,
  };
};

export const getCardZIndex = (
  card: CardAnimatedType,
  cardsPlayer: CardType[],
  cardsPlayed: CardType[],
  gameCreatedAt: string
) => {
  const cardCurrentIndex = cardsPlayer
    ?.filter(
      (c: CardType) => !cardsPlayed.find((cp: CardType) => cp.id === c.id)
    )
    ?.findIndex((c: CardType) => c.id === card.id);

  if (!!card.playedAt && !!card.playedBy) {
    return calculateCardZIndex(gameCreatedAt, card.playedAt);
  }
  if (cardCurrentIndex >= CARDS_PER_ROW) {
    return cardCurrentIndex || 0;
  }
  return Number(`11${cardCurrentIndex || 0}`);
};

const calculateCardZIndex = (createdAt: string, playedAt: string): number => {
  const createdAtDate = new Date(createdAt);
  const playedAtDate = new Date(playedAt);

  // Calculate the time difference in milliseconds
  const timeDifference = playedAtDate.getTime() - createdAtDate.getTime();

  // If playedAt is after createdAt, the timeDifference will be positive, we can map that to zIndex
  const zIndex = timeDifference > 0 ? Math.ceil(timeDifference / 1000) : 1;

  return zIndex;
};
