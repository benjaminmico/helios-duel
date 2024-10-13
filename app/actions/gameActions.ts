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
  playJoker,
  playHades,
  playHypnos,
  ActionName,
} from 'gameFunctions';
import { RootState } from '../reducers';
import { ThunkDispatch } from '@reduxjs/toolkit';

// Define action types
export const START_GAME = 'START_GAME';
export const PLAY_CARDS = 'PLAY_CARDS';
export const SET_CURRENT_PLAYER = 'SET_CURRENT_PLAYER';
export const SKIP_TURN = 'SKIP_TURN';
export const PLAY_ARTEMIS = 'PLAY_ARTEMIS';
export const PLAY_HADES = 'PLAY_HADES';
export const PLAY_HYPNOS = 'PLAY_HYPNOS';
export const PLAY_JOKER = 'PLAY_JOKER';

// Define a union type for the actions
export type GameAction =
  | StartGameAction
  | PlayCardAction
  | SkipTurnAction
  | PlayArtemisAction
  | PlayJokerAction
  | SetCurrentPlayerAction;

// Define action interfaces
interface StartGameAction {
  type: typeof START_GAME;
  payload: Game;
}
// Define action interfaces
interface SetCurrentPlayerAction {
  type: typeof SET_CURRENT_PLAYER;
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

interface PlayJokerAction {
  type: typeof PLAY_JOKER;
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
    dispatch: ThunkDispatch<RootState, unknown, PlayCardAction>,
    getState: () => RootState
  ) => {
    const currentGame = getState().game;
    const game = playCards(currentGame, cards);
    if (game) {
      dispatch({
        type: PLAY_CARDS,
        payload: { ...currentGame, ...game },
      });
    }
  };
};

export const actionSetCurrentPlayer = (
  currentPlayer: Player
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (
    dispatch: ThunkDispatch<RootState, unknown, SetCurrentPlayerAction>,
    getState: () => RootState
  ) => {
    const game = getState().game;

    const action = {
      id: ActionName.CURRENT_PLAYER,
      playerId: currentPlayer.id,
    };

    // if (game) {
    //   dispatch({
    //     type: SET_CURRENT_PLAYER,
    //     payload: { ...game, action },
    //   });
    // }
  };
};

export const actionSkipTurn = (): ThunkAction<
  void,
  RootState,
  unknown,
  AnyAction
> => {
  return (
    dispatch: ThunkDispatch<RootState, unknown, SkipTurnAction>,
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
    dispatch: ThunkDispatch<RootState, unknown, PlayArtemisAction>,
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
          ...game,
        },
      });
    }
  };
};

export const actionPlayJoker = (
  cards: Card[]
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (
    dispatch: ThunkDispatch<RootState, unknown, PlayJokerAction>,
    getState: () => RootState
  ) => {
    const currentGame = getState().game;
    const game = playJoker(currentGame, cards);

    if (game) {
      // Object re-assigned to force rerendering
      dispatch({
        type: PLAY_JOKER,
        payload: {
          ...currentGame,
          ...game,
        },
      });
    }
  };
};
