import { Game } from 'gameFunctions';
import {
  GameAction,
  PLAY_CARDS,
  SKIP_TURN,
  START_GAME,
} from '../actions/gameActions';

const initialState = {
  id: '',
  players: [],
  currentPlayer: undefined,
  cardsPlayed: [],
  discardPile: [],
  action: undefined,
} as unknown as Game;

const gameReducer = (state = initialState, action: GameAction): Game => {
  switch (action.type) {
    case START_GAME:
      return action.payload;
    case PLAY_CARDS:
      return action.payload;
    case SKIP_TURN:
      return action.payload;
    default:
      return state;
  }
};

export default gameReducer;
