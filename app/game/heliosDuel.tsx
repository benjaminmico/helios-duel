import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Button,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './reducers';
import { actionPlayGame } from './actions/gameActions';
import {
  Card,
  CardType,
  Player,
  calculateCardValue,
  canPlayCard,
  changePlayerHand,
  getWeakestCard,
  isLastCardArtemis,
  playArtemis,
  playCard,
  playHades,
  playHypnos,
  rollDiceAndSkipTurn,
} from 'gameFunctions';
import { getBotCards } from 'bot/bot.service';
import _ from 'lodash';
import * as handlers from './handlers';

const GameScreen: React.FC = () => {
  const dispatch = useDispatch();
  const game = useSelector((state: RootState) => state.game);

  const [selectedCards, setSelectedCards] = React.useState<Card[]>([]);
  const [selectedArtemisCards, setSelectedArtemisCards] = React.useState<
    Card[]
  >([]);

  const [shouldDisplayArtemisSelection, setShouldDisplayArtemisSelection] =
    useState<boolean>(false);

  const { currentPlayer, players, cardsHistory } = game;

  const boundHandleSelectArtemisCard = useCallback(
    (card: Card) => {
      const lastCardPlayedCount = _.get(
        game,
        'cardsHistory[0].cardsPlayed.length',
        0
      );
      const newSelectedArtemisCards = handlers.handleSelectArtemisCard(
        card,
        selectedArtemisCards,
        lastCardPlayedCount
      );
      setSelectedArtemisCards(newSelectedArtemisCards);
    },
    [selectedArtemisCards, game]
  );

  const boundHandlePlayCard = useCallback(
    (card: Card) => {
      if (game.currentPlayer.id === 'bot') return;
      const newSelectedCards = handlers.handlePlayCard(card, selectedCards);
      setSelectedCards(newSelectedCards);
    },
    [selectedCards, game?.currentPlayer]
  );

  const boundHandleSkipTurn = useCallback(() => {
    const newGame = handlers.handleSkipTurn(game);
    dispatch(actionPlayGame(newGame));
    setSelectedCards([]);
  }, [game, dispatch]);

  const boundHandlePlayArtemis = useCallback(() => {
    const newGame = handlers.handlePlayArtemis(
      selectedArtemisCards,
      game,
      currentPlayer
    );
    dispatch(actionPlayGame(newGame));
    setSelectedArtemisCards([]);
    setSelectedCards([]);
    setShouldDisplayArtemisSelection(false);
  }, [selectedArtemisCards, game, dispatch]);

  const playSelectedCards = (playedCards: Card[]) => {
    if (playedCards.length >= 1) {
      const newGame = playCard(game, currentPlayer, playedCards);
      if (newGame) {
        dispatch(actionPlayGame(newGame));
      }
      if (newGame && isLastCardArtemis(newGame) && currentPlayer.id !== 'bot') {
        setShouldDisplayArtemisSelection(true);
      }
      setSelectedCards([]);
    }
  };

  console.log({ game });

  const playBotTurnIfNecessary = async () => {
    if (currentPlayer.id === 'bot') {
      const botCards = await getBotCards(game, currentPlayer.id);
      if (!botCards?.length) {
        boundHandleSkipTurn();
        return;
      }

      playSelectedCards(botCards);

      let gameAfterArtemisPlay;

      botCards.forEach(async (card) => {
        if (card.type === CardType.ARTEMIS) {
          const weakestCard = getWeakestCard(currentPlayer); // Get the weakest card for each Artemis

          if (weakestCard) {
            gameAfterArtemisPlay = playArtemis(game, currentPlayer, [
              weakestCard,
            ]);
            if (gameAfterArtemisPlay) {
              dispatch(actionPlayGame(gameAfterArtemisPlay));
            }
          }
        }
      });

      setTimeout(() => actionPlayGame(changePlayerHand(game)), 2000);
    }
  };

  React.useEffect(() => {
    setTimeout(() => playBotTurnIfNecessary(), 100);
  }, [currentPlayer.id]);

  const isCardAlreadySelected = (card: Card) => {
    return selectedCards?.some((selectedCard) => selectedCard.id === card.id);
  };

  const isButtonDisabled = selectedCards?.length === 0;

  const renderGameCard = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <Text key={index}>{JSON.stringify(item)}</Text>
    ),
    []
  );

  const renderSortedCard = ({
    item,
    index,
    shouldSelectCard,
  }: {
    item: Card;
    index: number;
    shouldSelectCard: boolean;
  }) => {
    const canPlay = canPlayCard(game, currentPlayer, item);
    const isCardSelected = isCardAlreadySelected(item);
    return (
      <Pressable
        key={`${currentPlayer.id}_${index}_${item.type}_${item.value}`}
        onPress={() => shouldSelectCard && boundHandlePlayCard(item)}
        disabled={!canPlay}
        style={[
          styles.cardButton,
          { backgroundColor: isCardSelected ? 'green' : 'black' },
          { opacity: canPlay ? 1.0 : 0.3 },
        ]}
      >
        <Text style={styles.cardButtonText}>{item.value.toString()}</Text>
      </Pressable>
    );
  };

  const renderArtemisSelectCard = () => {
    const sortedCards = _.sortBy(
      handlers.currentPlayerCards(players),
      'position'
    );

    return (
      <View>
        <Text>Select cards to give to another player:</Text>
        {sortedCards.map((card, index) => {
          const isSelected = _.includes(selectedArtemisCards, card);
          return (
            <Pressable
              key={`artemisCard_${index}_${card.type}_${card.value}`}
              onPress={() => boundHandleSelectArtemisCard(card)}
              style={[
                styles.cardButton,
                isSelected ? styles.cardSelected : styles.cardUnselected,
              ]}
            >
              <Text style={styles.cardButtonText}>{card.value.toString()}</Text>
            </Pressable>
          );
        })}
        {selectedArtemisCards.length > 0 && (
          <Button
            title={`Play Artemis on selected cards`}
            onPress={boundHandlePlayArtemis}
          />
        )}
      </View>
    );
  };

  // Inside your main render function:
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Card Game</Text>
      <View>
        <FlatList
          showsHorizontalScrollIndicator={false}
          data={handlers.sortedBotCards(players)}
          renderItem={({ item, index }) =>
            renderSortedCard({ item, index, shouldSelectCard: false })
          }
          keyExtractor={(_item, index) => `sortedCard_${index}`}
          horizontal
          style={styles.buttonContainer}
        />
        <Text>Current Player: {currentPlayer.id}</Text>
        <Text>Cards Played: </Text>
        <FlatList
          data={handlers.getGameCardsHistory(cardsHistory)}
          renderItem={renderGameCard}
          keyExtractor={(_item, index) => `gameCard_${index}`}
        />
      </View>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={handlers.sortedCards(players)}
        renderItem={({ item, index }) =>
          renderSortedCard({ item, index, shouldSelectCard: true })
        }
        keyExtractor={(_item, index) => `sortedCard_${index}`}
        ListFooterComponent={() => {
          return (
            <Pressable onPress={boundHandleSkipTurn} style={styles.skipButton}>
              <Text style={styles.cardButtonText}>Skip turn</Text>
            </Pressable>
          );
        }}
        horizontal
        style={styles.buttonContainer}
      />

      {shouldDisplayArtemisSelection && renderArtemisSelectCard()}

      <Button
        title='Play Selected Cards'
        onPress={() => playSelectedCards(selectedCards)}
        disabled={isButtonDisabled}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  cardButton: {
    minWidth: 30,
    maxHeight: 90,
    marginHorizontal: 4,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardButtonText: {
    color: 'white',
    fontWeight: '800',
  },
  cardSelected: {
    backgroundColor: 'green',
    opacity: 0.3,
  },
  cardUnselected: {
    backgroundColor: 'black',
    opacity: 1.0,
  },
  skipButton: {
    marginHorizontal: 4,
    padding: 16,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(GameScreen);
