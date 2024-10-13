import { randomUUID as uuidv4 } from 'expo-crypto';
import _ from 'lodash';

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
  isArtemisCardGiven?: boolean;
}

export interface Player {
  id: string;
  cards: Card[];
  liveCards: Card[];
}

export interface CardHistory {
  playerId: string;
  cardsPlayed: Card[];
}

export interface Game {
  id: string;
  players: Player[];
  createdAt: string;
  currentPlayer: Player;
  cardsPlayed: CardHistory[];
  deck: Card[];
  deckCardsGiven: Card[];
  discardPile: Card[];
  chosenLevel: BotDifficulty;
  action?: Action;
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

export enum ActionName {
  GAME_BEGIN = 'GAME_BEGIN',
  CARD = 'CARD', //to add on Frontend side
  CARD_PLAYED = 'CARD_PLAYED',
  ARTEMIS = 'ARTEMIS',
  HYPNOS = 'HYPNOS',
  HADES = 'HADES',
  JOKER = 'JOKER',
  ARTEMIS_GIVED = 'ARTEMIS_GIVED',
  HADES_DISCARDED = 'HADES_DISCARDED',
  HYPNOS_TURNED_OFF = 'HYPNOS_TURNED_OFF',
  SKIP_TURN = 'SKIP_TURN',
  SKIP_WITH_DICE_ROLL = 'SKIP_WITH_DICE_ROLL',
  DICE_ROLL_PICK_CARD = 'DICE_ROLL_PICK_CARD',
  DICE_ROLL_UNCHANGED = 'DICE_ROLL_UNCHANGED',
  GAME_FINISHED = 'GAME_FINISHED',
  GAME_FINISHED_ARTEMIS = 'GAME_FINISHED_ARTEMIS',
  GAME_FINISHED_GOD = 'GAME_FINISHED_GOD',
  CURRENT_PLAYER = 'CURRENT_PLAYER',
}

export type Action = {
  id: ActionName;
  [key: string]: any;
};

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

export function addAction(action: Action): Action {
  return action;
}

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
export const specialCards: Card[] = [
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
];

// Combine the standard cards and special cards to create the deck
export const deck: Card[] = [...standardCards, ...specialCards];
export const deckCardsGiven: Card[] = [...specialCards];

// Function to roll a dice (returns a random number between 1 and 6)
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// Function to conduct a dice duel between two players
export function diceDuel(
  player1: Player,
  player2: Player
): { winnerDicePlayer: Player; looserDicePlayer: Player } | null {
  while (true) {
    const diceRollPlayer1 = rollDice();
    const diceRollPlayer2 = rollDice();

    // console.log(`${player1.id} rolled: ${diceRollPlayer1}`);
    // console.log(`${player2.id} rolled: ${diceRollPlayer2}`);

    if (diceRollPlayer1 > diceRollPlayer2) {
      // console.log(`${player1.id} wins the dice duel!`);
      return { winnerDicePlayer: player1, looserDicePlayer: player2 };
    } else if (diceRollPlayer1 < diceRollPlayer2) {
      // console.log(`${player2.id} wins the dice duel!`);
      return { winnerDicePlayer: player2, looserDicePlayer: player1 };
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

  // Distribute the remaining cards
  for (let i = 0; i < totalCards - 3; i++) {
    const playerIndex = i % numberOfPlayers;
    const card = deck.pop()!;
    players[playerIndex].cards.push(card); // Initial state cards
    players[playerIndex].liveCards.push(card); // Live state cards
  }
}

// To prevent immutability
// To prevent immutability and filter duplicate ids
function deepCopyDeck(deck: Card[]): Card[] {
  const newDeck: Card[] = [];
  const seenIds = new Set<string>();

  for (const card of deck) {
    if (!seenIds.has(card.id)) {
      const newCard = Object.assign({}, card, {
        isLive: true,
      });
      newDeck.push(newCard);
      seenIds.add(card.id);
    }
  }

  return newDeck;
}
// Updated function to initialize the game, including the dice duel and card distribution
export function initializeGame(players: Player[], deck: Card[]): Game {
  const game: Game = {
    id: uuidv4(),
    players: players,
    createdAt: new Date(Date.now()).toISOString(),
    currentPlayer: players[0],
    cardsPlayed: [],
    deck,
    deckCardsGiven: [],
    discardPile: [],
    chosenLevel: BotDifficulty.EASY,
  };

  // console.log('Initiating dice duel to determine the starting player...');

  while (true) {
    const result = diceDuel(players[0], players[1]);

    if (result?.winnerDicePlayer !== null) {
      //@ts-ignore
      const { winnerDicePlayer, looserDicePlayer } = result;
      game.currentPlayer = winnerDicePlayer;
      game.action = addAction({
        id: ActionName.GAME_BEGIN,
        winnerDicePlayerId: winnerDicePlayer.id,
        looserDicePlayerId: looserDicePlayer.id,
      });
      // console.log(
      //   `${winnerDicePlayer.id} wins the dice duel and starts the game!`
      // );
      break;
    }
  }

  distributeCards(game);

  return game;
}

// Function to draw a card from the deck
export function drawCardFromDeck(game: Game): Card | null {
  const { deck, deckCardsGiven } = game;

  // Filter the deck to exclude cards that are in deckCardsGiven
  const availableDeck = deck.filter(
    (card) => !deckCardsGiven.some((givenCard) => givenCard.id === card.id)
  );

  console.log('availableDeck', availableDeck?.length);

  if (availableDeck.length === 0) {
    // console.log('The deck is empty. Cannot draw a card.');
    return null;
  }

  // Draw the first card from the filtered deck
  const drawnCard = availableDeck.shift()!;

  // Create a new array for deckCardsGiven to preserve immutability
  game.deckCardsGiven = [...deckCardsGiven, drawnCard];

  return drawnCard;
}

export function skipTurn(game: Game): Game {
  const currentPlayer = game.currentPlayer;

  // Set next player
  game.currentPlayer = game.players.find(
    (player) => player.id !== game.currentPlayer.id
  )!;

  game.action = addAction({
    id: ActionName.SKIP_TURN,
    playerId: currentPlayer.id,
    nextPlayerId: game.currentPlayer.id,
  });
  // console.log(`${currentPlayer} skip turn`);
  return game;
}

// Function to handle Helios rule when a player cannot or does not want to play a card
export function rollDiceAndSkipTurn(game: Game): {
  game: Game;
  drawnCard?: Card;
  targetPlayer?: Player;
} {
  const { currentPlayer } = game;
  const diceRoll = rollDice();
  // console.log(`${currentPlayer.id} rolled: ${diceRoll}`);

  if (diceRoll <= 3) {
    // Draw a card from the remaining deck and give the hand to the other player
    const drawnCard = drawCardFromDeck(game);
    if (drawnCard) {
      // console.log(`${currentPlayer.id} drew a card: ${drawnCard.value}`);
      game.action = addAction({
        id: ActionName.DICE_ROLL_PICK_CARD,
        playerId: game.currentPlayer.id,
        diceRoll,
      });
      // Find the index of the current player in the game.players array
      const currentPlayerIndex = game.players.findIndex(
        (player) => player.id === currentPlayer.id
      );

      // If the current player is found in the game.players array, add the drawn card to their cards
      if (currentPlayerIndex !== -1) {
        game.players[currentPlayerIndex].liveCards.push(drawnCard);
      }
      game = skipTurn(game);
      return { game, drawnCard, targetPlayer: currentPlayer };
    }
  } else {
    game.action = addAction({
      id: ActionName.DICE_ROLL_UNCHANGED,
      playerId: game.currentPlayer.id,
      diceRoll,
    });
  }

  game = skipTurn(game);

  return { game, drawnCard: undefined, targetPlayer: undefined };
}

export const getCardOccurrences = (playerCards: Card[], card: Card) =>
  playerCards.filter((playerCard) => playerCard.position === card.position);

export function canPlayCard(
  card: Card,
  playerCardsHand: Card[],
  cardHistory: CardHistory[]
): boolean {
  if (!cardHistory?.length) {
    return true;
  }

  const playerCards = playerCardsHand;
  const sameCardOccurrences = playerCards.filter(
    (playerCard) => playerCard.position === card.position
  ).length;

  const lastCardsPlayed = cardHistory[0].cardsPlayed;

  if (!playerCardsHand.includes(card)) {
    return false;
  }

  // New Logic for the case you mentioned
  if (lastCardsPlayed.length > 1) {
    if (
      card.position >= lastCardsPlayed[0].position &&
      sameCardOccurrences >= lastCardsPlayed.length
    ) {
      return true;
    }
    // Check if the card being played has the same length as the last cards
    if ([card].length < lastCardsPlayed.length) {
      return false;
    }

    // Ensure the card being played has a position higher or equal to the last card played
    if (card.position < lastCardsPlayed[0].position) {
      return false;
    }
  } else if (card.position >= lastCardsPlayed[0].position) {
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
    game.cardsPlayed.length > 0 ? game.cardsPlayed[0].cardsPlayed[0] : null;

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

export function playCards(game: Game, cards: Card[]): Game | null {
  // Find the player who has the first card in the cards array
  const currentPlayer = game.players.find((player) =>
    player.liveCards.some((liveCard) => liveCard.id === cards[0].id)
  );

  let newGame = game;

  if (!currentPlayer) {
    // console.log('Player not found for the given cards');
    return null;
  }

  if (game.currentPlayer !== currentPlayer) {
    // console.log("It's not the current player's turn");
    return null;
  }

  // // Remove the played cards from the player's hand
  // newGame = removePlayerCards(newGame, newGame.currentPlayer, cards);

  // Add a new entry for the current cards played
  newGame = addCardHistoryEntry(newGame, newGame.currentPlayer, cards);

  if (isPowerCard(cards[0])) {
    newGame.action = {
      id: cards[0].type as unknown as ActionName,
      playerId: currentPlayer.id,
      card: JSON.stringify(cards.map((card) => card.value)),
    };
  } else {
    newGame.action = addAction({
      id: ActionName.CARD_PLAYED,
      playerId: currentPlayer.id,
      card: JSON.stringify(cards.map((card) => card.value)),
    });
  }

  newGame = handlePowerCards(newGame, cards);

  if (canNoPlayerPlayAnyCard(newGame) && cards[0]?.value !== CardType.ARTEMIS) {
    newGame = cleanCardTable(game);
  }

  return newGame;
}

export function playJoker(game: Game, cards: Card[]): Game | null {
  if (cards?.[0]?.value !== 'JOKER') return game;

  game.action = addAction({
    id: ActionName.JOKER,
    playerId: game.currentPlayer.id,
  });
  let newGame = cleanCardTable(game);

  return newGame;
}

export function playArtemis(game: Game, cardsToPass: Card[]): Game {
  let newGame = game;

  // Check if there are any cards played
  if (!game.cardsPlayed[0]) {
    return game;
  }

  // Find the player who has the first card in the cards array
  const currentPlayer = game.players.find((player) =>
    player.liveCards.some((card) => card.id === cardsToPass[0].id)
  );

  if (!currentPlayer) return game;

  // Find the target player based on the provided player.id
  const targetPlayer = game.players.find((p) => p.id !== currentPlayer.id);

  if (!targetPlayer) {
    // Handle the case where the target player is not found (e.g., return the original game)
    return newGame;
  }

  // Add the card to the target player's hand
  newGame = addCardsToPlayer(newGame, targetPlayer, cardsToPass);

  // Check the latest cards played and set isArtemisCardGiven to true for Artemis cards
  game.cardsPlayed[0].cardsPlayed.forEach((card) => {
    if (card.type === CardType.ARTEMIS) {
      card.isArtemisCardGiven = true;
    }
  });

  newGame.action = addAction({
    id: ActionName.ARTEMIS_GIVED,
    playerId: currentPlayer.id,
    targetPlayerId: targetPlayer.id,
    cards: cardsToPass.map((card) => card.value),
  });

  // console.log(
  //   `Artemis - ${JSON.stringify(
  //     cardsToPass.map((card) => card.value)
  //   )} gived to ${targetPlayer.id} through Artemis`
  // );
  newGame = changePlayerHand(newGame);

  if (canNoPlayerPlayAnyCard(newGame)) {
    newGame = cleanCardTable(newGame);
  }

  return newGame;
}

export function playHades(game: Game): Game {
  let newGame = game;

  // Find the target player based on the provided player.id
  const targetPlayer = game.players.find(
    (p) => p.id !== game.currentPlayer.id
  ) as Player;

  // If the target player has no cards, return false
  if (targetPlayer.cards.length === 0) {
    return game;
  }

  // Determine the best card of the target player
  const bestCard = findBestCard(targetPlayer);

  newGame = addCardsToPlayer(newGame, game.currentPlayer, [bestCard]);

  newGame.action = addAction({
    id: ActionName.HADES_DISCARDED,
    playerId: game.currentPlayer.id,
    targetPlayerId: targetPlayer.id,
    card: bestCard.value,
  });
  // console.log(
  //   `Hades - best card removed from ${targetPlayer.id}, ${bestCard.type}`
  // );

  // Successful action
  return newGame;
}

export function playHypnos(game: Game): Game {
  let newGame = game;

  // Find the target player based on the provided player.id
  const targetPlayer = game.players.find(
    (p) => p.id !== game.currentPlayer.id
  ) as Player;

  // Determine the best card of the target player
  const bestCard = findBestCard(targetPlayer);

  // Turn off best card
  newGame = setTurnOffCard(game, targetPlayer, bestCard);

  newGame.action = addAction({
    id: ActionName.HYPNOS_TURNED_OFF,
    playerId: game.currentPlayer.id,
    targetPlayerId: targetPlayer.id,
    card: bestCard.value,
  });
  // console.log(`Hypnos - ${bestCard.value} turned off from ${targetPlayer.id}`);
  // console.log(`Current Player - ${game.currentPlayer.id}`);

  return newGame;
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

// Function to clean the card table and add played cards to the discard pile
export function cleanCardTable(game: Game): Game {
  // console.log('CLEAN CARD TABLE');
  // Move the played cards to the discard pile
  const lastCardsPlayed =
    game.cardsPlayed.length > 0
      ? game.cardsPlayed.flatMap((history) => history.cardsPlayed)
      : [];

  game.discardPile = [...game.discardPile, ...lastCardsPlayed];

  // Clear the cards history
  game.cardsPlayed = [];

  return game;
}

function findPlayerIndex(game: Game, player: Player): number {
  return game.players.findIndex((p) => p.id === player.id);
}

export function changePlayerHand(game: Game): Game {
  const newGame = { ...game };
  newGame.currentPlayer = newGame.players.find(
    (p) => p.id !== game.currentPlayer.id
  )!;
  return newGame;
}

function addCardsToPlayer(game: Game, player: Player, cards: Card[]): Game {
  const newGame = game;
  const playerIndex = findPlayerIndex(newGame, player);

  // If the player is not found, exit the function
  if (playerIndex === -1) return newGame;

  // Remove cards from the opponent player
  for (const opponent of newGame.players) {
    if (opponent.id !== player.id) {
      opponent.liveCards = opponent.liveCards.filter(
        (opponentCard) => !cards.some((card) => card.id === opponentCard.id)
      );
    }
  }

  newGame.players[playerIndex].liveCards.push(...cards);

  return newGame;
}

function addCardHistoryEntry(game: Game, player: Player, cards: Card[]): Game {
  const newGame = { ...game }; // Shallow copy (be aware of nested objects)

  const newEntry = {
    playerId: player.id,
    cardsPlayed: cards,
  };

  newGame.cardsPlayed.unshift(newEntry);

  // Remove the played cards from the player's liveCards
  const playerIndex = newGame.players.findIndex((p) => p.id === player.id);
  if (playerIndex !== -1) {
    newGame.players[playerIndex].liveCards = newGame.players[
      playerIndex
    ].liveCards.filter(
      (liveCard) => !cards.some((card) => card.id === liveCard.id)
    );
  }

  return newGame;
}

export function isSpecialCard(cardType: CardType, cardPosition: number) {
  return (
    specialCards.find((c: Card) => c.type === cardType)?.position ===
    cardPosition
  );
}

function handlePowerCards(game: Game, cards: Card[]): Game {
  let newGame = game;
  for (const card of cards) {
    switch (true) {
      case card.type === CardType.ARTEMIS &&
        isSpecialCard(CardType.ARTEMIS, card.position): {
        return newGame;
      }

      case card.type === CardType.HADES &&
        isSpecialCard(CardType.HADES, card.position): {
        newGame = playHades(newGame);
        newGame = changePlayerHand(newGame);
        return newGame;
      }
      case card.type === CardType.HYPNOS &&
        isSpecialCard(CardType.HYPNOS, card.position): {
        newGame = playHypnos(newGame);
        newGame = changePlayerHand(newGame);
        return newGame;
      }
      case card.type === CardType.JOKER &&
        isSpecialCard(CardType.JOKER, card.position): {
        return newGame;
      }
      default: {
        newGame = changePlayerHand(newGame);
        return newGame;
      }
    }
  }
  return newGame;
}

function findBestCard(player: Player): Card {
  let bestCard: Card | null = null;
  let bestCardPosition = -Infinity;

  for (let card of player.liveCards) {
    if (card.position > bestCardPosition) {
      bestCard = card;
      bestCardPosition = card.position;
    }
  }

  return bestCard!;
}

function setTurnOffCard(game: Game, player: Player, targetCard: Card): Game {
  const newGame = { ...game };
  const playerIndex = findPlayerIndex(newGame, player);

  // If the player is not found, return the original game
  if (playerIndex === -1) return newGame;

  // Find the card and set isTurnedOff to true
  for (let liveCard of newGame.players[playerIndex].liveCards) {
    if (
      liveCard.type === targetCard.type &&
      liveCard.value === targetCard.value
    ) {
      liveCard.position = 2;
      liveCard.isTurnedOff = true;
      break; // Exit the loop once the card is found and modified
    }
  }

  return newGame;
}

export function isLastCardArtemis(game: Game): boolean {
  const lastCardHistory = game.cardsPlayed[0];

  if (!lastCardHistory || lastCardHistory.cardsPlayed.length === 0) {
    return false; // No cards played in the last history or no history available
  }

  const lastPlayedCard = lastCardHistory.cardsPlayed[0];

  return (
    lastPlayedCard.type === CardType.ARTEMIS && !lastPlayedCard.isTurnedOff
  );
}

export function hasArtemisCard(player: Player): boolean {
  return player.liveCards.some((card) => card.type === CardType.ARTEMIS);
}

export function getWeakestCard(player: Player): Card | null {
  if (player.liveCards.length === 0) {
    return null; // Player has no cards
  }

  let weakestCard: Card | null = null;
  let weakestValue: number | null = null;

  for (const card of player.liveCards) {
    const cardValue = calculateCardValue(card);

    if (weakestCard === null || cardValue < weakestValue!) {
      weakestCard = card;
      weakestValue = cardValue;
    }
  }

  return weakestCard;
}

export function isGameOver(game: Game): {
  isOver: boolean;
  winner?: Player;
  loser?: Player;
  reason?: string;
} {
  for (const player of game.players) {
    if (player.liveCards.length === 0) {
      const currentPlayer = game.players.find((p) => p.id === player.id);
      const opponent = game.players.find((p) => p.id !== player.id);

      // Check for an active Artemis card in the opponent's hand
      if (opponent && hasActiveArtemisCard(opponent)) {
        game.action = addAction({
          id: ActionName.GAME_FINISHED_ARTEMIS,
          winnerPlayerId: currentPlayer?.id,
          artemisOwnerPlayerId: opponent.id,
        });
        return { isOver: false };
      }

      // Check if the last card played by the winning player is a power card
      const lastCardPlayed = game.cardsPlayed[0]?.cardsPlayed[0];
      if (lastCardPlayed && isPowerCard(lastCardPlayed)) {
        game.action = addAction({
          id: ActionName.GAME_FINISHED_GOD,
          winnerPlayerId: opponent?.id,
          looserPlayerId: player?.id,
        });

        return {
          isOver: true,
          winner: opponent, // Opponent wins if last card played is a power card
          loser: player,
          reason: 'Playing a power card as the last card results in a loss.',
        };
      }

      game.action = addAction({
        id: ActionName.GAME_FINISHED,
        winnerPlayerId: player.id,
        looserPlayerId: opponent?.id,
      });

      // Normal win condition
      return {
        isOver: true,
        winner: player,
        loser: opponent,
      };
    }
  }

  // Game is not over if no player has 0 cards
  return { isOver: false };
}

// Function to check if a player has an active Artemis card
function hasActiveArtemisCard(player: Player): boolean {
  return player.liveCards.some(
    (card) => card.type === CardType.ARTEMIS && !card.isTurnedOff
  );
}

export function canNoPlayerPlayAnyCard(game: Game): boolean {
  let allCannotPlay = true; // Assume no player can play any card initially
  const playableCards: { playerId: string; cards: Card[] }[] = [];

  for (const player of game.players) {
    const currentPlayerCards = player.liveCards;
    const playerPlayableCards: Card[] = [];

    for (const card of currentPlayerCards) {
      const canPlay = canPlayCard(card, currentPlayerCards, game.cardsPlayed);

      if (canPlay) {
        allCannotPlay = false; // If any card can be played, set to false
        playerPlayableCards.push(card);
      }
    }

    if (playerPlayableCards.length > 0) {
      playableCards.push({ playerId: player.id, cards: playerPlayableCards });
    }
  }

  return allCannotPlay; // Return the result after logging all cards
}
