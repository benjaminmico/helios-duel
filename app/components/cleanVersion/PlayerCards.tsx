import {
  FunctionComponent,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { getCardZIndex, useCardAnimation } from './useCardAnimation';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { Card, CardHistory, Card as CardType, Game } from 'gameFunctions';
import CardAnimated, {
  CARD_HEIGHT,
  CARD_WIDTH,
  CardAnimatedType,
} from './CardAnimated';
import { Dimensions, View } from 'react-native';
import { CardStatus } from './Card';
import GameCardsSelected from './GameCardsSelected';

interface IPlayerCards {
  game: Game;
  cards: CardType[];
  cardsPlayed: CardType[];
  isOpponent?: boolean;
  gameCreatedAt: string;
  onCardsPlayed: (cards: CardType[]) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PlayerCards: FunctionComponent<IPlayerCards> = forwardRef(
  (
    { gameCreatedAt, cards, cardsPlayed, isOpponent = false, onCardsPlayed },
    ref
  ) => {
    const CARD_MARGIN = isOpponent ? -40 : -30;
    const CARDS_PER_ROW = isOpponent ? 14 : 9;

    const [selectedCards, setSelectedCards] = useState<CardAnimatedType[]>([]);

    const { moveCardsToCenter } = useCardAnimation();

    // Use a ref to store the cards to avoid re-renders affecting positions
    const cardsRef = useRef(
      cards.map((card: CardType) => ({
        ...card,
        isPlayed: false,
        offsetX: useSharedValue(0),
        offsetY: useSharedValue(0),
        scaleX: useSharedValue(1),
        scaleY: useSharedValue(1),
        zIndex: 1,
        playedAt: '',
        playedBy: '',
      }))
    );

    useImperativeHandle(ref, () => ({
      getCardsRef: () => cardsRef.current,
      onCurrentCardsPlayed: (animatedCards: CardAnimatedType[]) =>
        onCurrentCardsPlayed(animatedCards),
    }));

    const [handVersion, setHandVersion] = useState(0); // to trigger recalculation of positions

    const onCurrentCardsPlayed = (animatedCards: CardAnimatedType[]) => {
      const playedCards = animatedCards
        .map((animatedCard: CardAnimatedType) => {
          const cardIndex = cardsRef.current.findIndex(
            (c) => c.id === animatedCard.id
          );
          const card = cards.find((c) => c.id === animatedCard.id) as CardType;

          if (cardIndex !== -1) {
            cardsRef.current[cardIndex].isPlayed = true;
          }

          return card;
        })
        .filter((card): card is CardType => card !== undefined);

      if (playedCards.length > 0) {
        onCardsPlayed(playedCards);
        setHandVersion((prev) => prev + 1);
      }
    };

    const onCardSelected = (card: CardAnimatedType) => {
      const sameValueCards = cards.filter((c) => c.value === card.value);
      const isCardSelected = selectedCards.some((c) => c.id === card.id);
      const isDifferentValueSelected = selectedCards.some(
        (c) => c.value !== card.value
      );

      if (isDifferentValueSelected) return;

      if (isCardSelected) {
        setSelectedCards(selectedCards.filter((c) => c.id !== card.id));
      } else if (sameValueCards.length > 1) {
        setSelectedCards([...selectedCards, card]);
      } else {
        moveCardsToCenter([card], isOpponent, () =>
          onCurrentCardsPlayed([card])
        );
      }
    };

    const onPlaySelection = () => {
      if (selectedCards.length > 0) {
        moveCardsToCenter(selectedCards, isOpponent, () =>
          onCurrentCardsPlayed(selectedCards)
        );
        setSelectedCards([]);
      }
    };

    // Initialize positions of cards
    useEffect(() => {
      // Get hand cards and sort them by value
      const handCards = cardsRef.current
        .filter((c) => !c.isPlayed)
        //@ts-ignore
        .sort((a, b) => a.value - b.value);
      const totalCards = handCards.length;

      // Split cards into rows
      const numberOfRows = Math.ceil(totalCards / CARDS_PER_ROW);

      // Build the rows
      const rows = [];
      for (let i = 0; i < numberOfRows; i++) {
        const startIdx = i * CARDS_PER_ROW;
        const endIdx = startIdx + CARDS_PER_ROW;
        rows.push(handCards.slice(startIdx, endIdx));
      }

      const startY = isOpponent ? CARD_HEIGHT + 40 : screenHeight - 40;
      const rowHeight = CARD_HEIGHT - 20;

      rows.forEach((rowCards, rowIndex) => {
        const rowCardCount = rowCards.length;

        const totalRowWidth =
          rowCardCount * CARD_WIDTH + (rowCardCount - 1) * CARD_MARGIN;
        const rowStartX = (screenWidth - totalRowWidth) / 2;

        rowCards.forEach((card, colIndex) => {
          const x = rowStartX + colIndex * (CARD_WIDTH + CARD_MARGIN);
          const y = startY - rowIndex * rowHeight;

          // Animate to new position
          card.offsetX.value = withSpring(x, {
            stiffness: 100,
            damping: 20,
          });
          card.offsetY.value = withSpring(y, {
            stiffness: 300,
            damping: 20,
          });
        });
      });
    }, [handVersion, isOpponent]);

    return (
      <>
        <GameCardsSelected
          onCancelCardSelection={() => setSelectedCards([])}
          onPlaySelection={onPlaySelection}
          selectedCards={selectedCards}
          canPlaySelectedCards={
            !cardsPlayed?.length || selectedCards.length === cardsPlayed.length
          }
        />
        {cardsRef.current.map((card) => (
          <CardAnimated
            key={card.id}
            style={{
              zIndex: getCardZIndex(card, cards, cardsPlayed, gameCreatedAt),
            }}
            card={card}
            onCardSelected={() => onCardSelected(card)}
            cardStatus={isOpponent ? CardStatus.HIDDEN : CardStatus.PLAYABLE}
            cardHidden={false}
          />
        ))}
      </>
    );
  }
);

export default PlayerCards;
