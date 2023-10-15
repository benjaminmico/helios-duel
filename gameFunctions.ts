import { v4 as uuidv4 } from 'uuid';

export interface CurrentCard {
  playerId: string;
  cardsPlayed: Card[];
}

export interface Card {
  id: string;
  type: CardType;
  value: string;
  position: number;
  isTurnedOff: boolean;
}

export interface Player {
  id: string;
  cards: Card[];
}

export interface CardHistory {
  playerId: string;
  cardsPlayed: Card[];
}

export interface Game {
  id: string;
  players: Player[];
  currentPlayer: Player;
  cardsHistory: CardHistory[];
  deck: Card[];
  discardPile: Card[];
  chosenLevel: BotDifficulty;
}

export enum CardType {
  NORMAL_HEARTS = 'NORMAL_HEARTS',
  NORMAL_DIAMONDS = 'NORMAL_DIAMONDS',
  NORMAL_CLUBS = 'NORMAL_CLUBS',
  NORMAL_SPADES = 'NORMAL_SPADES',
  JOKER = 'JOKER',
  HADES = 'HADES',
  ARTEMIS = 'ARTEMIS',
  HYPNOS = 'HYPNOS',
}

export enum CardValue {
  A = 'A',
  K = 'K',
  Q = 'Q',
  J = 'J',
  TEN = '10',
  NINE = '9',
  EIGHT = '8',
  SEVEN = '7',
  SIX = '6',
  FIVE = '5',
  FOUR = '4',
  THREE = '3',
  TWO = '2',
}

export enum BotDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}
export type Strategy = (playableCards: Card[], game: Game) => Card[] | null;

export type CardGod =
  | CardType.JOKER
  | CardType.HADES
  | CardType.ARTEMIS
  | CardType.HYPNOS;

export function calculateCardValue(card: Card): number {
  switch (card.type) {
    case CardType.JOKER:
      return 16;
    case CardType.HADES:
      return 15;
    case CardType.ARTEMIS:
      return 14;
    case CardType.HYPNOS:
      return 13;
    default:
      switch (card.value as CardValue) {
        case CardValue.A:
          return 12;
        case CardValue.K:
          return 11;
        case CardValue.Q:
          return 10;
        case CardValue.J:
          return 9;
        case CardValue.TEN:
          return 8;
        case CardValue.NINE:
          return 7;
        case CardValue.EIGHT:
          return 6;
        case CardValue.SEVEN:
          return 5;
        case CardValue.SIX:
          return 4;
        case CardValue.FIVE:
          return 3;
        case CardValue.FOUR:
          return 2;
        case CardValue.THREE:
          return 1;
        case CardValue.TWO:
          return 0;
        default:
          return 0;
      }
  }
}

// Define the standard playing cards
const standardCards: Card[] = [];

// Create the standard cards from 2 to 10 for each suit
const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
for (const suit of suits) {
  for (let value = 2; value <= 10; value++) {
    const card: Card = {
      id: uuidv4(),
      type: `NORMAL_${suit}` as CardType,
      value: value.toString(),
      position: value,
      isTurnedOff: false,
    };
    standardCards.push(card);
  }
}

