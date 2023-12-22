import { Card, CardType } from 'gameFunctions';
import {
  MCTSGame,
  MCTSGameCard,
  MCTSGameDeck,
  MCTSMove,
  MCTSMovePlayCard,
  MCTSMoveSkip,
  MCTSPlayer,
  MCTSTree,
} from './mcts.types';

export const deepCopy = <T = unknown>(element: T): T =>
  JSON.parse(JSON.stringify(element));

/**
 * Check if a tree represents an ending gameState. It means it is both fully
 * explored and has no remaining possibles moves.
 */
export const checkTerminalState = (tree: MCTSTree) =>
  tree.remainingPossiblesMoves.length === 0 && tree.children.length === 0;

/**
 * Check if a game is a final gameState. It means that at least one player has
 * an empty hand.
 */
export const checkFinalState = (game: MCTSGame): boolean => {
  const currentPlayer = game.players.find(
    ({ id }) => id === game.currentPlayerId
  );
  if (!currentPlayer) {
    return false;
  }

  if (currentPlayer.cards.length === 0) {
    return true;
  }

  const otherPlayer = game.players.find(
    ({ id }) => id !== game.currentPlayerId
  );

  if (!otherPlayer) {
    return false;
  }

  if (otherPlayer.cards.length !== 0) {
    return false;
  }

  if (!currentPlayer.cards || currentPlayer.cards.includes(null)) {
    currentPlayer.cards = currentPlayer.cards.filter((card) => card !== null);
  }

  // check if currentPlayer can play artemis
  const currentPlayerArtemisCount = currentPlayer.cards.filter(
    (card) => card?.type === CardType.ARTEMIS
  ).length;

  const lastPlayMove = game?.currentPlayHistory?.find(
    ({ cards }) => cards && cards.length > 0
  );

  // If there is no turn, but the player has Artemis
  if (!lastPlayMove) {
    return currentPlayerArtemisCount > 0;
  }

  const isSkipRule = checkSkipRule(game);

  const lastPlayedCard = lastPlayMove.cards[0];
  const lastPlayedOccurence = lastPlayMove.cards.length;

  const canPlayArtemis =
    (isSkipRule
      ? lastPlayedCard.value === '15'
      : lastPlayedCard.value <= '15') &&
    currentPlayerArtemisCount >= lastPlayedOccurence;

  return !canPlayArtemis;
};

const _skipMoves: Array<MCTSMove> = [
  { skip: true, draw: true },
  { skip: true, draw: false },
];
const getSkipMoves = () => deepCopy(_skipMoves);

/**
 * If two players played the same value back to back, next player has to play
 * the same value, or skip.
 */
export const checkSkipRule = (game: MCTSGame) => {
  const lastPlayedCardIndex = game.currentPlayHistory.findIndex(
    ({ cards }) => !!cards && cards.length > 0
  );

  // no move was done this turn
  if (lastPlayedCardIndex < 0) {
    return false;
  }

  // only one play move was done during this turn
  if (lastPlayedCardIndex + 1 >= game.currentPlayHistory.length) {
    return false;
  }

  // move before last played card was a skip
  if (game.currentPlayHistory[lastPlayedCardIndex + 1].cards.length === 0) {
    return false;
  }

  const lastPlayedCard = game.currentPlayHistory[lastPlayedCardIndex].cards[0];
  const secondToLastPlayedCard =
    game.currentPlayHistory[lastPlayedCardIndex + 1].cards[0];

  return (
    (lastPlayedCard.value === secondToLastPlayedCard?.value ||
      (lastPlayedCard.isTurnedOff && secondToLastPlayedCard?.value === '0') ||
      (lastPlayedCard.value === '0' && secondToLastPlayedCard?.isTurnedOff) ||
      (lastPlayedCard.isTurnedOff && secondToLastPlayedCard?.isTurnedOff)) &&
    (lastPlayedCard.type !==
      (CardType.JOKER ||
        CardType.ARTEMIS ||
        CardType.HADES ||
        CardType.HYPNOS) ||
      secondToLastPlayedCard.type !==
        (CardType.JOKER ||
          CardType.ARTEMIS ||
          CardType.HADES ||
          CardType.HYPNOS))
  );
};

