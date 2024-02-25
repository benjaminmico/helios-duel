import { ActionName, Card, Game, Player } from 'gameFunctions';
import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  ImageStyle,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import AnimatedHiddenCardItem from '../CardAnimatedHidden';
import { getPlayer, sortedBotCards } from 'app/handlers';

interface IGameCardsOpponent {
  game: Game;
  hidePlayedCards: Dispatch<SetStateAction<boolean>>;
  startNewCardFromPileAnimation: (newCard: Card, fromOpponent: boolean) => void;
}

const GameCardsOpponent: FunctionComponent<IGameCardsOpponent> = ({
  game,
  hidePlayedCards,
  startNewCardFromPileAnimation,
}) => {
  const [opponentCards, setOpponentCards] = useState<Card[]>(
    getPlayer(game.players, 'bot')?.cards
  );
  // const [opponentAvatar, setOpponentAvatar] = useState<String>('');
  const opponentCardsRefs = useRef([]);
  const pendingAnimation = useRef<boolean>(false);

  const userPlayerId = getPlayer(game.players, 'bot')?.id;

  const updateOpponentCards = useCallback(
    async (
      playedCardsIds: string[],
      action: ActionName,
      isCardPlayed: boolean
    ) => {
      pendingAnimation.current = true;
      // if (isCardPlayed) {
      //   hidePlayedCards(true);
      // }
      console.log('playedCardsIds', action);
      await startCardsAnimations(playedCardsIds, action, game);
      if (isCardPlayed) {
        hidePlayedCards(false);
      }
      // setOpponentCards(newCards);
      pendingAnimation.current = false;
    },
    [hidePlayedCards]
  );

  const updateOpponentNewCard = useCallback(
    async (newCardFromPile: Card, newCards: Card[]) => {
      pendingAnimation.current = true;
      await startNewCardFromPileAnimation(newCardFromPile, true);
      setTimeout(() => {
        setOpponentCards(newCards);
        pendingAnimation.current = false;
      }, 2000);
    },
    [startNewCardFromPileAnimation]
  );

  useEffect(() => {
    const opponent = getPlayer(game.players, 'bot');
    if (!opponent) {
      return null;
    }

    const playedCards =
      game.cardsHistory?.length &&
      game.cardsHistory[0].playerId === opponent.id &&
      game.cardsHistory[0].cardsPlayed;

    if (!playedCards) return;

    updateOpponentCards(
      playedCards.map((c) => c.id),
      game.action?.id as ActionName,
      true
    );

    // if (!pendingAnimation?.current) {
    //   setOpponentCards((currentOpponentCards) => {
    //     const playedCards = game.cardsHistory[0].cardsPlayedgame.cardsHistory[0].cardsPlayed;

    //     console.log('playedCaards', playedCards);

    //     const isCardPlayed =
    //       (game.action?.id === ActionName.CARD_PLAYED ||
    //         game.action?.id === ActionName.ARTEMIS ||
    //         game.action?.id === ActionName.HYPNOS ||
    //         game.action?.id === ActionName.HADES) &&
    //       game.currentPlayer.id !== userPlayerId;

    //     console.log('isCardPlayed', isCardPlayed);
    //     if (
    //       playedCards.length > 0 &&
    //       (isCardPlayed ||
    //         (game.action?.id === ActionName.HADES_DISCARDED &&
    //           game.currentPlayer.id === userPlayerId) ||
    //         (game.action?.id === ActionName.ARTEMIS_GIVED &&
    //           game.currentPlayer.id !== userPlayerId))
    //     ) {
    //       updateOpponentCards(
    //         playedCards,
    //         opponentData.cards,
    //         game.action?.id,
    //         isCardPlayed
    //       );
    //       return currentOpponentCards;
    //     }

    //     const addedCards = (opponentData.cards || []).filter(
    //       (c) =>
    //         !currentOpponentCards.find(
    //           (el) => el.id === c.id && el.value === c.value
    //         )
    //     );
    //     if (
    //       addedCards.length > 0 &&
    //       game.action?.id === ActionName.SKIP_WITH_DICE_ROLL
    //     ) {
    //       updateOpponentNewCard(addedCards[0], opponentData.cards);
    //       return currentOpponentCards;
    //     }

    //     return opponentData.cards;
  }, [game, updateOpponentCards, updateOpponentNewCard, userPlayerId]);

  const startCardsAnimations = async (
    cardsIds: string[],
    action: string,
    game: Game
  ) => {
    console.log('CCCCC', cardsIds);
    await Promise.all(
      cardsIds.map(async (cardId: string) => {
        console.log('BBBB', opponentCardsRefs.current[cardId]);
        if (
          opponentCardsRefs &&
          opponentCardsRefs.current &&
          //@ts-ignore
          opponentCardsRefs.current[cardId]
        ) {
          //@ts-ignore
          const cardReference = opponentCardsRefs?.current[cardId];
          if (cardReference) {
            await cardReference.startPlayAnimation(action);
          }
        }
      })
    );
  };

  console.log('OPPONENT CARDS', opponentCards?.length);
  return (
    <View style={styles.list}>
      <FlatList
        data={opponentCards}
        keyExtractor={(card: Card) => card.id}
        horizontal
        contentContainerStyle={{}}
        scrollEnabled={false}
        style={{ overflow: 'visible' }}
        renderItem={({ item, index }) => (
          <AnimatedHiddenCardItem
            //@ts-ignore
            ref={(ref) =>
              (opponentCardsRefs.current = {
                ...(opponentCardsRefs.current || {}),
                [item.id]: ref,
              })
            }
            item={item}
            currIndex={index}
          />
        )}
      />
    </View>
  );
};

interface IStyles {
  image: ImageStyle;
  list: ViewStyle;
}

const styles: IStyles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  list: {
    alignItems: 'center',
    zIndex: 2,
    marginRight: -100,
    marginLeft: -100,
  },
});

export default GameCardsOpponent;