// Add face cards (J, Q, K, A) for each suit
const faceValues = ['J', 'Q', 'K', 'A'];
const positionFaceMapping: { [key in (typeof faceValues)[number]]: number } = {
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

for (const suit of suits) {
  for (const value of faceValues) {
    const card: Card = {
      id: uuidv4(),
      type: `NORMAL_${suit}` as CardType,
      value: value,
      position: positionFaceMapping[value],
      isTurnedOff: false,
    };
    standardCards.push(card);
  }
}

// case CardType.JOKER:
//   return 16;
// case CardType.HADES:
//   return 15;
// case CardType.ARTEMIS:
//   return 14;
// case CardType.HYPNOS:
//   return 13;

// Define the special cards (JOKER, HADES, ARTEMIS, HYPNOS)
const specialCards: Card[] = [
  {
    id: uuidv4(),
    type: CardType.JOKER,
    value: 'JOKER',
    position: 18,
    isTurnedOff: false,
  },
  {
    id: uuidv4(),
    type: CardType.JOKER,
    value: 'JOKER',
    position: 18,
    isTurnedOff: false,
  },
  {
    id: uuidv4(),
    type: CardType.HADES,
    value: 'HADES',
    position: 17,
    isTurnedOff: false,
  },
  {
    id: uuidv4(),
    type: CardType.HADES,
    value: 'HADES',
    position: 17,
    isTurnedOff: false,
  },
  {
    id: uuidv4(),
    type: CardType.ARTEMIS,
    value: 'ARTEMIS',
    position: 16,
    isTurnedOff: false,
  },
  {
    id: uuidv4(),
    type: CardType.ARTEMIS,
    value: 'ARTEMIS',
    position: 16,
    isTurnedOff: false,
  },
  {
    id: uuidv4(),
    type: CardType.HYPNOS,
    value: 'HYPNOS',
    position: 15,
    isTurnedOff: false,
  },
  {
    id: uuidv4(),
    type: CardType.HYPNOS,
    value: 'HYPNOS',
    position: 15,
    isTurnedOff: false,
  },
];

// Combine the standard cards and special cards to create the deck
export const deck: Card[] = [...standardCards, ...specialCards];

// Function to roll a dice (returns a random number between 1 and 6)
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// Function to conduct a dice duel between two players
export function diceDuel(player1: Player, player2: Player): Player | null {
  while (true) {
    const diceRollPlayer1 = rollDice();
    const diceRollPlayer2 = rollDice();

    console.log(`${player1.id} rolled: ${diceRollPlayer1}`);
    console.log(`${player2.id} rolled: ${diceRollPlayer2}`);

    if (diceRollPlayer1 > diceRollPlayer2) {
      console.log(`${player1.id} wins the dice duel!`);
      return player1;
    } else if (diceRollPlayer1 < diceRollPlayer2) {
      console.log(`${player2.id} wins the dice duel!`);
      return player2;
    } else {
      console.log("It's a tie! Rolling the dice again...");
      // If it's a tie, continue the loop to roll the dice again
    }
  }
}

// Function to shuffle an array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to distribute cards randomly from the deck to players
export function distributeCards(game: Game): void {
  const { deck, players } = game;

  shuffleArray(deck);

  const numberOfPlayers = players.length;
  const totalCards = numberOfPlayers * 14;

  if (deck.length < totalCards) {
    console.log('Not enough cards in the deck to distribute to players.');
    return;
  }

  for (let i = 0; i < totalCards; i++) {
    const playerIndex = i % numberOfPlayers;
    const card = deck.pop()!;
    players[playerIndex].cards.push(card);
  }
}

// Updated function to initialize the game, including the dice duel and card distribution
export function initializeGame(players: Player[], deck: Card[]): Game {
  const game: Game = {
    id: uuidv4(),
    players: players,
    currentPlayer: players[0],
    cardsHistory: [],
    deck,
    discardPile: [],
    chosenLevel: BotDifficulty.EASY,
  };

  console.log('Initiating dice duel to determine the starting player...');

  while (true) {
    const firstPlayer = diceDuel(players[0], players[1]);

    if (firstPlayer !== null) {
      game.currentPlayer = firstPlayer;
      console.log(`${firstPlayer.id} wins the dice duel and starts the game!`);
      break;
    }
  }

  distributeCards(game);

  return game;
}

// Function to draw a card from the deck
export function drawCardFromDeck(game: Game): Card | null {
  const { deck } = game;

  if (deck.length === 0) {
    console.log('The deck is empty. Cannot draw a card.');
    return null;
  }

  return deck.shift()!;
}

export function skipTurn(game: Game, currentPlayer: Player): Game {
  game.currentPlayer = game.players.find(
    (player) => player.id !== currentPlayer.id
  )!;

  return game;
}

// Function to handle Helios rule when a player cannot or does not want to play a card
export function rollDiceAndSkipTurn(game: Game): Game {
  const { currentPlayer } = game;
  const diceRoll = rollDice();
  console.log(`${currentPlayer.id} rolled: ${diceRoll}`);

  if (diceRoll <= 3) {
    // Draw a card from the remaining deck and give the hand to the other player
    const drawnCard = drawCardFromDeck(game);
    if (drawnCard) {
      console.log(`${currentPlayer.id} drew a card: ${drawnCard.value}`);

      // Find the index of the current player in the game.players array
      const currentPlayerIndex = game.players.findIndex(
        (player) => player.id === currentPlayer.id
      );

      // If the current player is found in the game.players array, add the drawn card to their cards
      if (currentPlayerIndex !== -1) {
        game.players[currentPlayerIndex].cards.push(drawnCard);
      }
    }
  }

  game = skipTurn(game, currentPlayer);

  // Clean the cards history
  game.cardsHistory = [];

  return game;
}

export function canPlayCard(game: Game, player: Player, card: Card): boolean {
  if (!game.cardsHistory.length) {
    return true;
  }

  const playerCards = player.cards;
  const sameCardOccurences = playerCards.filter(
    (playerCard) => playerCard.position === card.position
  ).length;

  const lastCardsPlayed = game.cardsHistory[0].cardsPlayed;

  if (!player.cards.includes(card)) {
    return false;
  }

  console.log('lastCardsPlayed', lastCardsPlayed);

  // if (
  //   lastCardsPlayed.length > 1 &&
  //   lastCardsPlayed[0].position === lastCardsPlayed[1].position
  // ) {
  //   return false;
  // }

  // New Logic for the case you mentioned
  if (lastCardsPlayed.length > 1) {
    if (
      card.position >= lastCardsPlayed[0].position &&
      sameCardOccurences >= lastCardsPlayed.length
    ) {
      return true;
    }
    console.log('BBBB');
    // Check if the card being played has the same length as the last cards
    if ([card].length < lastCardsPlayed.length) {
      return false;
    }

    // Ensure the card being played has a position higher or equal to the last card played
    if (card.position < lastCardsPlayed[0].position) {
      return false;
    }
  } else if (card.position >= lastCardsPlayed[0].position) {
    console.log('heuiehriu');
    return true;
  }

  return false;
}

export function canPlayMultipleCards(
  game: Game,
  player: Player,
  cards: Card[]
): boolean {
  // Check if the player has all the cards
  for (let card of cards) {
    if (!player.cards.includes(card)) {
      return false;
    }
  }

  const lastCardPlayed =
    game.cardsHistory.length > 0 ? game.cardsHistory[0].cardsPlayed[0] : null;

  const numberOfCards = cards.length;

  if (!lastCardPlayed) {
    return true;
  }

  const lastCardValue = calculateCardValue(lastCardPlayed);

  for (let card of cards) {
    if (calculateCardValue(card) < lastCardValue) {
      return false;
    }
  }

  return (
    numberOfCards === 1 ||
    cards.every((card) => calculateCardValue(card) === lastCardValue)
  );
}

// Function to clean the card table and add played cards to the discard pile
export function cleanCardTable(game: Game): Game {
  // Move the played cards to the discard pile
  const lastCardsPlayed =
    game.cardsHistory.length > 0 ? game.cardsHistory[0].cardsPlayed : [];

  game.discardPile = [...game.discardPile, ...lastCardsPlayed];

  // Clear the cards history
  game.cardsHistory = [];

  // Set the next player as the currentPlayer
  const currentPlayerIndex = game.players.findIndex(
    (p) => p.id === game.currentPlayer.id
  );
  const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
  game.currentPlayer = game.players[nextPlayerIndex];

  return game;
}

export function playCard(
  game: Game,
  player: Player,
  cards: Card[]
): Game | null {
  if (game.currentPlayer !== player) {
    return null;
  }

  for (const card of cards) {
    if (!player.cards.includes(card)) {
      return null;
    }
  }

  let newGame: Game | null = {
    ...game,
    cardsHistory: [...game.cardsHistory],
    players: game.players.map((p) => ({
      ...p,
      cards: [...p.cards], // Créez une copie des cartes du joueur
    })),
  };

  const currentCardValue =
    newGame.cardsHistory.length > 0
      ? calculateCardValue(newGame.cardsHistory[0].cardsPlayed[0])
      : -1; // Set to -1 if no cards played yet

  const cardsValues = cards.map((card) => calculateCardValue(card));

  // Remove the played cards from the player's hand
  const playerIndex = newGame.players.findIndex((p) => p.id === player.id);
  for (const card of cards) {
    const cardIndex = newGame.players[playerIndex].cards.findIndex(
      (c) => c.type === card.type && c.value === card.value
    );
    if (cardIndex > -1) {
      newGame.players[playerIndex].cards.splice(cardIndex, 1); // Retirez la carte du joueur
    }
  }

  // Add a new entry for the current cards played
  newGame.cardsHistory.unshift({
    playerId: player.id,
    cardsPlayed: cards,
  });

  for (const card of cards) {
    if (card.type === CardType.JOKER) {
      newGame = cleanCardTable(newGame); // If any card is a JOKER, clean the table immediately
      return {
        ...newGame,
        currentPlayer: game.currentPlayer,
      };
      break;
    }
  }

  // Update currentPlayer to the other player
  newGame.currentPlayer = newGame.players.find(
    (p) => p.id !== game.currentPlayer.id
  )!;

  return newGame;
}

export function playArtemis(
  game: Game,
  player: Player,
  targetPlayer: Player,
  cardToPass: Card
): boolean {
  // Check if the player has the card to pass
  if (!player.cards.includes(cardToPass)) {
    return false;
  }

  // Remove the card from the player's hand
  player.cards = player.cards.filter((card) => card !== cardToPass);

  // Add the card to the target player's hand
  targetPlayer.cards.push(cardToPass);

  // Successful action
  return true;
}

export function playHades(
  game: Game,
  player: Player,
  targetPlayer: Player
): boolean {
  // If the target player has no cards, return false
  if (targetPlayer.cards.length === 0) {
    return false;
  }

  // Determine the best card of the target player
  let bestCard = targetPlayer.cards[0];
  let bestCardValue = calculateCardValue(bestCard);
  for (let card of targetPlayer.cards) {
    const cardValue = calculateCardValue(card);
    if (cardValue > bestCardValue) {
      bestCard = card;
      bestCardValue = cardValue;
    }
  }

  // Remove the best card from the target player's hand
  targetPlayer.cards = targetPlayer.cards.filter((card) => card !== bestCard);

  // If the target player has no more cards, they are eliminated
  if (targetPlayer.cards.length === 0) {
    game.players = game.players.filter((p) => p !== targetPlayer);
  }

  // Successful action
  return true;
}

export function playHypnos(
  game: Game,
  player: Player,
  targetPlayer: Player
): boolean {
  // If the target player has no cards, return false
  if (targetPlayer.cards.length === 0) {
    return false;
  }

  // Determine the best card of the target player
  let bestCard = targetPlayer.cards[0];
  let bestCardValue = calculateCardValue(bestCard);

  for (let card of targetPlayer.cards) {
    const cardValue = calculateCardValue(card);
    if (cardValue > bestCardValue) {
      bestCard = card;
      bestCardValue = cardValue;
    }
  }

  // Extinguish the best card by turning it into a '2'
  bestCard.type =
    CardType.NORMAL_HEARTS ||
    CardType.NORMAL_DIAMONDS ||
    CardType.NORMAL_CLUBS ||
    CardType.NORMAL_SPADES;
  // bestCard.value = '2';
  bestCard.isTurnedOff = true;
  // Successful action
  return true;
}

export function playJoker(game: Game, player: Player): boolean {
  // Check if the player has a JOKER card
  const jokerCard = player.cards.find((card) => card.type === CardType.JOKER);
  if (!jokerCard) {
    return false;
  }

  // Remove the JOKER card from the player's hand
  player.cards = player.cards.filter((card) => card !== jokerCard);

  // The player becomes the current player and starts a new round
  game.currentPlayer = player;
  game.discardPile = game.cardsHistory?.length
    ? game.cardsHistory.map((cardHistory) => cardHistory.cardsPlayed).flat()
    : [];
  game.cardsHistory = [];
  // Successful action
  return true;
}

export function isPowerCard(card: Card): boolean {
  return [
    CardType.JOKER,
    CardType.HADES,
    CardType.ARTEMIS,
    CardType.HYPNOS,
  ].includes(card.type);
}

export function isNormalCard(card: Card): boolean {
  return (
    card.type === CardType.NORMAL_HEARTS ||
    card.type === CardType.NORMAL_DIAMONDS ||
    card.type === CardType.NORMAL_CLUBS ||
    card.type === CardType.NORMAL_SPADES
  );
}
