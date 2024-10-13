import { useCallback } from 'react';
import {
  actionPlayArtemis,
  actionPlayCards,
  actionPlayJoker,
  actionSetCurrentPlayer,
  actionSkipTurn,
} from 'app/actions/gameActions';
import { Card, CardType, isSpecialCard, Player } from 'gameFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from 'app/reducers';
import { getBotCards } from 'bot/bot.service';

export const useGameplay = () => {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const game = useSelector((state: RootState) => state.game);

  const playCards = useCallback((cards: Card[]) => {
    dispatch(actionPlayCards(cards));

    const card = cards?.[0];

    switch (true) {
      case card.type === CardType.JOKER &&
        isSpecialCard(CardType.JOKER, card.position):
        setTimeout(() => {
          dispatch(actionPlayJoker(cards));
        }, 2000);
    }
  }, []);

  const playBotCards = async () => {
    const botCards = await getBotCards(game);
    if (!botCards?.length) {
      skipTurn();
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

  const setCurrentPlayer = (player: Player) => {
    dispatch(actionSetCurrentPlayer(player));
  };

  return {
    game,
    playCards,
    playArtemis,
    playBotCards,
    skipTurn,
    setCurrentPlayer,
  };
};
