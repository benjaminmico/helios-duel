import React, {
  forwardRef,
  FunctionComponent,
  useCallback,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import CardItem, {
  CARD_DRAW_HEIGHT,
  CARD_DRAW_WIDTH,
  CARD_HIDDEN_HEIGHT,
  CARD_HIDDEN_WIDTH,
  CARD_PLAYABLE_HEIGHT,
  CARD_PLAYABLE_WIDTH,
  CARD_PREVIEW_HEIGHT,
  CARD_PREVIEW_WIDTH,
} from './Card';
import { Card } from 'gameFunctions';
import { AnimationsContext } from 'app/core/AnimationsProvider';

interface ICardAnimatedProps {
  shouldPlay: boolean;
  item: Card;
  onCardPress: (card: Card) => void;
  cardLocked: boolean | undefined;
  maxNbCardsByLine: number;
  currIndex: number;
  sortedCards: Card[];
  isPlayingAgainstBot: boolean;
}

const CardAnimated: FunctionComponent<ICardAnimatedProps> = forwardRef(
  (
    {
      shouldPlay,
      item,
      onCardPress,
      cardLocked,
      maxNbCardsByLine,
      currIndex,
      sortedCards,
      isPlayingAgainstBot,
    },
    ref
  ) => {
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const scaleX = useSharedValue(1);
    const scaleY = useSharedValue(1);
    const cardRef = useRef<Animated.View>(null);
    const [cardVisible, setCardVisible] = useState(false);

    const { setHasPendingAnimations } = useContext(AnimationsContext);

    const animatedStyles = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: offsetX.value },
          { translateY: offsetY.value },
          { scaleX: scaleX.value },
          { scaleY: scaleY.value },
        ],
      };
    });

    // Animation when card is played.
    const startCardPlayedAnimation = (cardIndex: number) =>
      new Promise((resolve) => {
        try {
          setCardVisible(true);
          cardRef?.current?.measure(
            (
              _x: number,
              _y: number,
              _width: number,
              _height: number,
              pageX: number,
              pageY: number
            ) => {
              const windowWidth = Dimensions.get('window').width;
              const windowHeight = Dimensions.get('window').height;

              const xOffset = cardIndex * 25;

              const translateX =
                Math.ceil(
                  windowWidth / 2 -
                    pageX +
                    15 -
                    (currIndex % maxNbCardsByLine > 0
                      ? 0
                      : CARD_PREVIEW_WIDTH / 2 + 10)
                ) + xOffset;
              const translateY = Math.ceil(
                windowHeight / 2 -
                  pageY +
                  10 -
                  CARD_PREVIEW_HEIGHT / 2 -
                  (currIndex >= maxNbCardsByLine ? 5 : 0)
              );

              offsetX.value = withTiming(translateX, {
                duration: isPlayingAgainstBot ? 1000 : 800,
                easing: Easing.out(Easing.cubic),
              });
              offsetY.value = withTiming(translateY, {
                duration: isPlayingAgainstBot ? 1000 : 800,
                easing: Easing.out(Easing.cubic),
              });
              scaleX.value = withTiming(
                CARD_PREVIEW_WIDTH / CARD_PLAYABLE_WIDTH,
                {
                  duration: isPlayingAgainstBot ? 1000 : 500,
                  easing: Easing.out(Easing.cubic),
                }
              );
              scaleY.value = withTiming(
                CARD_PREVIEW_HEIGHT / CARD_PLAYABLE_HEIGHT,
                {
                  duration: isPlayingAgainstBot ? 1000 : 500,
                  easing: Easing.out(Easing.cubic),
                }
              );
            }
          );
          setTimeout(() => {
            resolve(true);
          }, 13000);
        } catch (error) {
          console.error('Error on startCardPlayedAnimation in CardAnimated');
          resolve(true);
        }
      });

    // Animation when card is turned off (Hypnos effect).
    const startTurningOffAnimation = useCallback(
      () =>
        new Promise((resolve) => {
          try {
            setCardVisible(true);
            cardRef?.current?.measure(
              (
                x: number,
                y: number,
                width: number,
                height: number,
                pageX: number,
                pageY: number
              ) => {
                const windowWidth = Dimensions.get('window').width;
                const windowHeight = Dimensions.get('window').height;

                const translateX = Math.ceil(
                  windowWidth / 2 -
                    pageX +
                    (currIndex % maxNbCardsByLine === 0 ? -40 : 10)
                );
                const translateY = Math.ceil(
                  windowHeight - windowHeight / 4 - pageY - 80
                );

                offsetX.value = withRepeat(
                  withTiming(translateX, {
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                  }),
                  2,
                  true
                );
                offsetY.value = withRepeat(
                  withTiming(translateY, {
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                  }),
                  2,
                  true
                );
              }
            );
            setTimeout(() => {
              setCardVisible(false);
              resolve(true);
            }, 4000);
          } catch (error) {
            console.log('Error on startTurningOffAnimation in CardAnimated');
            setCardVisible(false);
            resolve(true);
          }
        }),
      [currIndex, offsetX, offsetY]
    );

    // Animation when card is given to opponent (Artemis effect).
    const startCardGivenAnimation = () =>
      new Promise((resolve) => {
        try {
          setCardVisible(true);
          cardRef?.current?.measure(
            (
              _x: number,
              _y: number,
              _width: number,
              _height: number,
              pageX: number,
              pageY: number
            ) => {
              const windowWidth = Dimensions.get('window').width;
              const windowHeight = Dimensions.get('window').height;

              const translateX = Math.ceil(
                windowWidth / 2 -
                  pageX +
                  15 -
                  (currIndex % maxNbCardsByLine > 0
                    ? 10
                    : CARD_PREVIEW_WIDTH / 2 + 10)
              );
              const translateY = Math.ceil(windowHeight / 5 - pageY);

              offsetX.value = withTiming(translateX, {
                duration: 1000,
                easing: Easing.out(Easing.cubic),
              });
              offsetY.value = withTiming(translateY, {
                duration: 1000,
                easing: Easing.out(Easing.cubic),
              });
              scaleX.value = withDelay(
                2000,
                withTiming(CARD_HIDDEN_WIDTH / CARD_PLAYABLE_WIDTH, {
                  duration: 500,
                  easing: Easing.out(Easing.cubic),
                })
              );
              scaleY.value = withDelay(
                2000,
                withTiming(CARD_HIDDEN_HEIGHT / CARD_PLAYABLE_HEIGHT, {
                  duration: 500,
                  easing: Easing.out(Easing.cubic),
                })
              );
            }
          );
          setTimeout(() => {
            resolve(true);
          }, 3000);
        } catch (error) {
          console.log('Error on startCardGivenAnimation in CardAnimated');
          resolve(true);
        }
      });

    // Animation when card is sent to discard (Hades effect).
    const startCardToDiscardAnimation = () =>
      new Promise((resolve) => {
        try {
          setCardVisible(true);
          cardRef?.current?.measure(
            (
              _x: number,
              _y: number,
              _width: number,
              _height: number,
              pageX: number,
              pageY: number
            ) => {
              const windowWidth = Dimensions.get('window').width;
              const windowHeight = Dimensions.get('window').height;

              const translateX = Math.ceil(
                windowWidth -
                  windowWidth / 4 -
                  pageX +
                  80 -
                  (currIndex === 0 ? 60 : 10)
              );
              const translateY = Math.ceil(
                windowHeight / 2 - pageY - CARD_PREVIEW_HEIGHT / 2 + 12
              );

              offsetX.value = withTiming(translateX, {
                duration: 1000,
                easing: Easing.out(Easing.cubic),
              });
              offsetY.value = withTiming(translateY, {
                duration: 1000,
                easing: Easing.out(Easing.cubic),
              });
              scaleX.value = withDelay(
                1000,
                withTiming(CARD_DRAW_WIDTH / CARD_PLAYABLE_WIDTH, {
                  duration: 500,
                  easing: Easing.out(Easing.cubic),
                })
              );
              scaleY.value = withDelay(
                1000,
                withTiming(CARD_DRAW_HEIGHT / CARD_PLAYABLE_HEIGHT, {
                  duration: 500,
                  easing: Easing.out(Easing.cubic),
                })
              );
            }
          );
          setTimeout(() => {
            resolve(true);
          }, 3000);
        } catch (error) {
          console.log('Error on startCardToDiscardAnimation in CardAnimated');
          resolve(true);
        }
      });

    useImperativeHandle(ref, () => ({
      async startPlayAnimation(cardIndex: number) {
        setHasPendingAnimations(true);
        await startCardPlayedAnimation(cardIndex);
        // if (action === 'CARD_PLAYED') {
        //   await startCardPlayedAnimation();
        // } else if (action === 'HADES_DISCARDED') {
        //   await startCardToDiscardAnimation();
        // } else if (action === 'ARTEMIS_GIVED') {
        //   await startCardGivenAnimation();
        // } else if (action === 'HYPNOS_TURNED_OFF') {
        //   await startTurningOffAnimation();
        // }
        setTimeout(() => setHasPendingAnimations(false), 500);
      },
    }));

    const handleOnPressCard = async (card: Card) => {
      onCardPress(card);
    };

    const getCardItemMarginBottom = (index: number) => {
      if (sortedCards.length / maxNbCardsByLine > 2) {
        return -60;
      }

      if (sortedCards.length >= maxNbCardsByLine) {
        if (index < maxNbCardsByLine) {
          return 0;
        }
        return -50;
      }
    };

    const cartItemStyle = {
      marginLeft: currIndex % maxNbCardsByLine > 0 ? -50 : 0,
      marginBottom: getCardItemMarginBottom(currIndex),
    };
    return (
      <Animated.View style={animatedStyles} ref={cardRef}>
        <CardItem
          enabled={shouldPlay}
          card={item}
          onPress={handleOnPressCard}
          isLocked={cardLocked}
          style={cartItemStyle}
        />
      </Animated.View>
    );
  }
);

export default CardAnimated;
