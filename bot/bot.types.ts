import { GamePresidentDocument } from "../president.types";

export type AIInterface<TConfig = never> = (
  game: GamePresidentDocument,
  botPlayerId: string,
  config?: TConfig
) => string[];
