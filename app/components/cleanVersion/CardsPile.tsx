import { Card, Card as CardType, Game } from 'gameFunctions';
import React, {
  forwardRef,
  FunctionComponent,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  Platform,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { CardStatus } from './Card';
import { FONT_FAMILY_COPPERPLATE_BOLD } from 'constants/HeliosTheme';
import CardAnimated, { CARD_WIDTH } from './CardAnimated'; // Import CardAnimated
import useCardsAnimation, {
  CardAnimatedType,
  TextPileLengthAnimatedProps,
} from './useCardsAnimation';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { getCardZIndex } from './utils';
import { PlayerCardsHandle } from './PlayerCards';

interface ICardsPile {
  cards: CardType[];
}

export interface CardsPileHandle {
  getCardsRef: () => CardAnimatedType[];
  handleRemoveCards: (cards: Card[]) => void;
  handleAddCard: (cardAnimated: CardAnimatedType) => void;
}

const CardsPile = forwardRef<CardsPileHandle, ICardsPile>(({ cards }, ref) => {
  const { initializeCardDeckPositions, initializeCardDeckTextLengthPositions } =
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

  useImperativeHandle(
    ref,
    (): PlayerCardsHandle => ({
      getCardsRef: () => cardsRef.current,
      handleRemoveCards: (cards: Card[]) => handleRemoveCards(cards),
      handleAddCard: (cardAnimated: CardAnimatedType) =>
        handleAddCard(cardAnimated),
    })
  );

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
    [initializeCardDeckPositions]
  );

  const cardsPileTextRef = useRef<TextPileLengthAnimatedProps>({
    offsetX: useSharedValue(0),
    offsetY: useSharedValue(0),
  });

  initializeCardDeckPositions(cardsRef);

  useEffect(() => {
    initializeCardDeckPositions(cardsRef);
    initializeCardDeckTextLengthPositions(cardsPileTextRef, cardsRef);
    setRender((prev) => !prev);
  }, [cardsRef]);

  if (!cardsRef?.current?.length) return <View />;

  const textAnimatedStyle = useAnimatedStyle(() => ({
    ...styles.deckValue,
    transform: [
      { translateX: cardsPileTextRef.current.offsetX.value },
      { translateY: cardsPileTextRef.current.offsetY.value },
    ],
  }));

  return (
    <>
      {cardsRef.current.map((cardAnimated, index) => (
        <View key={cardAnimated.card.id}>
          <CardAnimated
            pointerEvents={'none'}
            cardAnimated={cardAnimated}
            style={{ zIndex: index }}
            cardStatus={CardStatus.HIDDEN}
            cardHidden
          />
        </View>
      ))}
      <Animated.Text style={textAnimatedStyle}>
        {cardsRef.current?.length}
      </Animated.Text>
    </>
  );
});

export default CardsPile;

const styles = StyleSheet.create({
  deckValue: {
    position: 'absolute',
    width: CARD_WIDTH * 0.8,
    color: 'white',
    fontFamily: FONT_FAMILY_COPPERPLATE_BOLD,
    textAlign: 'center',
    fontSize: 20,
  },
});
