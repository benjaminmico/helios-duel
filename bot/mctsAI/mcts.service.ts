import { MCTSGame, MCTSMove, MCTSMoveSkip, MCTSTree } from './mcts.types';
import {
  checkFinalState,
  checkTerminalState,
  computePossibleMoves,
  computeWinner,
  simulatePlayAI,
} from './mcts.utils';
import { BotDifficulty, Card, Game } from 'gameFunctions';

export type MCTSAIConfig = {
  timeoutInMilisecond?: number;
  explorationFactor?: number;
};

/**
 * Implementation of the Monte-Carlo Tree Search algorithm for Helios Duel
 * President.
 *
 * This algorithm is a heuristic search based algorithm for finding the best
 * move in a decision process. It is not based of any game knowledge. One key
 * feature is that it anytime, which means that the process can be stop at
 * anytime and will give the best move so far. This is way the may configuration
 * of this algorithm is the time allocated.
 *
 * For a brief introduction, you may read the wikipedia page
 * https://en.wikipedia.org/wiki/Monte_Carlo_tree_search
 *
 * It is composed of 4 phases
 * 1. Selection: Select which game state (node) to explore. The choice is based
 * on the UCB algorithm, which is a great trade-of between exploitation and
 * exploration.
 * 2. Expansion: Expand the game state tree by playing a new move.
 * 3. Simulation: Play a full game from the expanded game state by choosing
 * random legal moves.
 * 4. Backpropagation: Propagate and save the game result all the way from the
 * child.
 *
 * Each phase has its own corresponding function in the source code.
 *
 * You may refer to `mcts.types.ts` to learn about how the structure is
 * implemented. You should look at `MCTSTree` and `MCTSGame` in particular.
 *
 * /!\ Characteristic features about this implementation /!\
 * - Each node keeps track of their number of wins and looses, regarding the
 * game state currentPlayerId. This means that the win rates between each depth
 * level will alternate. For even depth node, the number of wins will represent
 * the number of wins of player 1. For odd depth node, the number of wins will
 * represent the number of wins of player 2.
 * - Each node must always have an up to date array of unexplored moves. This
 * means that unexplorer moves are computed during the expand phase.
 *
 * For more in-depth concepts and variants, please read
 * A Survey of Monte Carlo Tree Search Methods. IEEE Transactions on
 * Computational Intelligence and AI in Games. 4:1. 1-43.
 * 10.1109/TCIAIG.2012.2186810.
 * (available at
 * http://www.incompleteideas.net/609%20dropbox/other%20readings%20and%20resources/MCTS-survey.pdf)
 *
 * @param game the game state to predict a move from.
 * @param config the config is composed of two parts
 *  - `explorationFactor`, a constant which will control the exploration VS
 * exploitation tradeof. A higher value means more exploration, more randomness
 * in tree exploration. A smaller value means more exploitation, which may lead
 * to sub-optimal solutions. Defaults to sqrt(2), the recommanded theoretical
 * value.
 *  - `timeoutInMilisecond`, time budget allowed for the function. Please not
 * execution time will exceed this timeout, as the function will wait for the
 * last playout to finish. Defaults to 1000 ms.
 * @returns the best move found so far, ane the exploration tree
 */
export const mcts = (
  game: MCTSGame,
  {
    explorationFactor = Math.SQRT2,
    timeoutInMilisecond = 1000,
  }: MCTSAIConfig = {}
): { move: MCTSMove; tree: MCTSTree } => {
  // init gameState tree with the current move.
  const tree = {
    children: [],
    gameState: game,
    numberOfLoses: 0,
    numberOfWins: 0,
    remainingPossiblesMoves: computePossibleMoves(game),
  };

  const level = game.chosenLevel ?? 0;

  const timeToCompute = timeoutInMilisecond * (2 + 2); //TODO Add BotDifficulty number handling
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < timeToCompute) {
    const { leaf: childToExplore, history } = selectAndExpand(
      tree,
      explorationFactor
    );

    const winnerId = playout(childToExplore.gameState);
    const isWin = winnerId === childToExplore.gameState.currentPlayerId;

    backPropagate(isWin, history);
  }

  return { move: computeBestMove(tree), tree };
};

export const mapGamePresidentDocumentToMctsGame = (game: Game): MCTSGame => ({
  currentPlayerId: game.currentPlayer.id,
  currentPlayer: game.currentPlayer,
  currentPlayHistory: game.cardsHistory.map(
    (historyEvent: { playerId: string; cardsPlayed: Card[] }) => ({
      cards: historyEvent.cardsPlayed,
      playerId: historyEvent.playerId,
    })
  ),
  discardPile: game.discardPile,
  drawPile: game.deck,
  chosenLevel: game.chosenLevel || BotDifficulty.MEDIUM,
  players: game.players,
});

