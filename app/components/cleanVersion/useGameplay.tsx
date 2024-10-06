import { useCallback } from 'react';
import {
  actionPlayArtemis,
  actionPlayCards,
  actionPlayJoker,
  actionSkipTurn,
} from 'app/actions/gameActions';
import { Card as CardType } from 'gameFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from 'app/reducers';
import { getBotCards } from 'bot/bot.service';
import { getLatestCardPlayed } from './utils';

export const useGameplay = () => {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const game = useSelector((state: RootState) => state.game);

  const playCards = useCallback((cards: CardType[]) => {
    dispatch(actionPlayCards(cards));

    const cardValue = cards?.[0]?.value;
    // const latestCardPlayedValue = getLatestCardPlayed(game.cardsPlayed)?.value;

    switch (true) {
      case cardValue === 'JOKER':
        setTimeout(() => dispatch(actionPlayJoker(cards)), 2000);
      // case latestCardPlayedValue === 'ARTEMIS':
      //   dispatch(actionPlayArtemis(cards));
    }
  }, []);

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
    playArtemis,
    playBotCards,
    skipTurn,
  };
};
