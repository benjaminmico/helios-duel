import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Card as CardType, Game } from 'gameFunctions';
import Card, { CardStatus } from '../Card';

interface CardCurrentPlayedProps {
  game: Game;
}

const CardCurrentPlayed: React.FC<CardCurrentPlayedProps> = ({ game }) => {
  const cardsPlayed = game.cardsHistory?.[0]?.cardsPlayed;

  if (!cardsPlayed) return;

  return cardsPlayed?.map((card, index) => {
    return (
      <Card
        key={card.id}
        card={card}
        onPress={() => null}
        isLocked={false}
        status={CardStatus.PREVIEW}
        style={[
          styles.cardItem,
          { left: index * 50 }, // Dynamic left offset based on index
        ]}
      />
    );
  });
};

const styles = StyleSheet.create({
  cardItem: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
});

export default CardCurrentPlayed;
