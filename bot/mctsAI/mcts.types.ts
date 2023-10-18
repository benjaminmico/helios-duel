import { BotDifficulty, Card, CardHistory, Player } from 'gameFunctions';

export type MCTSGameCard = CardHistory[];
export type MCTSGameDeck = Card[];

export type MCTSPlayer = Player;

/**
 * Trimmed down version of a full GamePresidentDocument.
 */
export type MCTSGame = {
  currentPlayerId: string;
  currentPlayer: Player;
  drawPile: MCTSGameDeck;
  discardPile: MCTSGameDeck;
  players: Array<MCTSPlayer>;
  chosenLevel?: BotDifficulty;
  currentPlayHistory: Array<{
    playerId: string;
    cards: MCTSGameDeck;
  }>;
};

export type MCTSMoveSkip = { skip: true; draw: boolean };
export type MCTSMovePlayCard = { skip: false; cards: Array<MCTSGameCard> };

export type MCTSMove = MCTSMoveSkip | MCTSMovePlayCard;

export type MCTSTree = {
  children: Array<{ move: MCTSMove; tree: MCTSTree }>;
  gameState: MCTSGame;
  // numberOfWins and numberOfLoses are relative to gameState.currentPlayerId
  numberOfWins: number;
  numberOfLoses: number;
  remainingPossiblesMoves: Array<MCTSMove>; // unexplored moves
};
