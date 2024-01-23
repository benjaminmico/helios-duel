import React, {
  forwardRef,
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
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
import { Card as CardType } from 'gameFunctions';
import { AnimationsContext } from 'app/core/AnimationsProvider';
import Card from './Card';

interface IAnimatedHiddenCardItemProps {
  item: CardType;
  currIndex: number;
}

const AnimatedHiddenCardItem: FunctionComponent<IAnimatedHiddenCardItemProps> =
  forwardRef(({ item, currIndex }, ref) => {
    const [cardHidden, setCardHidden] = useState(true);
    const cardIsTurnedOff = useRef(false);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const scaleX = useSharedValue(1);
    const scaleY = useSharedValue(1);
    const cardRef = useRef<Animated.View>(null);
    const cardPreviousData = useRef<CardType>(item);

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

    // Animation when card is turned off (Hypnos effect).
    const startTurningOffAnimation = useCallback(
      () =>
        new Promise((resolve) => {
          try {
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
                    pageX -
                    2 +
                    5 +
                    (currIndex === 0
                      ? 10 - CARD_PREVIEW_WIDTH / 2
                      : CARD_PREVIEW_WIDTH / 2 - 20)
                );
                const translateY = Math.ceil(windowHeight / 3 - 2 * pageY - 40);

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
                scaleX.value = withRepeat(
                  withTiming(CARD_PREVIEW_WIDTH / CARD_HIDDEN_WIDTH, {
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                  }),
                  2,
                  true
                );
                scaleY.value = withRepeat(
                  withTiming(CARD_PREVIEW_HEIGHT / CARD_HIDDEN_HEIGHT, {
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                  }),
                  2,
                  true
                );
              }
            );
            setTimeout(() => {
              setCardHidden(false);
            }, 500);
            setTimeout(() => {
              resolve(true);
            }, 2000);
          } catch (error) {
            console.error(
              'Error on startTurningOffAnimation in AnimatedHiddenCardItem'
            );
            resolve(true);
          }
        }),
      [currIndex, offsetX, offsetY, scaleX, scaleY]
    );

    useEffect(() => {
      if (
        !cardIsTurnedOff.current &&
        item.isTurnedOff &&
        !cardPreviousData?.current?.isTurnedOff
      ) {
        startTurningOffAnimation();
        cardIsTurnedOff.current = true;
        cardPreviousData.current = item;
      }

      if (item.isTurnedOff) {
        setCardHidden(false);
      }
    }, [item, startTurningOffAnimation]);

    // Animation when card is played.
    const startCardPlayedAnimation = () =>
      new Promise((resolve) => {
        try {
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
                  pageX -
                  2 +
                  5 +
                  (currIndex === 0
                    ? 10 - CARD_PREVIEW_WIDTH / 2
                    : CARD_PREVIEW_WIDTH / 2 - 20)
              );
              const translateY = Math.ceil(
                windowHeight / 2 - pageY - CARD_PREVIEW_HEIGHT / 2 + 20
              );

              offsetX.value = withTiming(translateX, {
                duration: 700,
                easing: Easing.out(Easing.cubic),
              });
              offsetY.value = withTiming(translateY, {
                duration: 700,
                easing: Easing.out(Easing.cubic),
              });
              scaleX.value = withTiming(
                CARD_PREVIEW_WIDTH / CARD_HIDDEN_WIDTH,
                {
                  duration: 700,
                  easing: Easing.out(Easing.cubic),
                }
              );
              scaleY.value = withTiming(
                CARD_PREVIEW_HEIGHT / CARD_HIDDEN_HEIGHT,
                {
                  duration: 700,
                  easing: Easing.out(Easing.cubic),
                }
              );
            }
          );
          setTimeout(() => {
            setCardHidden(false);
          }, 500);
          setTimeout(() => {
            resolve(true);
          }, 700);
        } catch (error) {
          console.error(
            'Error on startCardPlayedAnimation in AnimatedHiddenCardItem'
          );

          resolve(true);
        }
      });

    // Animation when card is given to opponent (Artemis effect).
    const startCardGivenAnimation = () =>
      new Promise((resolve) => {
        try {
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
              setCardHidden(false);

              const translateX = Math.ceil(
                windowWidth / 2 -
                  pageX -
                  2 +
                  5 +
                  (currIndex === 0
                    ? 10 - CARD_PREVIEW_WIDTH / 2
                    : CARD_PREVIEW_WIDTH / 2 - 20)
              );
              const translateY = Math.ceil(
                windowHeight - windowHeight / 4 - pageY
              );

              offsetX.value = withTiming(translateX, {
                duration: 3000,
                easing: Easing.out(Easing.cubic),
              });
              offsetY.value = withTiming(translateY, {
                duration: 3000,
                easing: Easing.out(Easing.cubic),
              });

              scaleX.value = withTiming(
                CARD_PLAYABLE_WIDTH / CARD_HIDDEN_WIDTH,
                {
                  duration: 500,
                  easing: Easing.out(Easing.cubic),
                }
              );
              scaleY.value = withTiming(
                CARD_PLAYABLE_HEIGHT / CARD_HIDDEN_HEIGHT,
                {
                  duration: 500,
                  easing: Easing.out(Easing.cubic),
                }
              );
            }
          );
          setTimeout(() => {
            resolve(true);
          }, 3000);
        } catch (error) {
          console.error(
            'Error on startCardGivenAnimation in AnimatedHiddenCardItem'
          );
          resolve(true);
        }
      });

    // Animation when card is sent to discard (Hades effect).
    const startCardToDiscardAnimation = () =>
      new Promise((resolve) => {
        try {
          setCardHidden(false);
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
                windowWidth -
                  windowWidth / 4 -
                  pageX +
                  (currIndex === 0 ? 28 : 72)
              );
              const translateY = Math.ceil(
                windowHeight / 2 - pageY - CARD_PREVIEW_HEIGHT / 2.5
              );

              offsetX.value = withTiming(translateX, {
                duration: 3000,
                easing: Easing.out(Easing.cubic),
              });
              offsetY.value = withTiming(translateY, {
                duration: 3000,
                easing: Easing.out(Easing.cubic),
              });
              scaleX.value = withDelay(
                1000,
                withTiming(CARD_DRAW_WIDTH / CARD_HIDDEN_WIDTH, {
                  duration: 1000,
                  easing: Easing.out(Easing.cubic),
                })
              );
              scaleY.value = withDelay(
                1000,
                withTiming(CARD_DRAW_HEIGHT / CARD_HIDDEN_HEIGHT, {
                  duration: 1000,
                  easing: Easing.out(Easing.cubic),
                })
              );
            }
          );
          setTimeout(() => {
            resolve(true);
          }, 3000);
        } catch (error) {
          console.error(
            'Error on startCardToDiscardAnimation in AnimatedHiddenCardItem'
          );

          resolve(true);
        }
      });

    useImperativeHandle(ref, () => ({
      async startPlayAnimation(action: string) {
        setHasPendingAnimations(true);
        if (
          action === 'CARD_PLAYED' ||
          action === 'ARTEMIS' ||
          action === 'HYPNOS' ||
          action === 'HERMES' ||
          action === 'HADES'
        ) {
          await startCardPlayedAnimation();
        } else if (action === 'HADES_DISCARDED') {
          await startCardToDiscardAnimation();
        } else if (action === 'ARTEMIS_GIVED') {
          await startCardGivenAnimation();
        }
        setTimeout(() => setHasPendingAnimations(false), 500);
      },
    }));

    const cartItemStyle = {
      marginLeft: currIndex > 0 ? -50 : 0,
    };
    return (
      <Animated.View style={animatedStyles} ref={cardRef}>
        <Card
          enabled={false}
          card={item}
          onPress={() => {}}
          style={cartItemStyle}
          isHidden={cardHidden}
          type='HIDDEN'
          isOpponentCard
        />
      </Animated.View>
    );
  });

export default AnimatedHiddenCardItem;
