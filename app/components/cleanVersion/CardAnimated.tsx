import 'react-native-gesture-handler'; // Must be at the top
import React, { FunctionComponent } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { CardHistory, Card as CardType } from 'gameFunctions';

import Card, { CardStatus } from './Card';
import { CardAnimatedType } from './useCardsAnimation';
import { ViewStyle } from 'react-native';

interface ICardProps {
  cardAnimated: CardAnimatedType;
  onCardPress?: (card?: CardType) => void;
  cardStatus: CardStatus;
  cardHidden?: boolean;
  style?: ViewStyle;
}

// Constants for card dimensions
export const CARD_WIDTH = 60;
export const CARD_HEIGHT = 90;
export const CARDS_PER_ROW = 9;

const CardAnimated: FunctionComponent<ICardProps> = ({
  cardAnimated,
  onCardPress = () => {},
  cardStatus,
  cardHidden = false,
  style,
}) => {
  const { card, offsetX, offsetY, scaleX, scaleY, playable } = cardAnimated;

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
    // opacity: playable ? 1.0 : 0.1,
    ...style,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Card
        isHidden={cardHidden}
        enabled
        card={card}
        onPress={onCardPress}
        status={cardStatus}
        isLocked={!playable}
      />
    </Animated.View>
  );
};

export default CardAnimated;
