import {
  FunctionComponent,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useCallback,
} from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { Card, CardHistory, Card as CardType, Game } from 'gameFunctions';
import CardAnimated from './CardAnimated';
import { View, ViewStyle } from 'react-native';
import { CardStatus } from './Card';
import GameCardsSelected from './GameCardsSelected';
import { getAnimatedCards, getCardZIndex } from './utils';
import useCardsAnimation, { CardAnimatedType } from './useCardsAnimation';

interface IPlayerCards {
  game: Game;
  cards: CardType[];
  cardsPlayed: CardHistory[];
  gameCreatedAt: string;
  onCardsPlayed: (cards: CardType[]) => void;
  isOpponent?: boolean;
}

const PlayerCards: FunctionComponent<IPlayerCards> = forwardRef(
  (
    { gameCreatedAt, cards, cardsPlayed, isOpponent = false, onCardsPlayed },
    _ref
  ) => {
    const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
    const [_currentPlayedCardPosition, setCurrentPlayedCardPosition] =
      useState<number>();
    const { lockUnplayableCards, initializeCardPositions, moveCardsToCenter } =
      useCardsAnimation();

    const cardsRef = useRef<CardAnimatedType[]>(
      cards.map((card: CardType) => ({
        card,
        offsetX: useSharedValue(0),
        offsetY: useSharedValue(0),
        scaleX: useSharedValue(1),
        scaleY: useSharedValue(1),
        playedAt: '',
        playable: true,
      }))
    );

    useEffect(() => {
      const latestCardsPlayed = cardsPlayed?.[0]?.cardsPlayed;
      const position = lockUnplayableCards(cardsRef.current, latestCardsPlayed);
      position && setCurrentPlayedCardPosition(position);
    }, [cardsPlayed?.length, lockUnplayableCards]);

    useEffect(() => {
      initializeCardPositions(cardsRef, isOpponent);
    }, [cardsRef, cardsPlayed?.length, isOpponent, initializeCardPositions]);

    const handleCardPress = useCallback(
      (animatedCard: CardAnimatedType) => {
        const cardToPlay: Card = animatedCard.card;
        const sameValueCards = cards.filter(
          (c) => c.value === cardToPlay.value
        );

        const isDifferentValueSelected = selectedCards.some(
          (c) => c.value !== cardToPlay.value
        );
        const latestCardsPlayedLength = cardsPlayed?.length
          ? cardsPlayed?.[0].cardsPlayed.length
          : 0;

        if (isDifferentValueSelected) {
          return;
        }

        // If selected cards exceed the latest cards played length
        if (
          !!selectedCards?.length &&
          latestCardsPlayedLength &&
          selectedCards.length >= latestCardsPlayedLength
        )
          return;

        switch (true) {
          case latestCardsPlayedLength === 1:
          case sameValueCards.length <= 1:
            // Case: Latest cards length play is 1 or only one card with the same value
            moveCardsToCenter([animatedCard], isOpponent);
            // lockUnplayableCards(cardsRef.current, [cardToPlay]);
            onCardsPlayed([cardToPlay]);
            break;
          default:
            // Case: Multiple cards with the same value, add to selection
            setSelectedCards((prev) => [...prev, cardToPlay]);
            break;
        }
      },
      [
        cards,
        selectedCards,
        moveCardsToCenter,
        onCardsPlayed,
        isOpponent,
        cardsPlayed,
      ]
    );

    const handlePlaySelection = useCallback(() => {
      const animatedCardsToPlay = getAnimatedCards(cardsRef, selectedCards);

      if (animatedCardsToPlay.length > 0) {
        moveCardsToCenter(animatedCardsToPlay, isOpponent);
        // lockUnplayableCards(cardsRef.current, selectedCards);
        onCardsPlayed(selectedCards);
        setSelectedCards([]);
      }
    }, [
      selectedCards,
      cardsPlayed,
      moveCardsToCenter,
      onCardsPlayed,
      isOpponent,
    ]);

    const cardAnimatedStyle = (cardAnimated: CardAnimatedType): ViewStyle => {
      return {
        zIndex: getCardZIndex(
          cardAnimated,
          cards,
          cardsPlayed,
          gameCreatedAt,
          isOpponent
        ),
      };
    };

    return (
      <>
        <GameCardsSelected
          onCancelCardSelection={() => setSelectedCards([])}
          onPlaySelection={handlePlaySelection}
          selectedCards={selectedCards}
          cardsPlayed={cardsPlayed}
        />
        {cardsRef.current.map((cardAnimated) => (
          <CardAnimated
            key={cardAnimated.card.id}
            cardAnimated={cardAnimated}
            style={cardAnimatedStyle(cardAnimated)}
            onCardPress={() => handleCardPress(cardAnimated)}
            cardStatus={isOpponent ? CardStatus.HIDDEN : CardStatus.PLAYABLE}
            // cardHidden={isOpponent ? !cardAnimated.playedAt : false}
          />
        ))}
      </>
    );
  }
);

export default PlayerCards;
