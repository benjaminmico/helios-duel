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
  const [opponentCards, setOpponentCards] = useState<Card[]>([]);
  // const [opponentAvatar, setOpponentAvatar] = useState<String>('');
  const opponentCardsRefs = useRef([]);
  const pendingAnimation = useRef<boolean>(false);

  const userPlayerId = getPlayer(game.players, 'bot')?.id;

  const updateOpponentCards = useCallback(
    async (
      playedCardsIds: string[],
      newCards: Card[],
      action: ActionName,
      isCardPlayed: boolean
    ) => {
      pendingAnimation.current = true;
      if (isCardPlayed) {
        hidePlayedCards(true);
      }
      await startCardsAnimations(playedCardsIds, action);
      if (isCardPlayed) {
        hidePlayedCards(false);
      }
      setOpponentCards(newCards);
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
    const opponentsCards = sortedBotCards(game.players);

    if (!opponentsCards || !opponentsCards.length) {
      return;
    }

    setOpponentCards(opponentsCards);

    // if (!pendingAnimation?.current) {
    //   setOpponentCards((currentOpponentCards) => {
    //     const playedCards = (currentOpponentCards || [])
    //       .filter(
    //         (filteredCard) =>
    //           !opponentsCards.find(
    //             (opponentsCard) =>
    //               opponentsCard.id === filteredCard.id &&
    //               opponentsCard.type === filteredCard.type
    //           )
    //       )
    //       .map((card) => card.type);

    //     console.log('playedCards', playedCards?.length);

    //     const isCardPlayed =
    //       (game.action?.id === ActionName.CARD_PLAYED ||
    //         game.action?.id === ActionName.ARTEMIS ||
    //         game.action?.id === ActionName.HYPNOS ||
    //         game.action?.id === ActionName.HADES) &&
    //       game.currentPlayer.id !== userPlayerId;

    //     if (
    //       game.action?.id &&
    //       playedCards.length > 0 &&
    //       (isCardPlayed ||
    //         (game.action?.id === ActionName.HADES_DISCARDED &&
    //           game.currentPlayer.id === userPlayerId) ||
    //         (game.action?.id === ActionName.ARTEMIS_GIVED &&
    //           game.currentPlayer.id !== userPlayerId))
    //     ) {
    //       updateOpponentCards(
    //         playedCards,
    //         opponentCards,
    //         game.action?.id,
    //         isCardPlayed
    //       );
    //       return currentOpponentCards;
    //     }

    //     const addedCards = (opponentCards || []).filter(
    //       (filteredCard) =>
    //         !currentOpponentCards.find(
    //           (card) =>
    //             card.id === filteredCard.id && card.type === filteredCard.type
    //         )
    //     );
    //     if (
    //       addedCards.length > 0 &&
    //       game.action?.id === ActionName.SKIP_WITH_DICE_ROLL
    //     ) {
    //       updateOpponentNewCard(addedCards[0], opponentCards);
    //       return currentOpponentCards;
    //     }

    //     return opponentCards;
    //   });
    // }
  }, [game, updateOpponentCards, updateOpponentNewCard, userPlayerId]);

  const startCardsAnimations = async (cardsIds: string[], action: string) => {
    await Promise.all(
      cardsIds.map(async (cardId: string) => {
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

  return (
    <View style={styles.list}>
      <FlatList
        data={opponentCards}
        keyExtractor={(card: Card) => card.id}
        horizontal
        contentContainerStyle={
          {
            // paddingBottom: 500,
            // paddingTop: 150,
            // paddingRight: 100,
            // paddingLeft: 100,
          }
        }
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
  },
});

export default GameCardsOpponent;
