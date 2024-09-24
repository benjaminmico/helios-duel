import React, { FunctionComponent, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Card, Card as CardType } from 'gameFunctions';
import CardComponent, { CardStatus } from 'app/components/Card';
import { colors, FONT_FAMILY_COPPERPLATE } from 'constants/HeliosTheme';

interface IModalSelectCards {
  title: string;
  cards: CardType[];
  maxSelectedCardsLength: number;
  onPress: (selectedCards: Card[]) => void;
}

const ModalSelectCards: FunctionComponent<IModalSelectCards> = ({
  title,
  cards,
  maxSelectedCardsLength,
  onPress,
}) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const handleCardPress = useCallback(
    (card: Card) => {
      setSelectedCards((prevSelectedCards) => {
        const isSelected = prevSelectedCards.some((c) => c.id === card.id);
        const canSelectMore = prevSelectedCards.length < maxSelectedCardsLength;

        if (isSelected) {
          // Unselect the card if already selected
          return prevSelectedCards.filter((c) => c.id !== card.id);
        } else if (canSelectMore) {
          // Select the card if not already selected and below max limit
          return [...prevSelectedCards, card];
        }
        // No change if max limit reached
        return prevSelectedCards;
      });
    },
    [maxSelectedCardsLength]
  );

  const renderItem = useCallback(
    ({ item }: { item: Card }) => (
      <Pressable
        onPress={() => handleCardPress(item)}
        style={[
          styles.cardButton,
          selectedCards.some((c) => c.id === item.id)
            ? styles.cardSelected
            : styles.cardUnselected,
        ]}
      >
        <CardComponent card={item} status={CardStatus.ARTEMIS_SELECT} />
      </Pressable>
    ),
    [selectedCards, handleCardPress]
  );

  return (
    <View style={[styles.modalContainer]}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={cards}
        horizontal
        style={styles.flatList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <Button
        title='Validate'
        onPress={() => {
          onPress(selectedCards);
        }}
        disabled={selectedCards.length === 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '80%',
    width: 350,
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  flatList: {
    width: '100%',
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontFamily: FONT_FAMILY_COPPERPLATE,
    marginBottom: 16,
  },
  cardButton: {
    padding: 10,
    height: 100,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  cardSelected: {
    backgroundColor: colors.gold,
  },
  cardUnselected: {
    backgroundColor: 'black',
  },
  cardSelectButton: {
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 60,
    width: 30,
    height: 30,
  },
});

export default memo(ModalSelectCards);
