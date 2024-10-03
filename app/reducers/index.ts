import {
  combineReducers,
  legacy_createStore as createStore,
  applyMiddleware,
  Middleware,
  AnyAction,
} from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import gameReducer from './gameReducer';
import { Game } from 'gameFunctions';

export interface RootState {
  game: Game;
}

const loggerMiddleware: Middleware =
  (store) => (next) => (action: AnyAction) => {
    return next(action);
  };

const rootReducer = combineReducers<RootState>({
  game: gameReducer,
});

export type AppThunk<ReturnType = void> = ThunkMiddleware<
  RootState,
  AnyAction,
  unknown
>;

const store = createStore(
  rootReducer,
  applyMiddleware(thunk as AppThunk, loggerMiddleware)
);

export default store;
