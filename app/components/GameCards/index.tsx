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
import GameCardsDefaultPlayer from './GameCardsDefaultPlayer';

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

  return (
    <>
      <GameCardsDefaultPlayer
        cards={cards}
        playerCardsRefs={playerCardsRefs}
        onCardPress={onCardPress}
        MAX_NB_CARDS_BY_LINE={MAX_NB_CARDS_BY_LINE}
        game={game}
      />
      <GameCardsOpponent
        game={game}
        hidePlayedCards={setHidePlayedCardsDuringAnimation}
        startNewCardFromPileAnimation={setHidePlayedCardsDuringAnimation}
      />
      <GameCardsSelected
        onCancelCardSelection={onCancelCardSelection}
        onPlaySelection={onPlaySelection}
        selectedCards={selectedCards}
      />

      <CardCurrentPlayed game={game} />
    </>
  );
};

export default PresidentCurrentPlayerCards;
