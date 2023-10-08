import {
  combineReducers,
  legacy_createStore as createStore,
  applyMiddleware,
  Middleware,
  AnyAction,
} from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import gameReducer from './gameReducer';
import { Game } from '@/gameFunctions';
import { GameAction } from '../actions/gameActions';

// Define the root state type
export interface RootState {
  game: Game;
}

// Custom middleware to log actions to the console
const loggerMiddleware: Middleware =
  (store) => (next) => (action: AnyAction) => {
    console.log('Action:', action.type, action.payload);
    return next(action);
  };

const rootReducer = combineReducers<RootState>({
  game: gameReducer,
});

// Create the store with rootReducer, thunk middleware, and logger middleware
const store = createStore(
  rootReducer,
  applyMiddleware(
    thunk as ThunkMiddleware<RootState, GameAction>,
    loggerMiddleware
  )
);

export default store;
