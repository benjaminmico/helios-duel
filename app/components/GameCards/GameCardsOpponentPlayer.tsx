import React, { useCallback } from 'react';
import { FlatList, StyleSheet, ListRenderItemInfo, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import CardAnimated from '../CardAnimated';
import { Card, Game, canPlayCard } from 'gameFunctions';
import CardCurrentPlayer from '../CardCurrentPlayer';
import CardAnimatedOpponent from '../CardAnimatedOpponent';

interface GameCardsOpponentPlayerProps {
  cards: Card[];
  opponentPlayerCardsRefs: React.MutableRefObject<Animated.View[]>;
}

const GameCardsOpponentPlayer: React.FC<GameCardsOpponentPlayerProps> = ({
  cards,
  opponentPlayerCardsRefs,
}) => {
  const offsetY = useSharedValue(0);

  const animatedListStyles = useAnimatedStyle(() => {
    return {
      ...styles.container,
      transform: [{ translateY: offsetY.value }],
      zIndex: 1,
    };
  });

  const renderItem = ({ item, index }: ListRenderItemInfo<Card>) => {
    return (
      <CardAnimatedOpponent
        //@ts-ignore
        ref={(ref) =>
          (opponentPlayerCardsRefs.current = {
            ...(opponentPlayerCardsRefs.current || {}),
            [item.id]: ref,
          })
        }
        item={item}
        currIndex={index}
      />
    );
  };

  if (!cards?.length) return;

  return (
    <Animated.View style={animatedListStyles}>
      <FlatList
        data={cards}
        keyExtractor={(card: Card) => card.id}
        horizontal
        contentContainerStyle={{}}
        scrollEnabled={false}
        style={{ overflow: 'visible' }}
        renderItem={renderItem}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 140,
    alignSelf: 'center',
  },
  cardsContentContainerStyle: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column-reverse',
    overflow: 'visible',
  },
  flatListContainer: {
    alignSelf: 'center',
    zIndex: 2,
    overflow: 'visible',
  },
});

export default GameCardsOpponentPlayer;
