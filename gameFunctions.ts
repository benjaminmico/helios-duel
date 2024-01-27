import { randomUUID as uuidv4 } from 'expo-crypto';

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
  isRemoved: boolean;
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
  SKIP_WITH_DICE_ROLL = 'SKIP_WITH_DICE_ROLL',
  DICE_ROLL_PICK_CARD = 'DICE_ROLL_PICK_CARD',
  DICE_ROLL_UNCHANGED = 'DICE_ROLL_UNCHANGED',
  GAME_FINISHED = 'GAME_FINISHED',
  GAME_FINISHED_ARTEMIS = 'GAME_FINISHED_ARTEMIS',
  GAME_FINISHED_GOD = 'GAME_FINISHED_GOD',
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

function addAction(action: Action): Action {
  console.log('Action: ', action);
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
const specialCards: Card[] = [
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
];

// Combine the standard cards and special cards to create the deck
export const deck: Card[] = [...standardCards, ...specialCards];

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

    console.log(`${player1.id} rolled: ${diceRollPlayer1}`);
    console.log(`${player2.id} rolled: ${diceRollPlayer2}`);

    if (diceRollPlayer1 > diceRollPlayer2) {
      console.log(`${player1.id} wins the dice duel!`);
      return { winnerDicePlayer: player1, looserDicePlayer: player2 };
    } else if (diceRollPlayer1 < diceRollPlayer2) {
      console.log(`${player2.id} wins the dice duel!`);
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
      console.log(
        `${winnerDicePlayer.id} wins the dice duel and starts the game!`
      );
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

  // // When skip, user has to roll the dice
  // game.action = {
  //   id: ActionName.SKIP_WITH_DICE_ROLL,
  //   playerId: game.currentPlayer.id,
  // };
  console.log(`${currentPlayer.id} skip turn`);
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
        game.players[currentPlayerIndex].cards.push(drawnCard);
      }
    }
  } else {
    game.action = addAction({
      id: ActionName.DICE_ROLL_UNCHANGED,
      playerId: game.currentPlayer.id,
      diceRoll,
    });
  }

  game = skipTurn(game, currentPlayer);

  // Clean the cards history
  game.cardsHistory = [];

  return game;
}

export const getCardOccurrences = (playerCards: Card[], card: Card) =>
  playerCards.filter((playerCard) => playerCard.position === card.position);

