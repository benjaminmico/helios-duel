import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
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
import { ViewStyle } from 'react-native';
import { handleSkipTurn, sortedBotCards, sortedCards } from 'app/handlers';
import GameCardsSelected from './GameCardsSelected';
import CardCurrentPlayed from './CardCurrentPlayed';
import GameCardsDefaultPlayer from './GameCardsDefaultPlayer';
import { useDispatch } from 'react-redux';
import { actionPlayGame } from 'app/actions/gameActions';
import { getBotCards } from 'bot/bot.service';
import GameCardsOpponentPlayer from './GameCardsOpponentPlayer';

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
  const cards = sortedCards(game.players);
  const opponentCards = sortedBotCards(game.players);

  const dispatch = useDispatch();

  const defaultPlayerCardsRefs = useRef<Animated.View[]>([]);
  const opponentPlayerCardsRefs = useRef<Animated.View[]>([]);

  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [firstSelectedCard, setFirstSelectedCard] = useState<Card>();
  const [hasPressedCard, setHasPressedCard] = useState<boolean>(false);
  const [selectedCardOccurrences, setSelectedCardOccurrences] =
    useState<number>();

  const hasSelectedCard = useRef<boolean>(false);

  // Play Bot when ready
  useEffect(() => {
    setTimeout(() => playBotTurnIfNecessary(), 100);
  }, [game.currentPlayer.id]);

  const playBotTurnIfNecessary = async () => {
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
          const weakestCard = getWeakestCard(game.currentPlayer); // Get the weakest card for each Artemis

          if (weakestCard) {
            gameAfterArtemisPlay = playArtemis(game, game.currentPlayer, [
              weakestCard,
            ]);
            if (gameAfterArtemisPlay) {
              dispatch(actionPlayGame(gameAfterArtemisPlay));
            }
          }
        }
      });

      setTimeout(() => actionPlayGame(changePlayerHand(game)), 2000);
    }
  };

  const playSelectedCards = (playedCards: Card[]) => {
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
  };

  const onCardsSelected = async (cards: Card[]) => {
    setHasPressedCard(true);

    if (cards?.length >= 1 && cards?.[0].type === CardType.ARTEMIS) {
      setSelectedCards(cards);
      setSelectedCardOccurrences(cards?.length);
      return;
    }

    // Start card animation
    startCardsAnimations(defaultPlayerCardsRefs, cards);

    setTimeout(() => playSelectedCards(cards), 1400);
  };

  const onCancelCardSelection = () => {
    setFirstSelectedCard(undefined);
    setSelectedCards([]);
  };

  const onCardPress = (item: Card) => {
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

    // cannot select multiple cards with different values
    if (selectedCards?.length && item.value !== selectedCards?.[0]?.value) {
      return;
    }

    // if Card has occurrence or must on played with occurrence add the card item on selector
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

  const onPlaySelection = () => {
    hasSelectedCard.current = true;
    onCardsSelected(selectedCards);
    // clean card selected
    setFirstSelectedCard(undefined);
    setSelectedCards([]);
  };

  return (
    <>
      <GameCardsDefaultPlayer
        cards={cards}
        defaultPlayerCardsRefs={defaultPlayerCardsRefs}
        onCardPress={onCardPress}
        MAX_NB_CARDS_BY_LINE={MAX_NB_CARDS_BY_LINE}
        game={game}
      />
      <GameCardsOpponentPlayer
        cards={opponentCards}
        opponentPlayerCardsRefs={opponentPlayerCardsRefs}
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
