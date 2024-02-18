import React, { FunctionComponent, useEffect, useRef } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  ImageStyle,
  Animated,
} from 'react-native';
import { Card as CardType } from 'gameFunctions';
import { cardImages } from 'assets/cards';
import { colors } from 'constants/HeliosTheme';
import { useSelector } from 'react-redux';
import { RootState } from 'app/reducers';

export enum CardStatus {
  PLAYABLE,
  PREVIEW,
  DRAW,
  HIDDEN,
  SELECT,
}

interface ICardItemProps {
  card: CardType;
  onPress?: (card: CardType) => void;
  isHidden?: boolean;
  enabled?: boolean;
  isLocked?: boolean;
  type?: 'PLAYABLE' | 'PREVIEW' | 'DRAW' | 'HIDDEN' | 'SELECT' | 'VALIDATION';
  style?: ViewStyle;
  isOpponentCard?: boolean;
}

const Card: FunctionComponent<ICardItemProps> = ({
  card,
  onPress = () => null,
  isHidden = false,
  enabled = false,
  isLocked = false,
  type = 'PLAYABLE',
  style,
  isOpponentCard = false,
}) => {
  const game = useSelector((state: RootState) => state);

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (type === 'PREVIEW') {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [type, opacity]);

  const getImageSource = (card: CardType) => {
    const imageName = card.type.includes('NORMAL')
      ? `${card.type}_${card.value}`
      : card.type;
    return cardImages[imageName];
  };

  const getCardItemStyle = () => {
    if (type === 'PLAYABLE') {
      return isLocked
        ? { ...styles.containerPlayable, ...styles.containerLocked }
        : styles.containerPlayable;
    }
    if (type === 'PREVIEW') {
      return isLocked
        ? { ...styles.containerPreview, ...styles.containerLocked }
        : styles.containerPreview;
    }
    if (type === 'HIDDEN') {
      return styles.containerHidden;
    }
    if (type === 'SELECT') {
      return styles.containerSelect;
    }
    if (type === 'VALIDATION') {
      return styles.containerValidation;
    }
    if (type === 'DRAW') {
      return isLocked
        ? { ...styles.containerDraw, ...styles.containerLocked }
        : styles.containerDraw;
    }
    return {};
  };

  const renderGrayscaleOverlay = () => {
    return <View style={styles.grayscaleOverlay} />;
  };

  const renderCard = () => {
    const imageSource = isHidden
      ? require('assets/cards/HIDDEN_CARD.png')
      : getImageSource(card);
    return (
      <TouchableOpacity
        disabled={!enabled || isLocked}
        style={style}
        onPress={() => onPress(card)}
      >
        <View style={[styles.cardContainer]}>
          {type === 'PREVIEW' ? (
            <Animated.Image
              style={[getCardItemStyle(), { opacity }]}
              source={imageSource}
            />
          ) : (
            <Image style={getCardItemStyle()} source={imageSource} />
          )}

          {isLocked && <View style={styles.cardOverlay} />}
          {card.isTurnedOff && !isOpponentCard && renderGrayscaleOverlay()}
        </View>
      </TouchableOpacity>
    );
  };

  return renderCard();
};

export default Card;

const CARD_RATIO = 64.07 / 90.86;
export const CARD_PLAYABLE_HEIGHT = 110;
export const CARD_PLAYABLE_WIDTH = CARD_PLAYABLE_HEIGHT * CARD_RATIO;
export const CARD_DRAW_HEIGHT = 70;
export const CARD_DRAW_WIDTH = CARD_DRAW_HEIGHT * CARD_RATIO;
export const CARD_HIDDEN_HEIGHT = 90;
export const CARD_HIDDEN_WIDTH = CARD_HIDDEN_HEIGHT * CARD_RATIO;
export const CARD_PREVIEW_HEIGHT = 130;
export const CARD_PREVIEW_WIDTH = CARD_PREVIEW_HEIGHT * CARD_RATIO;
export const CARD_VALIDATION_HEIGHT = 160;
export const CARD_VALIDATION_WIDTH = CARD_VALIDATION_HEIGHT * CARD_RATIO;

const styles = StyleSheet.create({
  containerPlayable: {
    width: CARD_PLAYABLE_WIDTH,
    height: CARD_PLAYABLE_HEIGHT,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: colors.borders.cardsActive,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerDraw: {
    width: CARD_DRAW_WIDTH,
    height: CARD_DRAW_HEIGHT,
    borderWidth: 0.5,
    borderRadius: 8,
    borderColor: colors.borders.cards,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerHidden: {
    width: CARD_HIDDEN_WIDTH,
    height: CARD_HIDDEN_HEIGHT,
    borderWidth: 0.5,
    borderRadius: 8,
    borderColor: colors.borders.cards,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerSelect: {
    width: CARD_HIDDEN_WIDTH,
    height: CARD_HIDDEN_HEIGHT,
    borderWidth: 0.5,
    borderRadius: 8,
    borderColor: colors.borders.cards,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerPreview: {
    width: CARD_PREVIEW_WIDTH,
    height: CARD_PREVIEW_HEIGHT,
    borderWidth: 0.5,
    borderRadius: 8,
    borderColor: colors.borders.cards,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  containerValidation: {
    width: CARD_VALIDATION_WIDTH,
    height: CARD_VALIDATION_HEIGHT,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: colors.borders.cardsActive,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerLocked: {
    borderWidth: 1,
    borderColor: colors.borders.cards,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardOverlay: {
    backgroundColor: '#44403C',
    borderRadius: 8,
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.5,
    width: '100%',
    height: '100%',
  },
  grayscaleOverlay: {
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    borderRadius: 8,
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
});
