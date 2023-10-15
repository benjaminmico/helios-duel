import { Card, Game } from '@/gameFunctions';
import { mctsAI } from './mctsAI/mcts';

/**
 * Simulate a play by a bot.
 *
 * By changing this function, you can change the behaviour of the bot.
 */
export const getBotCards = async (
  game: Game,
  botPlayerId: string
): Promise<Card[]> => {
  // This functions returns the card played from the bot.
  // You can change the default behaviour of the bot by changing this function
  // - `basicAI` for the most basic AI possible, playing first possible legal
  //    move.
  // - `mctsAI` for a stronger AI. The difficulty if this AI can be configured
  //    by changing the time needed to complete the function. It is done by
  //    changing the value in `timeoutInMilisecond`. A higher value means that
  //    the bot will be stronger. Values to low (some miliseconds) will end up
  //    random play.
  const cards = mctsAI(game, botPlayerId, { timeoutInMilisecond: 1000 }).filter(
    (card) => card !== undefined || card !== null
  );

  console.log('ccc', cards);

  return cards;

  // if (cards.length === 0) {
  //   const dieValue = generateRandomInt(1, 6);
  //   return skipPresidentDuel(game.id, botPlayerId, dieValue);
  // }
  // return playPresidentDuel(game.id, botPlayerId, cards);
};
