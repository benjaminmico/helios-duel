import { useCallback } from 'react';
import {
  actionPlayArtemis,
  actionPlayCards,
  actionSkipTurn,
} from 'app/actions/gameActions';
import { Card as CardType } from 'gameFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from 'app/reducers';
import { getBotCards } from 'bot/bot.service';

export const useGameplay = () => {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const game = useSelector((state: RootState) => state.game);

  const playCards = (cards: CardType[]) => {
    dispatch(actionPlayCards(cards));
  };

  const playBotCards = async () => {
    const botCards = await getBotCards(game);
    if (!botCards?.length) {
      skipTurn();
      console.log('Bot play [Skip Turn]');
      return;
    }
    dispatch(actionPlayCards(botCards));
    return botCards;
  };

  const skipTurn = () => {
    dispatch(actionSkipTurn());
  };

  const playArtemis = (cards: CardType[]) => {
    dispatch(actionPlayArtemis(cards));
  };

  return {
    game,
    playCards,
    playBotCards,
    skipTurn,
    playArtemis,
  };
};
