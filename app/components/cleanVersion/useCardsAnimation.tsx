import { RefObject, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  withSpring,
  SharedValue,
  useSharedValue,
} from 'react-native-reanimated';
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
import { calculatePlayedCardZIndex, getLatestCardPlayed } from './utils';
import { Card, CardHistory } from 'gameFunctions';
import { PlayerCardsHandle } from './PlayerCards';
import { useGameplay } from './useGameplay';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type CardAnimatedProps = {
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
  scaleX: SharedValue<number>;
  scaleY: SharedValue<number>;
  playedAt?: string;
  playable?: boolean;
  isOut?: boolean;
};

export type CardAnimatedType = { card: Card } & CardAnimatedProps;

const useCardsAnimation = () => {
  const game = useSelector((state: RootState) => state.game);
  const { playCards, playArtemis, skipTurn } = useGameplay();

  const dispatch = useDispatch();

  const initAnimatedProps: CardAnimatedProps = {
    offsetX: useSharedValue(0),
    offsetY: useSharedValue(0),
    scaleX: useSharedValue(1),
    scaleY: useSharedValue(1),
    playedAt: '',
    playable: true,
    isOut: false,
  };

  const initializeCardPositions = (
    cardsRef: React.MutableRefObject<CardAnimatedType[]>,
    isOpponent: boolean
  ) => {
    if (!cardsRef?.current?.length) return;
    const CARD_MARGIN = isOpponent ? -40 : -30;
    const CARDS_PER_ROW = isOpponent ? 9999 : 9;

    const handCards = cardsRef.current
      .filter((c) => c.playedAt === '') // Filter only cards with playedAt as an empty string
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

  const reorganizeAndSortCards = (
    cardsRef: React.MutableRefObject<CardAnimatedType[]>,
    isOpponent: boolean
  ) => {
    if (!cardsRef?.current?.length) return;

    // Sort cards by their value
    cardsRef.current.sort(
      (a, b) => Number(a.card.value) - Number(b.card.value)
    );

    const CARD_MARGIN = isOpponent ? -40 : -30;
    const CARDS_PER_ROW = isOpponent ? 14 : 9;

    const handCards = cardsRef.current.filter((c) => !c.playedAt);
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
    (card: CardAnimatedType, cardPlayedMultiplePosition?: number) => {
      const { offsetX, offsetY, scaleX, scaleY } = card;

      card.playedAt = new Date(Date.now()).toISOString();

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
  const moveCardOut = useCallback(
    (card: CardAnimatedType) => {
      const { offsetX } = card;

      const offScreenX = screenWidth + CARD_WIDTH; // Move out of the screen on the right

      // Animate to center
      offsetX.value = withSpring(offScreenX, {
        stiffness: 50,
        damping: 20,
      });

      card.isOut = true;
    },
    [dispatch, game]
  );

  const moveCardsToCenter = useCallback(
    (cards: CardAnimatedType[]) => {
      if (cards?.length === 1) {
        moveCardToCenter(cards[0]);
        return;
      }

      cards.forEach((card, index) => {
        moveCardToCenter(card, index);
      });
    },
    [dispatch, game]
  );

  const moveCardsOut = useCallback(
    (cards: CardAnimatedType[]) => {
      if (cards?.length === 1) {
        moveCardOut(cards[0]);
        return;
      }

      cards.forEach((card, index) => {
        moveCardOut(card);
      });
    },
    [dispatch, game]
  );

  const onCardsPlayed = (
    cardsRef: RefObject<PlayerCardsHandle>,
    targetCardsRef: RefObject<PlayerCardsHandle>,
    cards: Card[]
  ) => {
    if (!game?.cardsPlayed?.length) {
      playCards(cards);
      return;
    }

    const latestCardPlayedValue = getLatestCardPlayed(game.cardsPlayed)?.value;
    if (latestCardPlayedValue === 'ARTEMIS') {
      const currentIndex = cardsRef?.current
        ?.getCardsRef()
        .findIndex((c) => c.card.id === cards[0].id);

      // Get Card Ref to add
      const cardRef =
        currentIndex && cardsRef.current?.getCardsRef()[currentIndex];

      if (!cardRef) return;

      cardRef.playedAt = '';

      // Add Card to the target player
      currentIndex &&
        cardRef &&
        targetCardsRef?.current?.handleAddCard(cardRef);

      playArtemis(cards);

      // Remove Card to the current player
      cardsRef?.current?.handleRemoveCard(cards);

      return;
    }
    playCards(cards);
  };

  return {
    initAnimatedProps,
    reorganizeAndSortCards,
    initializeCardPositions,
    moveCardsToCenter,
    moveCardsOut,
    onCardsPlayed,
  };
};

export default useCardsAnimation;
