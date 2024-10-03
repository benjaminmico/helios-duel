import 'react-native-gesture-handler'; // Must be at the top
import React, { FunctionComponent } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { CardHistory, Card as CardType } from 'gameFunctions';

import { CardAnimatedProps } from './useCardAnimation';
import Card, { CardStatus } from './Card';

export type CardAnimatedType = CardType & CardAnimatedProps;

interface ICardProps {
  card: CardAnimatedType;
  onCardSelected?: (card?: CardType) => void;
  cardStatus: CardStatus;
  cardHidden?: boolean;
}

// Constants for card dimensions
export const CARD_WIDTH = 60;
export const CARD_HEIGHT = 90;
export const CARDS_PER_ROW = 9;

const CardAnimated: FunctionComponent<ICardProps> = ({
  card,
  onCardSelected = () => {},
  cardStatus,
  cardHidden = false,
  style,
}) => {
  const { offsetX, offsetY, scaleX, scaleY, playedAt = '' } = card;

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
    ],
    ...style,
    // zIndex: (() => {

    //   if (isMostRecentPlayCard) {
    //     return 999999999;
    //   }
    //   if (cardHidden) {
    //     return cardCurrentIndex || 0;
    //   }
    //   if (cardCurrentIndex >= CARDS_PER_ROW) {
    //     return cardCurrentIndex || 0;
    //   }
    //   return Number(`11${cardCurrentIndex || 0}`);
    // })(),
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Card
        isHidden={cardHidden}
        enabled
        card={card}
        onPress={onCardSelected}
        status={cardStatus}
        isLocked={false}
      />
    </Animated.View>
  );
};

export default CardAnimated;
