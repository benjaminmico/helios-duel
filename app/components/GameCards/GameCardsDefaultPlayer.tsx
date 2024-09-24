import React, { useCallback } from 'react';
import { FlatList, StyleSheet, ListRenderItemInfo, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import CardAnimated from '../CardAnimated';
import { Card, Game, canPlayCard } from 'gameFunctions';
import CardCurrentPlayer from '../CardCurrentPlayer';
import ButtonAction from '../ButtonAction';

interface GameCardsDefaultPlayerProps {
  cards: Card[];
  defaultPlayerCardsRefs: React.MutableRefObject<Animated.View[]>;
  onCardPress: (card: Card) => void;
  onSkipPress: () => void;
  MAX_NB_CARDS_BY_LINE: number;
  game: Game;
}

const GameCardsDefaultPlayer: React.FC<GameCardsDefaultPlayerProps> = ({
  cards,
  defaultPlayerCardsRefs,
  onCardPress,
  onSkipPress,
  MAX_NB_CARDS_BY_LINE,
  game,
}) => {
  const offsetY = useSharedValue(0);

  const animatedListStyles = useAnimatedStyle(() => {
    return {
      ...styles.container,
      transform: [{ translateY: offsetY.value }],
      zIndex: 2,
    };
  });

  const renderPlayCard = useCallback(
    (props: any) => <CardCurrentPlayer nbCards={cards.length} {...props} />,
    [cards.length]
  );

  const renderItem = ({ item, index }: ListRenderItemInfo<Card>) => {
    const canPlay = canPlayCard(game, game.currentPlayer, item);

    return (
      <CardAnimated
        // @ts-ignore
        ref={(ref) =>
          (defaultPlayerCardsRefs.current = {
            ...(defaultPlayerCardsRefs.current || {}),
            [item.id]: ref,
          })
        }
        isPlayingAgainstBot
        shouldPlay={canPlay}
        maxNbCardsByLine={MAX_NB_CARDS_BY_LINE}
        nbCardsOccurrences={index % 2}
        item={item}
        onCardPress={() => {
          onCardPress(item);
        }}
        cardLocked={!canPlay}
        currIndex={index}
        sortedCards={cards}
      />
    );
  };

  if (!cards?.length) return;

  return (
    <>
      {game.currentPlayer.id !== 'bot' && (
        <ButtonAction
          label='Skip'
          onPress={onSkipPress}
          style={{ position: 'absolute', bottom: 170, left: 10 }}
        />
      )}
      <Animated.View style={animatedListStyles}>
        <FlatList
          contentContainerStyle={styles.cardsContentContainerStyle}
          numColumns={MAX_NB_CARDS_BY_LINE}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(card) => `${card.id}`}
          style={styles.flatListContainer}
          data={cards}
          renderItem={renderItem}
          scrollEnabled={false}
          CellRendererComponent={renderPlayCard}
        />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
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

export default GameCardsDefaultPlayer;