type GroupCardsByPositionReducer = Record<number, MCTSGameDeck>;
/**
 * Group a card list by card position.
 *
 * @param cards a list of cards
 * @returns an object associating card position to card lists
 */
const groupCardsByPosition = (
  cards: MCTSGameDeck
): Record<number, MCTSGameDeck> =>
  cards.reduce<GroupCardsByPositionReducer>((acc, cur) => {
    if (!cur) {
      return { ...acc };
    }
    return {
      ...acc,
      [cur.value]: [...(acc[cur.value] ?? []), cur],
    };
  }, {});

/**
 * Computes every legal move from a particular gameState.
 */
export const computePossibleMoves = (game: MCTSGame): Array<MCTSMove> => {
  // game is over, there are no possible moves
  if (checkFinalState(game)) {
    return [];
  }

  const otherPlayer = game.players.find(
    ({ id }) => id !== game.currentPlayerId
  );
  if (!otherPlayer) {
    return [];
  }

  const player = game.players.find(({ id }) => id === game.currentPlayerId);
  if (!player) {
    return [];
  }

  const cardsByPosition: Record<number, MCTSGameDeck> = groupCardsByPosition(
    player.cards
  );

  const lastPlayedCardMove = game.currentPlayHistory.find(
    ({ cards }) => !!cards && cards.length > 0
  );
  const lastPlayedCard = lastPlayedCardMove
    ? lastPlayedCardMove.cards[0]
    : null;
  const lastPlayedCardLength = lastPlayedCardMove
    ? lastPlayedCardMove.cards.length
    : 0;

  const legalPlayMoves: Array<MCTSMovePlayCard> = Object.values(cardsByPosition)
    .flatMap<MCTSMovePlayCard>((cards: Card[]) =>
      Array.from({ length: cards.length }).map((_, index) => ({
        skip: false,
        cards: cards.slice(0, index + 1),
      }))
    )
    .filter(({ cards }) => {
      // Allow any card if no cards have been played yet
      if (!lastPlayedCard) {
        return true;
      }

      // Filter out moves that play cards of lower value than the last played card
      // and ensure the number of cards played matches the length of the last played move
      return (
        cards[0].position >= lastPlayedCard.position &&
        cards.length === lastPlayedCardLength
      );
    });

  // Include skip moves if applicable
  const legalSkipMoves: Array<MCTSMove> =
    game.currentPlayHistory.length === 0 ? [] : getSkipMoves();

  return legalPlayMoves.concat(legalSkipMoves);
};

/**
 * Computes a new game state from a previous game state and a move.
 */
export const simulatePlayAI = (game: MCTSGame, move: MCTSMove): MCTSGame => {
  let gameCopy = deepCopy(game);

  console;
  if (move.skip) {
    gameCopy = skipPresidentDuelForAI(gameCopy, move);
  } else {
    gameCopy = playPresidentDuelForAI(gameCopy, move as MCTSMovePlayCard);
  }

  const isTurnFinished = checkTurnFinished(gameCopy);
  if (isTurnFinished) {
    gameCopy.currentPlayerId = getLastPlayerIdPlayedCard(gameCopy);
    gameCopy.currentPlayHistory = [];
  } else {
    gameCopy.currentPlayerId = passToNextPlayer(gameCopy);
  }
  return gameCopy;
};

