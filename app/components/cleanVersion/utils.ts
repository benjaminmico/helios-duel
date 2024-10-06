import { Card, CardHistory } from 'gameFunctions';
import { CARDS_PER_ROW } from './CardAnimated';
import { CardAnimatedType } from './useCardsAnimation';

export const getCardZIndex = (
  cardAnimated: CardAnimatedType,
  cardsRef: React.MutableRefObject<CardAnimatedType[]>,
  gameCreatedAt: string,
  cardHidden?: boolean
) => {
  const cards = cardsRef.current
    .filter((c) => c.playedAt === '')
    .map((c) => c.card)
    .sort((a, b) => a.position - b.position);

  const cardCurrentIndex = cards.findIndex(
    (c: Card) => c.id === cardAnimated.card.id
  );

  if (!!cardAnimated.playedAt) {
    return calculatePlayedCardZIndex(gameCreatedAt, cardAnimated?.playedAt);
  }

  if (cardHidden) {
    return Number(`11${cardCurrentIndex || 0}`);
  }

  if (cardCurrentIndex >= (cardHidden ? 9999 : CARDS_PER_ROW)) {
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

export const getAnimatedCards = (
  cardsRef: any,
  cards: Card[]
): CardAnimatedType[] => {
  return cardsRef.current.filter((animatedCard: any) =>
    cards.some((selectedCard) => selectedCard.id === animatedCard.card.id)
  );
};

export const getFlattenCardPlayed = (cardsPlayed: CardHistory[]): Card[] => {
  return cardsPlayed.map((card) => card.cardsPlayed).flat();
};

export const getLatestCardPlayed = (
  cardsHistory?: CardHistory[]
): Card | undefined => {
  if (!cardsHistory?.length) return undefined;
  return cardsHistory?.[0].cardsPlayed?.[0];
};

export const isCardLocked = (
  card: Card,
  cardsHistory: CardHistory[]
): boolean => {
  if (!cardsHistory || cardsHistory.length === 0) return false;
  if (getLatestCardPlayed(cardsHistory)?.value === 'ARTEMIS') return false;

  const firstPlayedCard = cardsHistory[0]?.cardsPlayed?.[0];
  if (!firstPlayedCard) return false;

  return card.position < firstPlayedCard.position;
};
