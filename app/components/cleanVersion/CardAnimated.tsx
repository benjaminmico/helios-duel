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
  cardLocked?: boolean;
  cardPlayable?: boolean;
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
  cardLocked,
  style,
}) => {
  const { card, offsetX, offsetY, scaleX, scaleY, playedAt } = cardAnimated;

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
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Card
        isHidden={cardHidden}
        enabled
        card={card}
        onPress={onCardPress}
        status={cardStatus}
        isLocked={!playedAt && cardLocked}
      />
    </Animated.View>
  );
};

export default CardAnimated;
