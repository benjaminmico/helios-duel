import { getPlayableCards } from "../../gamePresident.service";
import { AIInterface } from "../bot.types";

/**
 * Strategy: plays first card available. If not possible, skip.
 */
export const basicAI: AIInterface = (game, botPlayerId) => {
  const playableCards = getPlayableCards(game, botPlayerId);
  if (!playableCards.length || playableCards.length === 0) {
    return [];
  }

  return [playableCards[0].id];
};
