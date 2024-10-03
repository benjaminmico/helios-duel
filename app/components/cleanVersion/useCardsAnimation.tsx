import { RefObject, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withSpring, SharedValue } from 'react-native-reanimated';
import { RootState } from 'app/reducers';
// import { actionPlayGame } from 'app/actions/gameActions';
import {
  CARD_HIDDEN_HEIGHT,
  CARD_HIDDEN_WIDTH,
  CARD_PLAYABLE_HEIGHT,
  CARD_PLAYABLE_WIDTH,
  CARD_PREVIEW_HEIGHT,
  CARD_PREVIEW_WIDTH,
} from './Card';
import { Dimensions } from 'react-native';
import { CARD_HEIGHT, CARD_WIDTH } from './CardAnimated';
import { calculatePlayedCardZIndex } from './utils';
import { Card, CardHistory } from 'gameFunctions';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type CardAnimatedProps = {
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
  scaleX: SharedValue<number>;
  scaleY: SharedValue<number>;
  playedAt?: string;
  playable?: boolean;
};

export type CardAnimatedType = { card: Card } & CardAnimatedProps;

const useCardsAnimation = () => {
  const game = useSelector((state: RootState) => state.game);
  const dispatch = useDispatch();

  const initializeCardPositions = (
    cardsRef: React.MutableRefObject<CardAnimatedType[]>,
    isOpponent: boolean
  ) => {
    const CARD_MARGIN = isOpponent ? -40 : -30;
    const CARDS_PER_ROW = isOpponent ? 14 : 9;

    const handCards = cardsRef.current
      .filter((c) => !c.playedAt)
      .sort((a, b) => Number(a.card.value) - Number(b.card.value));
    const totalCards = handCards.length;
    const numberOfRows = Math.ceil(totalCards / CARDS_PER_ROW);

    const rows = Array.from({ length: numberOfRows }, (_, i) => {
      const startIdx = i * CARDS_PER_ROW;
      return handCards.slice(startIdx, startIdx + CARDS_PER_ROW);
    });

    const startY = isOpponent ? 90 : screenHeight - 90;
    const rowHeight = CARD_HEIGHT - 20;

    rows.forEach((rowCards, rowIndex) => {
      const totalRowWidth =
        rowCards.length * CARD_WIDTH + (rowCards.length - 1) * CARD_MARGIN;
      const rowStartX = (screenWidth - totalRowWidth) / 2;

      rowCards.forEach((card, colIndex) => {
        const x = rowStartX + colIndex * (CARD_WIDTH + CARD_MARGIN);
        const y = startY - rowIndex * rowHeight;

        card.offsetX.value = withSpring(x, { stiffness: 100, damping: 20 });
        card.offsetY.value = withSpring(y, { stiffness: 300, damping: 20 });
      });
    });
  };

  const moveCardToCenter = useCallback(
    (
      card: CardAnimatedType,
      isOpponent: boolean,
      cardPlayedMultiplePosition?: number
    ) => {
      const { offsetX, offsetY, scaleX, scaleY } = card;

      card.playedAt = new Date(Date.now()).toISOString();

      if (isOpponent) {
        // Handle opponent card logic
      }

      let centerX = screenWidth / 2 - CARD_WIDTH / 2;
      const centerY = screenHeight / 2 - CARD_HEIGHT / 2;

      centerX =
        cardPlayedMultiplePosition !== undefined
          ? centerX - 10 + cardPlayedMultiplePosition * 30
          : centerX;

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

  const moveCardsToCenter = useCallback(
    (cards: CardAnimatedType[], isOpponent: boolean) => {
      if (cards?.length === 1) {
        moveCardToCenter(cards[0], isOpponent);
        // onCardsPlayed();
        return;
      }

      cards.forEach((card, index) => {
        moveCardToCenter(card, isOpponent, index);
      });
    },
    [dispatch, game]
  );

  return {
    initializeCardPositions,
    moveCardsToCenter,
  };
};

export default useCardsAnimation;