const playPresidentDuelForAI = (
  game: MCTSGame,
  move: MCTSMovePlayCard
): MCTSGame => {
  const player = game.players.find(({ id }) => game.currentPlayerId === id);

  if (!player) {
    return game;
  }

  game.currentPlayHistory.unshift({
    cards: move.cards,
    playerId: game.currentPlayerId,
  });

  if (!move.cards || move.cards.includes(null)) {
    move.cards = move.cards.filter((card) => card !== null);
  }

  if (!player.cards || player.cards.includes(null)) {
    player.cards = player.cards.filter((card) => card !== null);
  }

  player.cards = player.cards.filter((card) =>
    move.cards.every(({ id }) => card.id !== id)
  );
  game.discardPile.push(...move.cards);

  // play god

  // TODO: apply effect multiple times if multiple god cards
  if (move.cards[0].god && move.cards[0].god !== God.Joker) {
    const otherPlayer = game.players.find(
      ({ id }) => game.currentPlayerId !== id
    );

    game = godToPlayGodMap[move.cards[0].god](game, player, otherPlayer).game;
  }
  return game;
};

const skipPresidentDuelForAI = (
  game: MCTSGame,
  move: MCTSMoveSkip
): MCTSGame => {
  const player = game.players.find(({ id }) => game.currentPlayerId === id);

  game.currentPlayHistory.unshift({
    cards: [],
    playerId: game.currentPlayerId,
  });
  if (move.draw) {
    if (game.drawPile.length === 0) {
      // TODO make this "random"
      game.drawPile = game.discardPile;
      game.discardPile = [];
    }
  }
  if (game.discardPile.length !== 0) {
    const card = game.drawPile.pop();
    player.cards.push(card);
  }

  return game;
};

const checkTurnFinished = (game: MCTSGame): boolean => {
  const lastPlayedCards = game.currentPlayHistory.find(
    ({ cards }) => cards.length > 0
  )?.cards;

  // If Joker is played, finish the turn
  if (lastPlayedCards[0]?.value === 17) {
    return true;
  }

  let numberOfSkip = 0;

  while (game.currentPlayHistory[numberOfSkip].cards.length === 0) {
    numberOfSkip++;
  }

  return numberOfSkip >= game.players.length - 1;
};

const passToNextPlayer = (game: MCTSGame): string => {
  const currentPlayerIndex = game.players.findIndex(
    ({ id }) => id === game.currentPlayerId
  );

  return game.players[(currentPlayerIndex + 1) % game.players.length].id;
};

const getLastPlayerIdPlayedCard = (game: MCTSGame): string => {
  return game.currentPlayHistory.find(({ cards }) => cards.length > 0).playerId;
};

type PlayGodFunction = (
  game: MCTSGame,
  currentPlayer: MCTSPlayer,
  otherPlayer: MCTSPlayer
) => { game: MCTSGame; hasChanged: boolean };

/**
 * Get the card with the highest position which is not a god. Returns undefined
 * if no card is found.
 */
const getHighestNonGod = (cards: MCTSGameDeck): Card => {};

/**
 * Get the card with the lowest position which is not a god. Returns undefined
 * if no card is found.
 */
const getLowestNonGod = (cards: MCTSGameDeck): Card => {};

/**
 * Move cards from a pile to another in place.
 */
const moveCardFromPiles = (
  from: MCTSGameDeck,
  to: MCTSGameDeck,
  card: MCTSGameCard
): void => {
  const fromIndexToRemove = from.indexOf(card);
  from.splice(fromIndexToRemove, 1);
  to.push(card);
};

/**
 * Disable strongest non god card of otherPlayer in place.
 *
 * currentPlayer and otherPlayer must be references to game.players items.
 */
const playHypnosEffect: PlayGodFunction = (
  game,
  _currentPlayer,
  otherPlayer
) => {
  const highestCard = getHighestNonGod(otherPlayer.cards);
  if (highestCard) {
    highestCard.value = 0;
    highestCard.isTurnedOff = true;
  }
  return { game, hasChanged: !!highestCard };
};

/**
 * Give strongest non god card of otherPlayer to currentPlayer in place.
 *
 * currentPlayer and otherPlayer must be references to game.players items.
 */
const playHermesEffect: PlayGodFunction = (
  game,
  currentPlayer,
  otherPlayer
) => {
  const highestCard = getHighestNonGod(otherPlayer.cards);
  if (highestCard) {
    moveCardFromPiles(otherPlayer.cards, currentPlayer.cards, highestCard);
  }
  return { game, hasChanged: !!highestCard };
};