export function canPlayCard(game: Game, player: Player, card: Card): boolean {
  if (!game.cardsHistory.length) {
    return true;
  }

  const playerCards = player.cards.filter((c) => !c.isRemoved);
  const sameCardOccurrences = playerCards.filter(
    (playerCard) => playerCard.position === card.position
  ).length;

  const lastCardsPlayed = game.cardsHistory[0].cardsPlayed;

  if (!player.cards.includes(card)) {
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

export function playCard(
  game: Game,
  player: Player,
  cards: Card[]
): Game | null {
  if (game.currentPlayer !== player) {
    return null;
  }

  let newGame = game;

  // Remove the played cards from the player's hand
  newGame = removePlayerCards(newGame, newGame.currentPlayer, cards);

  // Add a new entry for the current cards played
  newGame = addCardHistoryEntry(newGame, newGame.currentPlayer, cards);

  for (const card of cards) {
    if (card.type === CardType.JOKER) {
      game.action = addAction({
        id: ActionName.JOKER,
        playerId: player.id,
      });
      newGame = cleanCardTable(newGame); // If any card is a JOKER, clean the table immediately
      return {
        ...newGame,
        currentPlayer: game.currentPlayer,
      };
      break;
    }
  }

  if (isPowerCard(cards[0])) {
    newGame.action = {
      id: cards[0].type as unknown as ActionName,
      playerId: player.id,
      card: JSON.stringify(cards.map((card) => card.value)),
    };
  } else {
    newGame.action = addAction({
      id: ActionName.CARD_PLAYED,
      playerId: player.id,
      card: JSON.stringify(cards.map((card) => card.value)),
    });
  }

  console.log(
    `${player.id} play ${JSON.stringify(cards.map((card) => card.value))}`
  );
  newGame = handlePowerCards(newGame, cards);

  return newGame;
}

export function playArtemis(
  game: Game,
  player: Player,
  cardsToPass: Card[]
): Game {
  let newGame = game;

  // Find the target player based on the provided player.id
  const targetPlayer = game.players.find((p) => p.id !== player.id);

  if (!targetPlayer) {
    // Handle the case where the target player is not found (e.g., return the original game)
    return newGame;
  }

  console.log('player ids', player.id, targetPlayer.id);

  // Remove the card from the player's hand
  newGame = removePlayerCards(newGame, player, cardsToPass);
  // Add the card to the target player's hand
  newGame = addCardsToPlayer(newGame, targetPlayer, cardsToPass);

  newGame.action = addAction({
    id: ActionName.ARTEMIS_GIVED,
    playerId: player.id,
    targetPlayerId: targetPlayer.id,
    cards: cardsToPass.map((card) => card.value),
  });

  console.log(
    `Artemis - ${JSON.stringify(
      cardsToPass.map((card) => card.value)
    )} gived to ${targetPlayer.id} through Artemis`
  );
  newGame = changePlayerHand(newGame);

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

  // Remove the best card from the target player's hand
  newGame = removePlayerCards(newGame, targetPlayer, [bestCard]);

  newGame.action = addAction({
    id: ActionName.HADES_DISCARDED,
    playerId: game.currentPlayer.id,
    targetPlayerId: targetPlayer.id,
    card: bestCard.value,
  });
  console.log(
    `Hades - best card removed from ${targetPlayer.id}, ${bestCard}, ${game}, ${newGame}`
  );

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
  newGame = turnOffCard(game, targetPlayer, bestCard);

  newGame.action = addAction({
    id: ActionName.HYPNOS_TURNED_OFF,
    playerId: game.currentPlayer.id,
    targetPlayerId: targetPlayer.id,
    card: bestCard.value,
  });
  console.log(
    `Hypnos - ${bestCard.value} turned off from ${targetPlayer.id}`,
    bestCard,
    game,
    newGame
  );

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

export function removePlayerCards(
  game: Game,
  player: Player,
  cards: Card[]
): Game {
  const newGame = game;
  const playerIndex = findPlayerIndex(newGame, player);

  if (playerIndex === -1) return newGame;

  for (const card of cards) {
    const cardIndex = newGame.players[playerIndex].cards.findIndex(
      (c) => c.id === card.id
    );
    if (cardIndex > -1) {
      newGame.players[playerIndex].cards[cardIndex].isRemoved = true;
    }
  }

  return newGame;
}

function addCardsToPlayer(game: Game, player: Player, cards: Card[]): Game {
  const newGame = game;
  const playerIndex = findPlayerIndex(newGame, player);

  // If the player is not found, exit the function
  if (playerIndex === -1) return newGame;

  // Add cards to the player's hand
  console.log('add cards to player');
  newGame.players[playerIndex].cards.push(...cards);

  return newGame;
}

function addCardHistoryEntry(game: Game, player: Player, cards: Card[]): Game {
  const newGame = { ...game }; // Shallow copy (be aware of nested objects)

  const newEntry = {
    playerId: player.id,
    cardsPlayed: cards,
  };

  newGame.cardsHistory.unshift(newEntry);

  return newGame;
}

function handlePowerCards(game: Game, cards: Card[]): Game {
  let newGame = game;
  for (const card of cards) {
    switch (card.type) {
      case CardType.JOKER: {
        newGame = cleanCardTable(newGame);
        return {
          ...newGame,
          currentPlayer: game.currentPlayer,
        };
      }

      case CardType.ARTEMIS: {
        return newGame;
      }
      case CardType.HADES: {
        newGame = playHades(newGame);
        newGame = changePlayerHand(newGame);
        return newGame;
      }
      case CardType.HYPNOS: {
        newGame = playHypnos(newGame);
        newGame = changePlayerHand(newGame);
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
  let bestCard = player.cards[0];
  let bestCardValue = calculateCardValue(bestCard);

  for (let card of player.cards) {
    const cardValue = calculateCardValue(card);
    if (cardValue > bestCardValue) {
      bestCard = card;
      bestCardValue = cardValue;
    }
  }

  return bestCard;
}

function turnOffCard(game: Game, player: Player, targetCard: Card): Game {
  const newGame = { ...game };
  const playerIndex = findPlayerIndex(newGame, player);

  // If the player is not found, exit the function
  if (playerIndex === -1) return newGame;

  // Find the card and set isTurnedOff to true
  for (let card of newGame.players[playerIndex].cards) {
    if (card.type === targetCard.type && card.value === targetCard.value) {
      card.position = 2;
      card.isTurnedOff = true;
      break; // Exit the loop once the card is found and modified
    }
  }

  return newGame;
}

export function isLastCardArtemis(game: Game): boolean {
  const lastCardHistory = game.cardsHistory[0];

  if (!lastCardHistory || lastCardHistory.cardsPlayed.length === 0) {
    return false; // No cards played in the last history or no history available
  }

  const lastPlayedCard = lastCardHistory.cardsPlayed[0];

  return (
    lastPlayedCard.type === CardType.ARTEMIS && !lastPlayedCard.isTurnedOff
  );
}

export function hasArtemisCard(player: Player): boolean {
  return player.cards.some((card) => card.type === CardType.ARTEMIS);
}

export function getWeakestCard(player: Player): Card | null {
  if (player.cards.length === 0) {
    return null; // Player has no cards
  }

  let weakestCard: Card | null = null;
  let weakestValue: number | null = null;

  for (const card of player.cards) {
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
    if (player.cards.length === 0) {
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
      const lastCardPlayed = game.cardsHistory[0]?.cardsPlayed[0];
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
  return player.cards.some(
    (card) => card.type === CardType.ARTEMIS && !card.isTurnedOff
  );
}
