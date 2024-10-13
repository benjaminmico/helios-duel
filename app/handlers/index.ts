import _ from 'lodash';
import {
  Card,
  CardHistory,
  CardType,
  Game,
  Player,
  getWeakestCard,
  playArtemis,
  rollDiceAndSkipTurn,
} from 'gameFunctions';

export const handlePlayCard = (
  card: Card,
  selectedCards: Card[],
  game: Game
) => {
  try {
    const lastTurnCardsCount = _.get(
      game,
      'cardsPlayed[0].cardsPlayed.length',
      0
    );

    // Remove the selected card if it's already selected
    if (_.some(selectedCards, { id: card.id })) {
      return _.filter(selectedCards, (c) => c.id !== card.id);
    }

    // Can't select a number of cards higher than the previous one number of cards played
    if (
      lastTurnCardsCount > 0 &&
      selectedCards?.length === lastTurnCardsCount
    ) {
      return selectedCards;
    }

    // If there are already selected cards, check if their position matches the new card
    if (
      selectedCards.length > 0 &&
      !_.every(selectedCards, { position: card.position })
    ) {
      // If positions do not match, return the current state without adding the new card
      return selectedCards;
    }

    let updatedSelectedCards;

    // Add the card if it's not already selected
    updatedSelectedCards = _.concat(selectedCards, card);

    return updatedSelectedCards;
  } catch (error) {
    console.error('Error in handlePlayCard:', error);
    return selectedCards;
  }
};
export const handleSelectArtemisCard = (
  card: Card,
  selectedArtemisCards: Card[],
  lastCardPlayedCount: number
) => {
  try {
    let updatedSelectedArtemisCards = [...selectedArtemisCards];
    if (_.some(updatedSelectedArtemisCards, { id: card.id })) {
      updatedSelectedArtemisCards = _.filter(
        updatedSelectedArtemisCards,
        (c: Card) => c.id !== card.id
      );
    } else if (updatedSelectedArtemisCards.length < lastCardPlayedCount) {
      updatedSelectedArtemisCards = _.concat(updatedSelectedArtemisCards, card);
    }
    return updatedSelectedArtemisCards;
  } catch (error) {
    console.error('Error in handleSelectArtemisCard:', error);
    return selectedArtemisCards;
  }
};

export const handleSkipTurn = (game: Game) => {
  try {
    const newGame = rollDiceAndSkipTurn(game);
    return newGame;
  } catch (error) {
    console.error('Error in handleSkipTurn:', error);
    return game;
  }
};

export const handlePlayArtemis = (
  selectedArtemisCards: Card[],
  game: Game,
  currentPlayer: Player
) => {
  try {
    const newGame = playArtemis(game, currentPlayer, selectedArtemisCards);
    return newGame;
  } catch (error) {
    console.error('Error in handlePlayArtemis:', error);
    return game;
  }
};

export const handleBotPlayArtemis = (
  game: Game,
  currentPlayer: Player,
  cards: Card[]
): Game | undefined => {
  try {
    return cards.forEach(async (card) => {
      if (card.type === CardType.ARTEMIS) {
        const weakestCard = getWeakestCard(currentPlayer); // Get the weakest card for each Artemis

        if (weakestCard) {
          const gameAfterArtemisPlay = playArtemis(game, currentPlayer, [
            weakestCard,
          ]);
          if (gameAfterArtemisPlay) {
            return gameAfterArtemisPlay;
          }
        }
      }
    });
  } catch (error) {
    console.error('Error in handlePlayArtemis:', error);
    return game;
  }
};

// @TODO improve that based on local player id

export const getPlayer = (
  players: Player[],
  playerId: string | 'self' | 'opponent'
) => {
  switch (playerId) {
    case 'self':
      return players.find((player) => player.id !== 'bot');
    case 'opponent':
      return players.find((player) => player.id === 'bot');
    default:
      return players.find((player) => player.id == playerId);
  }
};

export const selfPlayerCards = (
  players: Player[],
  type: 'cards' | 'liveCards' = 'cards'
) => {
  const selfCards = players.find((player) => player.id !== 'bot')?.[type] || [];
  return selfCards.sort((a, b) => a.position - b.position);
};

export const opponentPlayerCards = (
  players: Player[],
  type: 'cards' | 'liveCards' = 'cards'
) => {
  const opponentCards =
    players.find((player) => player.id === 'bot')?.[type] || [];
  return opponentCards.sort((a, b) => a.position - b.position);
};

export const sortedBotCards = (
  players: Player[],
  type: 'cards' | 'liveCards' = 'cards'
) => _.sortBy(opponentPlayerCards(players, type), 'position');
export const sortedCards = (
  players: Player[],
  type: 'cards' | 'liveCards' = 'cards'
) => _.sortBy(selfPlayerCards(players, type), 'position');

export const getGameCardsHistory = (cardsPlayed: CardHistory[]) =>
  _.map(cardsPlayed, (card: CardHistory) => ({
    playerId: card.playerId,
    cardsPlayed: _.map(card.cardsPlayed, 'value'),
  }));
