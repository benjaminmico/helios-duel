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
import {
  Card,
  CardHistory,
  CardType,
  isSpecialCard,
  specialCards,
} from 'gameFunctions';
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
  isTurnedOff?: boolean;
};

export type CardAnimatedType = { card: Card } & CardAnimatedProps;

const useCardsAnimation = () => {
  const game = useSelector((state: RootState) => state.game);
  const { playCards, playArtemis } = useGameplay();

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

  const moveArtemisCards = (
    cardsRef: RefObject<PlayerCardsHandle>,
    targetCardsRef: RefObject<PlayerCardsHandle>,
    cards: Card[]
  ) => {
    cards.forEach((card) => {
      const cardRef = cardsRef?.current
        ?.getCardsRef()
        .find((c) => c && c?.card?.id === card?.id);

      if (cardRef === undefined) return;

      cardRef.playedAt = '';

      if (cardRef?.card?.value) {
        targetCardsRef?.current?.handleAddCard(cardRef);
      }
    });

    cardsRef?.current?.handleRemoveCards(cards);
  };

  const moveHadesCards = (
    cardsRef: RefObject<PlayerCardsHandle>,
    targetCardsRef: RefObject<PlayerCardsHandle>,
    cards: Card[]
  ) => {
    const length = targetCardsRef?.current?.getCardsRef()?.length;
    if (!length) return;

    const numCardsToMove = cards.length;

    const highestCardsHadesRefs = targetCardsRef.current
      ?.getCardsRef()
      .filter((cardRef) => !cardRef.playedAt) // Exclude played cards
      .slice(-numCardsToMove);

    if (!highestCardsHadesRefs || highestCardsHadesRefs.length < numCardsToMove)
      return;

    // Add Cards to the current player
    highestCardsHadesRefs.forEach((cardRef) => {
      cardsRef?.current?.handleAddCard(cardRef);
    });

    // Remove Cards from the target player
    targetCardsRef?.current?.handleRemoveCards(
      highestCardsHadesRefs.map((cardRef) => cardRef.card)
    );
  };

  const moveHypnosCards = (
    targetCardsRef: RefObject<PlayerCardsHandle>,
    cards: Card[]
  ) => {
    const length = targetCardsRef?.current?.getCardsRef()?.length;

    if (!length) return;

    const numCardsToMove = cards.length;

    const highestCardsHypnosRefs = targetCardsRef.current
      ?.getCardsRef()
      .filter((cardRef) => !cardRef.playedAt) // Exclude played cards
      .slice(-numCardsToMove);

    if (
      !highestCardsHypnosRefs ||
      highestCardsHypnosRefs.length < numCardsToMove
    )
      return;

    highestCardsHypnosRefs.forEach((cardRef) => {
      // Directly modify the properties of the cardRef.card
      cardRef.card.id = cardRef.card.id;
      cardRef.card.position = 2;
      cardRef.card.isTurnedOff = true;

      cardRef.offsetX.value = withSpring(0, {
        stiffness: 100,
        damping: 20,
      });

      // Ensure that the card is removed and added correctly
      targetCardsRef?.current?.handleRemoveCards([cardRef.card]);
      targetCardsRef?.current?.handleAddCard(cardRef);
    });
  };

  const onCardsPlayed = (
    cardsRef: RefObject<PlayerCardsHandle>,
    targetCardsRef: RefObject<PlayerCardsHandle>,
    cards: Card[]
  ) => {
    const latestCardPlayed = getLatestCardPlayed(game.cardsPlayed);
    const isLatestCardPlayedByCurrentPlayer =
      game?.cardsPlayed?.[0]?.playerId === game.currentPlayer.id;

    const handleArtemisCard = () => {
      moveArtemisCards(cardsRef, targetCardsRef, cards);
      playArtemis(cards);
    };

    const handleHadesCard = () => {
      moveHadesCards(cardsRef, targetCardsRef, cards);
    };

    const handleHypnosCard = () => {
      moveHypnosCards(targetCardsRef, cards);
    };

    if (
      latestCardPlayed?.value === CardType.ARTEMIS &&
      !latestCardPlayed?.isArtemisCardGiven &&
      isSpecialCard(CardType.ARTEMIS, latestCardPlayed.position) &&
      isLatestCardPlayedByCurrentPlayer
    ) {
      handleArtemisCard();
      return;
    } else if (
      cards[0].value === CardType.HADES &&
      isSpecialCard(CardType.HADES, cards[0].position)
    ) {
      handleHadesCard();
    } else if (
      cards[0].value === CardType.HYPNOS &&
      isSpecialCard(CardType.HYPNOS, cards[0].position)
    ) {
      handleHypnosCard();
    }

    playCards(cards);
  };

  return {
    initAnimatedProps,
    reorganizeAndSortCards,
    initializeCardPositions,
    moveCardsToCenter,
    moveCardsOut,
    moveHadesCards,
    moveHypnosCards,
    onCardsPlayed,
  };
};

export default useCardsAnimation;
