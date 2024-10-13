import {
  FunctionComponent,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useCallback,
  useImperativeHandle,
} from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { Card, CardHistory, Card as CardType, Game } from 'gameFunctions';
import CardAnimated from './CardAnimated';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { CardStatus } from './Card';
import GameCardsSelected from './GameCardsSelected';
import {
  getAnimatedCards,
  getCardZIndex,
  getLatestCardPlayed,
  isCardLocked,
} from './utils';
import useCardsAnimation, { CardAnimatedType } from './useCardsAnimation';

interface IPlayerCards {
  cards: CardType[];
  cardsPlayed: CardHistory[];
  gameCreatedAt: string;
  onCardsPlayed: (cards: CardType[]) => void;
  isOpponent?: boolean;
  isOnArtemisSelection?: boolean;
  isPlayable?: boolean;
}

export interface PlayerCardsHandle {
  getCardsRef: () => CardAnimatedType[];
  handleRemoveCards: (cards: Card[]) => void;
  handleAddCard: (cardAnimated: CardAnimatedType) => void;
}

const PlayerCards = forwardRef<PlayerCardsHandle, IPlayerCards>(
  (
    {
      gameCreatedAt,
      cards,
      cardsPlayed,
      isOnArtemisSelection = false,
      isOpponent = false,
      isPlayable = false,
      onCardsPlayed,
    },
    ref
  ) => {
    const [selectedCards, setSelectedCards] = useState<CardType[]>([]);

    const { initializeCardPositions, moveCardsToCenter, moveCardsOut } =
      useCardsAnimation();

    const [_, setRender] = useState(false); // State to force re-render

    const cardsRef = useRef<CardAnimatedType[]>(
      cards.map((card: CardType) => ({
        card: { ...card }, // create new object to avoid immutability
        offsetX: useSharedValue(0),
        offsetY: useSharedValue(0),
        scaleX: useSharedValue(1),
        scaleY: useSharedValue(1),
        playedAt: '',
        playable: true,
        isOut: false,
        isTurnedOff: false,
      }))
    );

    // Initialize card positions immediately after setting up cardsRef
    initializeCardPositions(cardsRef, isOpponent);

    const handleRemoveCards = useCallback((cards: Card[]) => {
      const cardIdsToRemove = new Set(cards.map((card) => card.id));
      cardsRef.current = cardsRef.current.filter(
        (cardAnimated) => !cardIdsToRemove.has(cardAnimated.card.id)
      );
      setRender((prev) => !prev);
    }, []);

    const handleAddCard = useCallback(
      (cardAnimated: CardAnimatedType) => {
        // Add the new card to the reference array
        cardsRef.current.push(cardAnimated);

        // Sort the cards based on their value
        cardsRef.current.sort(
          (a, b) => Number(a.card.position) - Number(b.card.position)
        );

        setRender((prev) => !prev);
      },
      [initializeCardPositions, isOpponent]
    );

    useImperativeHandle(
      ref,
      (): PlayerCardsHandle => ({
        getCardsRef: () => cardsRef.current,
        handleRemoveCards: (cards: Card[]) => handleRemoveCards(cards),
        handleAddCard: (cardAnimated: CardAnimatedType) =>
          handleAddCard(cardAnimated),
      })
    );

    useEffect(() => {
      initializeCardPositions(cardsRef, isOpponent);
    }, [cardsRef, cardsPlayed?.length, isOpponent, initializeCardPositions]);

    useEffect(() => {
      if (cardsPlayed?.length === 0) {
        const cardsToMove = cardsRef.current.filter(
          (c) => !!c.playedAt && !c.isOut
        );
        setTimeout(() => moveCardsOut(cardsToMove), 1000);
      }
    }, [cardsPlayed]);

    const handleDefaultCardPress = useCallback(
      (animatedCard: CardAnimatedType) => {
        const cardToPlay: Card = animatedCard.card;
        const sameValueCards = cardsRef.current.filter(
          (c) => c.card.position === cardToPlay.position && !c.playedAt
        );

        const isDifferentValueSelected = selectedCards.some(
          (c) => c.position !== cardToPlay.position
        );

        if (isDifferentValueSelected) {
          return;
        }

        const latestCardsPlayedLength =
          cardsPlayed?.[0]?.cardsPlayed.length || 0;

        // If no cards have been played yet or selected cards exceed the latest cards played length
        if (
          selectedCards.length >= sameValueCards.length ||
          (latestCardsPlayedLength &&
            selectedCards.length >= latestCardsPlayedLength)
        ) {
          return;
        }

        if (latestCardsPlayedLength === 1 || sameValueCards.length <= 1) {
          // Case: Latest cards length play is 1 or only one card with the same value
          moveCardsToCenter([animatedCard]);
          onCardsPlayed([cardToPlay]);
        } else {
          // Case: Multiple cards with the same value, add to selection
          setSelectedCards((prev) => [...prev, cardToPlay]);
        }
      },
      [selectedCards, moveCardsToCenter, onCardsPlayed, cardsPlayed]
    );

    const handleArtemisCardPress = useCallback(
      (animatedCard: CardAnimatedType) => {
        const cardToPlay: Card = animatedCard.card;
        setSelectedCards((prev) => [...prev, cardToPlay]);
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

    const handleCardPress = useCallback(
      (animatedCard: CardAnimatedType) => {
        setRender((prev) => !prev);
        if (isOnArtemisSelection) {
          handleArtemisCardPress(animatedCard);
          return;
        }
        handleDefaultCardPress(animatedCard);
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
      const latestCardPlayed = getLatestCardPlayed(cardsPlayed);

      if (latestCardPlayed?.value === 'ARTEMIS') {
        onCardsPlayed(selectedCards);
        setSelectedCards([]);
        return;
      }

      const animatedCardsToPlay = getAnimatedCards(cardsRef, selectedCards);

      if (animatedCardsToPlay.length > 0) {
        moveCardsToCenter(animatedCardsToPlay);
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
          cardsRef,
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

        {!!cardsRef?.current?.length &&
          cardsRef.current.map((cardAnimated) => (
            <CardAnimated
              pointerEvents={
                isPlayable && !cardAnimated.playedAt ? 'auto' : 'none'
              }
              key={cardAnimated.card.id}
              cardAnimated={cardAnimated}
              cardLocked={isCardLocked(
                cardAnimated.card,
                cardsRef,
                cardsPlayed,
                isPlayable,
                isOnArtemisSelection
              )}
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
