import React, { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import ModalSelectCards from '../ModalSelectCards';
import { Card, CardType, Game, playArtemis } from 'gameFunctions';
import { getPlayer, sortedCards } from 'app/handlers';

interface GameModalArtemisProps {
  game: Game;
  onArtemisCardsSelected: (game: Game) => void;
}

const GameModalArtemis: React.FC<GameModalArtemisProps> = React.memo(
  ({ game, onArtemisCardsSelected }) => {
    const [isModalVisible, setIsModalVisible] = useState(true);
    const [key, setKey] = useState(0);

    const currentPlayerId = game?.currentPlayer?.id;
    const lastCard = game?.cardsPlayed?.[0];
    const lastCardPlayerId = lastCard?.playerId;
    const lastCardType = lastCard?.cardsPlayed?.[0]?.type;

    const isArtemisCardPlayedByCurrentPlayer =
      currentPlayerId === lastCardPlayerId &&
      lastCardType === CardType.ARTEMIS &&
      getPlayer(game.players, 'user')?.id === currentPlayerId;

    useEffect(() => {
      if (isArtemisCardPlayedByCurrentPlayer) {
        setIsModalVisible(true);
        setKey((prevKey) => prevKey + 1); // Force remount by changing key
      }
    }, [isArtemisCardPlayedByCurrentPlayer]);

    const handlePress = useCallback(
      (cards: Card[]) => {
        const gameAfterArtemisPlay = playArtemis(
          game,
          game.currentPlayer,
          cards
        );
        onArtemisCardsSelected(gameAfterArtemisPlay);
        setIsModalVisible(false); // Hide modal after handling press
      },
      [game, onArtemisCardsSelected]
    );

    if (!isArtemisCardPlayedByCurrentPlayer || !isModalVisible) return null;

    const artemisCardPlayedLength = game?.cardsPlayed?.[0]?.cardsPlayed?.length;

    return (
      <View key={key} style={modalStyles.modalContainer}>
        <ModalSelectCards
          title='Select cards'
          cards={sortedCards(game.players).filter(
            (c) => c.type !== CardType.ARTEMIS
          )}
          maxSelectedCardsLength={artemisCardPlayedLength}
          onPress={handlePress}
        />
      </View>
    );
  }
);

export const modalStyles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    zIndex: 10,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
});

export default GameModalArtemis;
