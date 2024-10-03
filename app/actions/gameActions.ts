// app/game/actions/gameActions.ts

import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  BotDifficulty,
  Card,
  CardType,
  CurrentCard,
  Game,
  Player,
  Action, // Corrected import
  playCards,
  skipTurn,
  playArtemis,
} from 'gameFunctions';
import { RootState } from '../reducers';
import { ThunkDispatch } from '@reduxjs/toolkit';

// Define action types
export const START_GAME = 'START_GAME';
export const PLAY_CARDS = 'PLAY_CARDS';
export const SKIP_TURN = 'SKIP_TURN';
export const PLAY_ARTEMIS = 'PLAY_ARTEMIS';

// Define a union type for the actions
export type GameAction =
  | StartGameAction
  | SetPlayersAction
  | SkipTurnAction
  | PlayArtemisAction;

// Define action interfaces
interface StartGameAction {
  type: typeof START_GAME;
  payload: Game;
}

interface PlayCardAction {
  type: typeof PLAY_CARDS;
  payload: Game;
}

interface SkipTurnAction {
  type: typeof SKIP_TURN;
  payload: Game;
}
interface PlayArtemisAction {
  type: typeof PLAY_ARTEMIS;
  payload: Game;
}

// Define action creators
export const startGame = (game: Game): StartGameAction => ({
  type: START_GAME,
  payload: game,
});

export const actionPlayCards = (
  cards: Card[]
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (
    dispatch: ThunkDispatch<RootState, unknown, AnyAction>,
    getState: () => RootState
  ) => {
    const currentGame = getState().game;
    const game = playCards(currentGame, cards);
    if (game) {
      dispatch({
        type: PLAY_CARDS,
        payload: game,
      });
    }
  };
};

export const actionSkipTurn = (): ThunkAction<
  void,
  RootState,
  unknown,
  AnyAction
> => {
  return (
    dispatch: ThunkDispatch<RootState, unknown, AnyAction>,
    getState: () => RootState
  ) => {
    const currentGame = getState().game;
    const game = skipTurn(currentGame);

    if (game) {
      // Object re-assigned to force rerendering
      dispatch({
        type: SKIP_TURN,
        payload: {
          ...currentGame,
          currentPlayer: game.currentPlayer,
          action: game.action,
        },
      });
    }
  };
};

export const actionPlayArtemis = (
  cards: Card[]
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (
    dispatch: ThunkDispatch<RootState, unknown, AnyAction>,
    getState: () => RootState
  ) => {
    const currentGame = getState().game;
    const game = playArtemis(currentGame, cards);

    if (game) {
      // Object re-assigned to force rerendering
      dispatch({
        type: PLAY_ARTEMIS,
        payload: {
          ...currentGame,
          game,
        },
      });
    }
  };
};
