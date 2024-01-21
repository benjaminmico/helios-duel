// app/game/reducers/gameReducer.ts

import { Game } from 'gameFunctions';
import {
  GameAction,
  PLAY_CARD,
  SET_CURRENT_CARDS,
  SET_CURRENT_PLAYER,
  SET_DECK,
  SET_PLAYERS,
  START_GAME,
} from '../actions/gameActions';

// Define the initial state of the game
const initialState: Game = {
  players: [],
  currentPlayer: { id: '', cards: [] },
  currentCards: [],
  deck: [],
};

// Define the game reducer
const gameReducer = (state = initialState, action: GameAction): Game => {
  switch (action.type) {
    case SET_PLAYERS:
      return { ...state, players: action.payload };
    case SET_CURRENT_PLAYER:
      return { ...state, currentPlayer: action.payload };
    case SET_CURRENT_CARDS:
      return { ...state, currentCards: action.payload };
    case SET_DECK:
      return { ...state, deck: action.payload };
    case START_GAME:
      return action.payload;
    case PLAY_CARD:
      return action.payload;
    default:
      return state;
  }
};

export default gameReducer;