/**
 * Select the next node to explore, and expand it based on the unexplored moves.
 *
 * Selection of fully explored node is based on the `computeBestChild` function.
 * @param tree current tree of game state.
 * @param explorationFactor see `mcts` function documentation.
 * @returns a leaf to playout from, and a history of ancestors.
 */
const selectAndExpand = (
  tree: MCTSTree,
  explorationFactor = Math.SQRT2
): { leaf: MCTSTree; history: Array<MCTSTree> } => {
  const history: Array<MCTSTree> = [tree];

  while (!checkTerminalState(tree)) {
    // check unexplored moves first
    if (tree.remainingPossiblesMoves.length > 0) {
      const leaf = expand(tree);
      history.push(leaf);
      return { leaf, history };
    }

    tree = computeBestChild(tree, explorationFactor).tree;
    history.push(tree);
  }

  return { leaf: tree, history };
};

/**
 * Add a child to a leaf in the tree of game state by playing a random move
 * among unexplored moves.
 *
 * This new node is initialised with 0 win and 0 looses, without any children
 * but with all unexplored moves computed.
 */
const expand = (tree: MCTSTree): MCTSTree => {
  const randomMoveIndex = Math.floor(
    Math.random() * tree.remainingPossiblesMoves.length
  );

  const randomMove = tree.remainingPossiblesMoves[randomMoveIndex];
  tree.remainingPossiblesMoves.splice(randomMoveIndex, 1);

  const nextGameState = simulatePlayAI(tree.gameState, randomMove);

  const child: MCTSTree = {
    children: [],
    gameState: nextGameState,
    numberOfLoses: 0,
    numberOfWins: 0,
    remainingPossiblesMoves: computePossibleMoves(nextGameState),
  };

  tree.children.push({ move: randomMove, tree: child });

  return child;
};

/**
 * Play a full game with random move.
 *
 * @param game the initial game state
 * @returns the playerId of the winner
 */
const playout = (game: MCTSGame): string => {
  while (!checkFinalState(game)) {
    const moves = computePossibleMoves(game);
    game = simulatePlayAI(
      game,
      moves[Math.floor(Math.random() * moves.length)]
    );
  }

  return computeWinner(game);
};

/**
 * backPropagate the number of win and loose from the leaf back to the root.
 *
 * As each depth in the tree node represents winRate in term of alternating
 * players, a win for a child means a loose for his direct parent.
 */
const backPropagate = (isWin: boolean, history: Array<MCTSTree>): void => {
  if (history.length === 0) {
    return;
  }
  const tree = history.pop();

  if (!tree) {
    return;
  }

  if (isWin) {
    tree.numberOfWins++;
  } else {
    tree.numberOfLoses++;
  }

  let isParentSamePlayer = true;
  if (history.length > 0) {
    isParentSamePlayer =
      tree.gameState.currentPlayerId ===
      history[history.length - 1].gameState.currentPlayerId;
  }

  backPropagate(isParentSamePlayer ? isWin : !isWin, history);
};

/**
 * Uses upper bound (UCB) confidence algorithm to get best child to explore.
 */
const computeBestChild = (
  tree: MCTSTree,
  explorationFactor: number
): { move: MCTSMove; tree: MCTSTree } => {
  const N = tree.numberOfWins + tree.numberOfLoses;

  const childrenUCTs = tree.children.map(({ tree: child }) => {
    const isSameParentPlayer =
      tree.gameState.currentPlayerId === child.gameState.currentPlayerId;
    const n = child.numberOfLoses + child.numberOfWins;
    // use (1 - winRate) because child represents winRate for the opponent of
    // parent winRate.
    const winRate = isSameParentPlayer
      ? child.numberOfWins / n
      : 1 - child.numberOfWins / n;
    return winRate + explorationFactor * Math.sqrt(Math.log(N) / n);
  });

  const indexOfBestUCT = childrenUCTs.indexOf(Math.max(...childrenUCTs));

  return tree.children[indexOfBestUCT];
};

const computeBestMove = (tree: MCTSTree) => {
  const currentBestMove = computeBestChild(tree, 0);

  if (!currentBestMove || !currentBestMove?.move) {
    const skipMove: MCTSMoveSkip = {
      skip: true,
      draw: false,
    };
    return skipMove;
  }
  return currentBestMove.move;
};
