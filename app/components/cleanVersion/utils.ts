import { Card, CardHistory } from 'gameFunctions';
import { CARDS_PER_ROW } from './CardAnimated';
import { CardAnimatedType } from './useCardsAnimation';

export const getCardZIndex = (
  cardAnimated: CardAnimatedType,
  cardsPlayer: Card[],
  cardsPlayed: CardHistory[],
  gameCreatedAt: string,
  cardHidden?: boolean
) => {
  const cardCurrentIndex = cardsPlayer
    ?.filter(
      (c: Card) =>
        !getFlattenCardPlayed(cardsPlayed).find((cp: Card) => cp.id === c.id)
    )
    ?.findIndex((c: Card) => c.id === cardAnimated.card.id);

  if (!!cardAnimated.playedAt) {
    return calculatePlayedCardZIndex(gameCreatedAt, cardAnimated?.playedAt);
  }

  if (cardHidden) {
    return cardCurrentIndex || 0;
  }

  if (cardCurrentIndex >= CARDS_PER_ROW) {
    return cardCurrentIndex || 0;
  }
  return Number(`11${cardCurrentIndex || 0}`);
};

export const calculatePlayedCardZIndex = (
  createdAt: string,
  playedAt: string
): number => {
  const createdAtDate = new Date(createdAt);
  const playedAtDate = new Date(playedAt);

  // Calculate the time difference in milliseconds
  const timeDifference = playedAtDate.getTime() - createdAtDate.getTime();

  // If playedAt is after createdAt, the timeDifference will be positive, we can map that to zIndex
  const zIndex = timeDifference > 0 ? Math.ceil(timeDifference / 1000) : 1;

  return zIndex;
};

export const getAnimatedCards = (cardsRef: any, cards: Card[]) => {
  return cardsRef.current.filter((animatedCard: any) =>
    cards.some((selectedCard) => selectedCard.id === animatedCard.card.id)
  );
};

export const getFlattenCardPlayed = (cardsPlayed: CardHistory[]): Card[] => {
  return cardsPlayed.map((card) => card.cardsPlayed).flat();
};
