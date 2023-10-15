import { AIInterface } from '../bot.types';
import {
  mapGamePresidentDocumentToMctsGame,
  mcts,
  MCTSAIConfig,
} from './mcts.service';
import { MCTSMovePlayCard } from './mcts.types';
import { displayMove } from './mcts.utils';
import { Card, Game } from '@/gameFunctions';

export const mctsAI: AIInterface<MCTSAIConfig> = (
  game: Game,
  _botPlayerId,
  config
): Card[] => {
  const mctsGame = mapGamePresidentDocumentToMctsGame(game);
  const { move: bestMove, tree } = mcts(mctsGame, config);

  if (bestMove.skip) {
    return [];
  }
  return (bestMove as MCTSMovePlayCard).cards as unknown as Card[];
};
