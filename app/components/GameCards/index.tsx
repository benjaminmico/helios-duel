import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Card, Game, canPlayCard, getCardOccurrences } from 'gameFunctions';
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { currentPlayerCards, sortedBotCards, sortedCards } from 'app/handlers';
import CardAnimated from '../CardAnimated';
import CardCurrentPlayer from '../CardCurrentPlayer';
import GameCardsSelected from './GameCardsSelected';
import GameCardsOpponent from './GameCardsOpponent';
import CardCurrentPlayed from './CardCurrentPlayed';

interface IPresidentCurrentPlayerCards {
  game: Game;
  playerCardsRefs: React.MutableRefObject<Animated.View[]>;
  onCardsSelected: (cards: Card[]) => void;
  style?: ViewStyle;
}

export const MAX_NB_CARDS_BY_LINE = 9;

const PresidentCurrentPlayerCards: FunctionComponent<
  IPresidentCurrentPlayerCards
> = ({ game, playerCardsRefs, onCardsSelected, style }) => {
  const cards = sortedCards(game.players);

  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [firstSelectedCard, setFirstSelectedCard] = useState<Card>();

  const [hidePlayedCardsDuringAnimation, setHidePlayedCardsDuringAnimation] =
    useState(false);

  const hasSelectedCard = useRef<boolean>(false);

  const offsetY = useSharedValue(0);
  const animatedListStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: offsetY.value }],
      zIndex: 1000,
    };
  });

  const onCardPress = (item: Card) => {
    const firstCardAlreadyPlayed = game.cardsHistory?.[0];
    const cardsOccurrence = getCardOccurrences(cards, item);

    // Select only allowed multiple cards
    if (
      !!selectedCards?.length &&
      selectedCards?.find((card) => card.value !== item.value) &&
      selectedCards.length <
        (firstCardAlreadyPlayed?.cardsPlayed?.length || 9999)
    ) {
      return;
    }

    // If Card has occurence or must onP played with occurence add the card item on selector
    if (
      firstCardAlreadyPlayed?.cardsPlayed.length > 1 ||
      cardsOccurrence.length > 1
    ) {
      if (selectedCards?.length === 0) {
        setFirstSelectedCard(item);
      }
      setSelectedCards((currentSelectedCards) => [
        ...currentSelectedCards,
        item,
      ]);
      return;
    }

    onCardsSelected([item]);
  };

  const renderItem: ListRenderItem<Card> = ({ item, index }) => {
    const canPlay = canPlayCard(game, game.currentPlayer, item);

    return (
      <CardAnimated
        //@ts-ignore
        ref={(ref) =>
          (playerCardsRefs.current = {
            ...(playerCardsRefs.current || {}),
            [item.id]: ref,
          })
        }
        isPlayingAgainstBot
        shouldPlay={canPlay}
        maxNbCardsByLine={MAX_NB_CARDS_BY_LINE}
        nbCardsOccurrences={index % 2}
        item={item}
        onCardPress={onCardPress}
        cardLocked={!canPlay}
        currIndex={index}
        sortedCards={cards || []}
      />
    );
  };

  const onCancelCardSelection = () => {
    setFirstSelectedCard(undefined);
    setSelectedCards([]);
  };

  const onPlaySelection = () => {
    hasSelectedCard.current = true;
    onCardsSelected(selectedCards);
    setFirstSelectedCard(undefined);
    setSelectedCards([]);
  };

  const renderPlayCard = useCallback(
    (props: any) => <CardCurrentPlayer nbCards={cards.length} {...props} />,
    [cards.length]
  );

  const renderCardList = () => {
    return (
      <FlatList
        contentContainerStyle={styles.cardsContentContainerStyle}
        numColumns={MAX_NB_CARDS_BY_LINE}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(card: Card) => `${card?.id}`}
        style={styles.flatListContainer}
        data={cards}
        renderItem={renderItem}
        scrollEnabled={false}
        CellRendererComponent={renderPlayCard}
      />
    );
  };

  return (
    <>
      <View style={style}>
        {!!cards?.length && (
          <Animated.View style={animatedListStyles}>
            {renderCardList()}
          </Animated.View>
        )}
      </View>
      <View
        style={{
          position: 'absolute',
          alignSelf: 'center',
          marginTop: 80,
        }}
      >
        <GameCardsOpponent
          game={game}
          hidePlayedCards={setHidePlayedCardsDuringAnimation}
          startNewCardFromPileAnimation={setHidePlayedCardsDuringAnimation}
        />
      </View>
      {!!selectedCards?.length && (
        <GameCardsSelected
          onCancelCardSelection={onCancelCardSelection}
          onPlaySelection={onPlaySelection}
          selectedCards={selectedCards}
        />
      )}
      <CardCurrentPlayed game={game} />
    </>
  );
};

export default PresidentCurrentPlayerCards;

const styles = StyleSheet.create({
  flatListContainer: {
    alignSelf: 'center',
    zIndex: 2,
    overflow: 'visible',
  },
  cardsContentContainerStyle: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column-reverse',
    overflow: 'visible',
  },
  selectedCard: { zIndex: 99999 },
  selectedCardsContainer: {
    position: 'absolute',
    top: windowHeight / 2 - 20,
    zIndex: 99999,
  },
  selectedCardsValidateButton: {
    position: 'absolute',
    bottom: 170,
    right: 10,
    alignSelf: 'center',
    marginLeft: 10,
    zIndex: 9,
  },
  cancelButton: { alignSelf: 'center', marginTop: -10 },
});
