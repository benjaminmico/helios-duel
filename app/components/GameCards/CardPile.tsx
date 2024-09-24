import { Card as CardType, Game } from 'gameFunctions';
import React, { FunctionComponent, Ref } from 'react';
import {
  StyleSheet,
  Platform,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Card, { CardStatus } from '../Card';
import { FONT_FAMILY_COPPERPLATE_BOLD } from 'constants/HeliosTheme';

interface ICardPile {
  game: Game;
}

const CardPile: FunctionComponent<ICardPile> = ({ game }) => {
  return (
    <View style={styles.container}>
      {game?.deck?.map(
        (item: CardType, index: number) =>
          index < 10 && (
            <Card
              key={index}
              status={CardStatus.DRAW}
              enabled={false}
              style={{
                ...styles.cardItem,
                marginLeft: 2 * index,
              }}
              card={item}
              onPress={() => {}}
              isHidden
            />
          )
      )}
      <Text
        style={[
          {
            width: 50 + (game?.deck?.length < 10 ? game?.deck?.length * 2 : 10),
          },
          styles.deckValue,
          { fontSize: Platform.OS === 'ios' ? 23 : 14 },
        ]}
      >
        {game.deck?.length}
      </Text>
    </View>
  );
};

export default CardPile;

interface IStyles {
  container: ViewStyle;
  deckValue: TextStyle;
  cardItem: ViewStyle;
}

const styles: IStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '45%',
    left: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  deckValue: {
    color: 'white',
    fontFamily: FONT_FAMILY_COPPERPLATE_BOLD,
    marginTop: 78,
    textAlign: 'center',
  },
  cardItem: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