/**
 * Give weakest non god card of currentPlayer to otherPlayer in place.
 *
 * currentPlayer and otherPlayer must be references to game.players items.
 */
const playArtemisEffect: PlayGodFunction = (
  game,
  currentPlayer,
  otherPlayer
) => {
  const lowestCard = getLowestNonGod(currentPlayer.cards);
  if (lowestCard) {
    moveCardFromPiles(currentPlayer.cards, otherPlayer.cards, lowestCard);
  }
  return { game, hasChanged: !!lowestCard };
};

/**
 * Send strongest non god card of otherPlayer to the discard pile in place.
 *
 * otherPlayer must be references to a game.players item.
 */
const playHadesEffect: PlayGodFunction = (
  game,
  _currentPlayer,
  otherPlayer
) => {
  if (!otherPlayer.cards || otherPlayer.cards.includes(null)) {
    otherPlayer.cards = otherPlayer.cards.filter((card) => card !== null);
  }
  const highestCard = getHighestNonGod(otherPlayer.cards);
  if (highestCard) {
    moveCardFromPiles(otherPlayer.cards, game.discardPile, highestCard);
  }
  return { game, hasChanged: !!highestCard };
};

const godToPlayGodMap: Record<Exclude<God, God.Joker>, PlayGodFunction> = {
  HYPNOS: playHypnosEffect,
  HERMES: playHermesEffect,
  ARTEMIS: playArtemisEffect,
  HADES: playHadesEffect,
};

export const computeWinner = (game: MCTSGame): string => {
  // If the history is empty, current player is playing a god so he loses (and other player wins)
  if (game.currentPlayHistory.length === 0) {
    return game.players.find((player) => player.id !== game.currentPlayerId).id;
  }

  const lastPlayMove = game.currentPlayHistory.find(
    ({ cards }) => cards.length > 0 && cards[0]
  );

  // if the last play was not a god, the player who played the card wins
  if (!lastPlayMove.cards[0].god || lastPlayMove.cards[0].isTurnedOff) {
    return lastPlayMove.playerId;
  }

  const lastMovePlayer = game.players.find(
    ({ id }) => id === lastPlayMove.playerId
  );
  const otherPlayer = game.players.find(
    ({ id }) => id !== lastPlayMove.playerId
  );

  if (lastPlayMove.cards[0].god !== God.Hades) {
    // if the last play was a god, the player who did not play the card wins
    return otherPlayer.id;
  }

  // Hades can eliminate a player by removing their last card.
  const isLastMoveElimination = lastMovePlayer.cards.length > 0;
  return isLastMoveElimination ? lastMovePlayer.id : otherPlayer.id;
};

export const displayCard = (card: MCTSGameCard): string => {
  if (card.isTurnedOff) {
    return '2-';
  }

  if (card.god) {
    return card.god;
  }

  if (card.four) {
    return card.four;
  }

  return card?.number?.toString() ?? '';
};

const DISPLAY_SKIP_ONLY = 'SKIP_ONLY';
const DISPLAY_SKIP_AND_DRAW = 'SKIP_AND_DRAW';

export const displayMove = (move: MCTSMove): string => {
  if (move.skip) {
    return move.draw ? DISPLAY_SKIP_AND_DRAW : DISPLAY_SKIP_ONLY;
  }
  const cards = (move as MCTSMovePlayCard).cards;

  return cards.map(displayCard).join(',');
};

export const displaySimplifiedMCTSTree = ({
  numberOfLoses,
  numberOfWins,
  children,
  gameState,
}: MCTSTree) => ({
  player: gameState.currentPlayerId,
  numberOfWins,
  numberOfLoses,
  winRate: numberOfWins / (numberOfWins + numberOfLoses),
  children: children
    .map(({ move, tree }) => ({
      move: displayMove(move),
      tree: displaySimplifiedMCTSTree(tree),
    }))
    .sort((a, b) => b.tree.winRate - a.tree.winRate),
});
