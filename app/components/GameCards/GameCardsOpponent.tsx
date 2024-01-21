import { CardType, Game } from 'gameFunctions';
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
  Image,
  ImageStyle,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import AnimatedHiddenCardItem from '../CardAnimatedHidden';
import { sortedBotCards } from 'app/handlers';

interface IGameCardsOpponent {
  game: Game;
  userPlayerId: string;
  hidePlayedCards: Dispatch<SetStateAction<boolean>>;
  startNewCardFromPileAnimation: (
    newCard: CardType,
    fromOpponent: boolean
  ) => void;
}

const GameCardsOpponent: FunctionComponent<IGameCardsOpponent> = ({
  game,
  userPlayerId,
  hidePlayedCards,
  startNewCardFromPileAnimation,
}) => {
  const [opponentCards, setOpponentCards] = useState<CardType[]>([]);
  // const [opponentAvatar, setOpponentAvatar] = useState<String>('');
  const opponentCardsRefs = useRef([]);
  const pendingAnimation = useRef<boolean>(false);

  const updateOpponentCards = useCallback(
    async (playedCards, newCards, action, isCardPlayed) => {
      pendingAnimation.current = true;
      if (isCardPlayed) {
        hidePlayedCards(true);
      }
      await startCardsAnimations(playedCards, action);
      if (isCardPlayed) {
        hidePlayedCards(false);
      }
      setOpponentCards(newCards);
      pendingAnimation.current = false;
    },
    [hidePlayedCards]
  );

  const updateOpponentNewCard = useCallback(
    async (newCardFromPile, newCards) => {
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
    const opponents = sortedBotCards(game.players);
    if (!opponents || !opponents.length) {
      return null;
    }

    const opponentData = opponents[0];

    if (!pendingAnimation?.current) {
      setOpponentCards((currentOpponentCards) => {
        const playedCards = (currentOpponentCards || [])
          .filter(
            (x) =>
              !opponentData.playerCards.find(
                (el) => el.id === x.id && el.suit === x.suit
              )
          )
          .map((card) => card.id);

        const isCardPlayed =
          (game.gameAction?.id === 'CARD_PLAYED' ||
            game.gameAction?.id === 'ARTEMIS' ||
            game.gameAction?.id === 'HYPNOS' ||
            game.gameAction?.id === 'HERMES' ||
            game.gameAction?.id === 'HADES') &&
          game.currentPlayerId !== userPlayerId;

        if (
          playedCards.length > 0 &&
          (isCardPlayed ||
            (game.gameAction?.id === 'HADES_DISCARDED' &&
              game.currentPlayerId === userPlayerId) ||
            (game.gameAction?.id === 'ARTEMIS_GIVED' &&
              game.currentPlayerId !== userPlayerId))
        ) {
          updateOpponentCards(
            playedCards,
            opponentData.playerCards,
            game.gameAction?.id,
            isCardPlayed
          );
          return currentOpponentCards;
        }

        const addedCards = (opponentData.playerCards || []).filter(
          (x) =>
            !currentOpponentCards.find(
              (el) => el.id === x.id && el.suit === x.suit
            )
        );
        if (
          addedCards.length > 0 &&
          game.gameAction?.id === 'SKIP_WITH_DICE_ROLL'
        ) {
          updateOpponentNewCard(addedCards[0], opponentData.playerCards);
          return currentOpponentCards;
        }

        return opponentData.playerCards;
      });
    }
  }, [game, updateOpponentCards, updateOpponentNewCard, userPlayerId]);

  const startCardsAnimations = async (cardsIds: string[], action: string) => {
    await Promise.all(
      cardsIds.map(async (cardId) => {
        if (
          opponentCardsRefs &&
          opponentCardsRefs.current &&
          opponentCardsRefs.current[cardId]
        ) {
          const cardReference = opponentCardsRefs?.current[cardId];
          if (cardReference) {
            await cardReference.startPlayAnimation(action);
          }
        }
      })
    );
  };

  return (
    <View>
      <View style={styles.list}>
        <FlatList
          data={opponentCards}
          keyExtractor={(card: CardType) => card.card}
          horizontal
          contentContainerStyle={{
            paddingBottom: 500,
            paddingTop: 150,
            paddingRight: 100,
            paddingLeft: 100,
          }}
          scrollEnabled={false}
          style={{ overflow: 'visible' }}
          renderItem={({ item, index }) => (
            <AnimatedHiddenCardItem
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
    marginTop: -170,
    marginRight: -100,
    marginLeft: -100,
    zIndex: 2,
  },
});

export default GameCardsOpponent;
