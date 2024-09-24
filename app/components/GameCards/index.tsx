import React, {
  FunctionComponent,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import Animated from 'react-native-reanimated';
import {
  Card,
  CardType,
  Game,
  canPlayCard,
  changePlayerHand,
  getCardOccurrences,
  getWeakestCard,
  isGameOver,
  isLastCardArtemis,
  playArtemis,
  playCard,
} from 'gameFunctions';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { handleSkipTurn, sortedBotCards, sortedCards } from 'app/handlers';
import GameCardsSelected from './GameCardsSelected';
import CardCurrentPlayed from './CardCurrentPlayed';
import GameCardsDefaultPlayer from './GameCardsDefaultPlayer';
import { useDispatch } from 'react-redux';
import { actionPlayGame } from 'app/actions/gameActions';
import { getBotCards } from 'bot/bot.service';
import GameCardsOpponentPlayer from './GameCardsOpponentPlayer';
import ButtonAction from '../ButtonAction';
import CardPile from './CardPile';
import GameInformations from '../GameInformations';
import GameArtemisModal from './GameArtemisModal';

interface IPresidentCurrentPlayerCards {
  game: Game;
  style?: ViewStyle;
}

export const MAX_NB_CARDS_BY_LINE = 9;

const startCardsAnimations = async (
  playerCardsRefs: React.MutableRefObject<Animated.View[]>,
  cards: Card[]
) => {
  await Promise.all(
    cards.map(async (card: Card, index: number) => {
      const cardId = card.id as any;
      if (playerCardsRefs?.current?.[cardId]) {
        const cardReference = playerCardsRefs?.current[cardId];
        if (cardReference) {
          //@ts-ignore
          await cardReference.startPlayAnimation(index);
        }
      }
    })
  );
};

const PresidentCurrentPlayerCards: FunctionComponent<
  IPresidentCurrentPlayerCards
> = ({ game }) => {
  const cards = useMemo(() => sortedCards(game.players), [game]);
  const opponentCards = useMemo(() => sortedBotCards(game.players), [game]);

  const dispatch = useDispatch();

  const defaultPlayerCardsRefs = useRef<Animated.View[]>([]);
  const opponentPlayerCardsRefs = useRef<Animated.View[]>([]);

  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const hasSelectedCard = useRef<boolean>(false);

  // Play Bot when ready
  useEffect(() => {
    setTimeout(() => playBotTurnIfNecessary(), 2000);
  }, [game.currentPlayer.id]);

  const playBotTurnIfNecessary = useCallback(async () => {
    if (game.currentPlayer.id === 'bot') {
      const botCards = await getBotCards(game, game.currentPlayer.id);

      // The case the bot can't play
      if (!botCards?.length) {
        const newGame = handleSkipTurn(game);
        dispatch(actionPlayGame(newGame));
        setSelectedCards([]);
        return;
      }

      startCardsAnimations(opponentPlayerCardsRefs, botCards);

      setTimeout(() => playSelectedCards(botCards), 2000);

      let gameAfterArtemisPlay;

      // The bot can play + Artemis case
      botCards.forEach(async (card) => {
        if (card.type === CardType.ARTEMIS) {
          setTimeout(() => {
            const weakestCard = getWeakestCard(game.currentPlayer); // Get the weakest card for each Artemis

            if (weakestCard) {
              gameAfterArtemisPlay = playArtemis(game, game.currentPlayer, [
                weakestCard,
              ]);
              if (gameAfterArtemisPlay) {
                dispatch(actionPlayGame(gameAfterArtemisPlay));
              }
            }
          }, 2000);
        }
        if (
          card.type === CardType.JOKER ||
          card.type === CardType.HADES ||
          card.type === CardType.HYPNOS
        ) {
          setTimeout(() => playBotTurnIfNecessary(), 2000);
          return;
        }
      });

      setTimeout(() => actionPlayGame(changePlayerHand(game)), 2000);
    }
  }, [game, dispatch]);

  const playSelectedCards = useCallback(
    (playedCards: Card[]) => {
      if (playedCards.length >= 1) {
        const newGame = playCard(game, game.currentPlayer, playedCards);

        if (newGame) {
          dispatch(actionPlayGame(newGame));
          const gameState = isGameOver(newGame);
          if (gameState.isOver) {
            // TODO: Display Error Modal
            // setShowModal(true); // Add this line
          }
        }
        if (
          newGame &&
          isLastCardArtemis(newGame) &&
          game.currentPlayer.id !== 'bot'
        ) {
          // setShouldDisplayArtemisSelection(true);
        }
        setSelectedCards([]);
      }
    },
    [game, dispatch]
  );

  const onCardsSelected = useCallback(
    async (cards: Card[]) => {
      // if (cards?.length >= 1 && cards?.[0].type === CardType.ARTEMIS) {
      //   setSelectedCards(cards);
      //   setSelectedCardOccurrences(cards?.length);
      //   return;
      // }

      // Start card animation
      startCardsAnimations(defaultPlayerCardsRefs, cards);

      setTimeout(() => playSelectedCards(cards), 1400);
    },
    [playSelectedCards]
  );

  const onCancelCardSelection = useCallback(() => {
    setSelectedCards([]);
  }, []);

  const onCardPress = useCallback(
    (item: Card) => {
      const firstCardAlreadyPlayed = game.cardsHistory?.[0];
      const cardsOccurrence = getCardOccurrences(cards, item);

      const unpressableCards =
        !!selectedCards?.length &&
        selectedCards?.find((card) => card.value !== item.value) &&
        selectedCards.length < firstCardAlreadyPlayed?.cardsPlayed?.length;

      // select only allowed multiple cards
      if (unpressableCards) {
        return;
      }

      if (selectedCards.find((c) => c.id === item.id)) return;

      console.log('vvvv', item.position, selectedCards?.[0]?.position);
      // cannot select multiple cards with different values
      if (
        selectedCards?.length &&
        item.position !== selectedCards?.[0]?.position
      ) {
        return;
      }

      const noCardsPlayedWithMultipleOccurrence =
        !firstCardAlreadyPlayed?.cardsPlayed.length &&
        cardsOccurrence.length > 1;
      const cardsPlayedWithMultipleOccurrence =
        firstCardAlreadyPlayed?.cardsPlayed.length > 1 &&
        firstCardAlreadyPlayed?.cardsPlayed.length >= cardsOccurrence.length;

      const canPlaySelectedCards = !game.cardsHistory?.length
        ? true
        : selectedCards.length <= game.cardsHistory?.length;

      // if Card has occurrence or must on played with occurrence add the card item on selector
      if (
        noCardsPlayedWithMultipleOccurrence ||
        cardsPlayedWithMultipleOccurrence
      ) {
        if (!canPlaySelectedCards) return;

        setSelectedCards((currentSelectedCards) => [
          ...currentSelectedCards,
          item,
        ]);
        return;
      }

      onCardsSelected([item]);
    },
    [game, cards, selectedCards, onCardsSelected]
  );

  const onPlaySelection = useCallback(() => {
    hasSelectedCard.current = true;
    onCardsSelected(selectedCards);
    // clean card selected
    setSelectedCards([]);
  }, [selectedCards, onCardsSelected]);

  const onSkipPress = useCallback(() => {
    const newGame = handleSkipTurn(game);
    dispatch(actionPlayGame(newGame));
    setSelectedCards([]);
  }, [game, dispatch]);

  console.log('game');

  return (
    <>
      <GameCardsDefaultPlayer
        cards={cards}
        defaultPlayerCardsRefs={defaultPlayerCardsRefs}
        onCardPress={onCardPress}
        onSkipPress={onSkipPress}
        MAX_NB_CARDS_BY_LINE={MAX_NB_CARDS_BY_LINE}
        game={game}
      />
      <GameInformations game={game} style={styles.gameInfoContainer} />
      <CardPile game={game} />
      <GameCardsOpponentPlayer
        cards={opponentCards}
        opponentPlayerCardsRefs={opponentPlayerCardsRefs}
      />
      <GameCardsSelected
        onCancelCardSelection={onCancelCardSelection}
        onPlaySelection={onPlaySelection}
        selectedCards={selectedCards}
        canPlaySelectedCards={
          !game.cardsHistory?.length ||
          selectedCards.length === game.cardsHistory?.length
        }
      />
      <CardCurrentPlayed game={game} />
      <GameArtemisModal
        game={game}
        onArtemisCardsSelected={(gameAfterArtemisPlay: Game) =>
          dispatch(actionPlayGame(gameAfterArtemisPlay))
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  gameInfoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    top: 0,
  },
});

export default React.memo(PresidentCurrentPlayerCards);
