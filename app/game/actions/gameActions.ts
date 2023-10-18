// app/game/actions/gameActions.ts

import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  BotDifficulty,
  Card,
  CurrentCard,
  Game,
  Player,
  botAction,
} from 'gameFunctions';
import { RootState } from '../reducers';
import { ThunkDispatch } from '@reduxjs/toolkit';

// Define action types
export const START_GAME = 'START_GAME';
export const PLAY_CARD = 'PLAY_CARD';
export const SKIP_TURN = 'SKIP_TURN';
export const SET_PLAYERS = 'SET_PLAYERS';
export const SET_CURRENT_PLAYER = 'SET_CURRENT_PLAYER';
export const SET_CURRENT_CARDS = 'SET_CURRENT_CARDS';
export const SET_DECK = 'SET_DECK';

// Define a union type for the actions
export type GameAction =
  | StartGameAction
  | SetPlayersAction
  | SetCurrentPlayerAction
  | SetCurrentCardsAction
  | SetDeckAction
  | PlayCardAction;

// Define action interfaces
interface StartGameAction {
  type: typeof START_GAME;
  payload: Game;
}

interface PlayCardAction {
  type: typeof PLAY_CARD;
  payload: Game;
}

interface SkipTurnAction {
  type: typeof SKIP_TURN;
  payload: {
    player: Player;
  };
}

interface SetPlayersAction {
  type: typeof SET_PLAYERS;
  payload: Player[];
}

interface SetCurrentPlayerAction {
  type: typeof SET_CURRENT_PLAYER;
  payload: Player;
}

interface SetCurrentCardsAction {
  type: typeof SET_CURRENT_CARDS;
  payload: CurrentCard[];
}

interface SetDeckAction {
  type: typeof SET_DECK;
  payload: Card[];
}

// Define action creators
export const startGame = (game: Game): StartGameAction => ({
  type: START_GAME,
  payload: game,
});

export const actionPlayCard = (game: Game): PlayCardAction => ({
  type: PLAY_CARD,
  payload: game,
});

export const skipTurn = (player: Player): SkipTurnAction => ({
  type: SKIP_TURN,
  payload: {
    player,
  },
});
