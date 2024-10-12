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
import {
  ColorMatrix,
  concatColorMatrices,
  Grayscale,
  grayscale,
} from 'react-native-color-matrix-image-filters';

export enum CardStatus {
  PLAYABLE = 'PLAYABLE',
  PREVIEW = 'PREVIEW',
  DRAW = 'DRAW',
  HIDDEN = 'HIDDEN',
  VALIDATION = 'VALIDATION',
  SELECT = 'SELECT',
  ARTEMIS_SELECT = 'ARTEMIS_SELECT',
}

interface ICardItemProps {
  card: CardType;
  onPress?: (card: CardType) => void;
  isHidden?: boolean;
  enabled?: boolean;
  isLocked?: boolean;
  status?: CardStatus;
  style?: ViewStyle;
  isOpponentCard?: boolean;
  isTurnedOff?: boolean;
}

const Card: FunctionComponent<ICardItemProps> = ({
  card,
  onPress = () => null,
  isHidden = false,
  enabled = false,
  isLocked = false,
  status = CardStatus.PLAYABLE,
  style,
  isTurnedOff = false,
}) => {
  const getImageSource = (card: CardType) => {
    const imageName = card.type.includes('NORMAL')
      ? `${card.type}_${card.value}`
      : card.type;
    return cardImages[imageName];
  };

  const getCardItemStyle = (): ImageStyle => {
    if (status === CardStatus.PLAYABLE) {
      return isLocked
        ? { ...styles.containerPlayable, ...styles.containerLocked }
        : styles.containerPlayable;
    }
    if (status === CardStatus.PREVIEW) {
      return isLocked
        ? { ...styles.containerPreview, ...styles.containerLocked }
        : styles.containerPreview;
    }
    if (status === CardStatus.HIDDEN) {
      return styles.containerHidden;
    }
    if (status === CardStatus.SELECT) {
      return styles.containerSelect;
    }
    if (status === CardStatus.VALIDATION) {
      return styles.containerValidation;
    }
    if (status === CardStatus.ARTEMIS_SELECT) {
      return styles.containerArtemisSelect;
    }
    if (status === CardStatus.DRAW) {
      return isLocked
        ? { ...styles.containerDraw, ...styles.containerLocked }
        : styles.containerDraw;
    }
    return {};
  };

  const renderCard = () => {
    const imageSource = isHidden
      ? require('assets/cards/HIDDEN_CARD.png')
      : getImageSource(card);

    const cardStyle = getCardItemStyle();
    const borderColor = isTurnedOff ? 'grey' : cardStyle.borderColor;

    return (
      <TouchableOpacity
        disabled={!enabled || isLocked}
        style={{
          ...style,
          width: cardStyle.width,
          height: cardStyle.height,
          backgroundColor: 'black',
          borderRadius: cardStyle.borderRadius,
        }}
        onPress={() => onPress(card)}
      >
        {isTurnedOff ? (
          <Grayscale>
            <Image
              style={{
                ...getCardItemStyle(),
                borderColor: 'grey',
                opacity: isLocked ? 0.4 : 1.0,
              }}
              source={imageSource}
            />
          </Grayscale>
        ) : (
          <Image
            style={{
              ...getCardItemStyle(),
              opacity: isLocked ? 0.4 : 1.0,
            }}
            source={imageSource}
          />
        )}
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
    width: CARD_PLAYABLE_WIDTH,
    height: CARD_PLAYABLE_HEIGHT,
    borderWidth: 0.5,
    borderRadius: 8,
    borderColor: colors.borders.cards,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
  containerArtemisSelect: {
    width: CARD_DRAW_WIDTH,
    height: CARD_DRAW_HEIGHT,
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
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  grayscaleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
    width: 100,
    height: 100,
  },
});
