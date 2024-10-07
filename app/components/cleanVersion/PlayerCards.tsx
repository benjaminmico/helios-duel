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
  cardsArtemisReceived: Card[];
  gameCreatedAt: string;
  onCardsPlayed: (cards: CardType[]) => void;
  isOpponent?: boolean;
}

export interface PlayerCardsHandle {
  getCardsRef: () => CardAnimatedType[];
  handleRemoveCard: (cards: Card[]) => void;
  handleAddCard: (cardAnimated: CardAnimatedType) => void;
}

const PlayerCards = forwardRef<PlayerCardsHandle, IPlayerCards>(
  (
    {
      gameCreatedAt,
      cards,
      cardsArtemisReceived,
      cardsPlayed,
      isOpponent = false,
      onCardsPlayed,
    },
    ref
  ) => {
    const [selectedCards, setSelectedCards] = useState<CardType[]>([]);

    const {
      reorganizeAndSortCards,
      initializeCardPositions,
      moveCardsToCenter,
      moveCardsOut,
    } = useCardsAnimation();

    const [_, setRender] = useState(false); // State to force re-render

    const cardsRef = useRef<CardAnimatedType[]>(
      cards.map((card: CardType) => ({
        card,
        offsetX: useSharedValue(0),
        offsetY: useSharedValue(0),
        scaleX: useSharedValue(1),
        scaleY: useSharedValue(1),
        playedAt: '',
        playable: true,
        isOut: false,
      }))
    );

    // if (!cardsRef?.current?.length) return <View />;

    const handleRemoveCard = useCallback((cards: Card[]) => {
      const currentIndex = cardsRef?.current.findIndex(
        (c) => c.card.id === cards[0].id
      );

      delete cardsRef.current[currentIndex];
      setRender((prev) => !prev);
    }, []);

    const handleAddCard = useCallback(
      (cardAnimated: CardAnimatedType) => {
        console.log('BBBB');
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
        handleRemoveCard: (cards: Card[]) => handleRemoveCard(cards),
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
        moveCardsOut(cardsToMove);
      }
    }, [cardsPlayed?.length]);

    const handleDefaultCardPress = useCallback(
      (animatedCard: CardAnimatedType) => {
        const cardToPlay: Card = animatedCard.card;
        const sameValueCards = cardsRef.current.filter(
          (c) => c.card.value === cardToPlay.value && !c.playedAt
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
            moveCardsToCenter([animatedCard]);
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
        if (!cardsPlayed?.length) {
          handleDefaultCardPress(animatedCard);
          return;
        }
        const latestCardPlayed = getLatestCardPlayed(cardsPlayed);

        switch (latestCardPlayed.value) {
          case 'ARTEMIS':
            handleArtemisCardPress(animatedCard);
            break;
          default:
            handleDefaultCardPress(animatedCard);
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
      const latestCardPlayed = getLatestCardPlayed(cardsPlayed);

      if (latestCardPlayed?.value === 'ARTEMIS') {
        console.log('selectedCards', selectedCards);
        onCardsPlayed(selectedCards);
        setSelectedCards([]);
        return;
      }

      const animatedCardsToPlay = getAnimatedCards(cardsRef, selectedCards);

      if (animatedCardsToPlay.length > 0) {
        moveCardsToCenter(animatedCardsToPlay);
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
              key={cardAnimated.card.id}
              cardAnimated={cardAnimated}
              // cardLocked={isCardLocked(cardAnimated.card, cardsPlayed)}
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
