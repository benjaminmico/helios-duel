import React, { FunctionComponent } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import Card, { CARD_VALIDATION_WIDTH, CardStatus } from '../cleanVersion/Card';
import { CardHistory, Card as CardType } from 'gameFunctions';
import { Image } from 'expo-image';
import ButtonAction from '../ButtonAction';
import { getFlattenCardPlayed } from './utils';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

interface ICardGameCardsSelected {
  selectedCards: CardType[];
  cardsPlayed: CardHistory[];
  onCancelCardSelection: () => void;
  onPlaySelection: () => void;
}

const GameCardsSelected: FunctionComponent<ICardGameCardsSelected> = ({
  selectedCards,
  cardsPlayed,
  onCancelCardSelection,
  onPlaySelection,
}) => {
  if (!selectedCards?.length) return;

  const hasCardsPlayed = cardsPlayed?.length > 0;
  const canPlaySelectedCards = hasCardsPlayed
    ? selectedCards.length === cardsPlayed[0].cardsPlayed.length
    : true;
  return (
    <View
      style={{
        ...styles.selectedCardsContainer,
      }}
    >
      <FlatList
        keyExtractor={(card: CardType, index: number) => `${card.id}${index}`}
        horizontal
        data={selectedCards || []}
        renderItem={({ item, index }) => (
          <Card
            enabled={false}
            card={item}
            status={CardStatus.VALIDATION}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              ...styles.selectedCard,
              marginLeft: index > 0 ? -CARD_VALIDATION_WIDTH / 2 : 0,
            }}
          />
        )}
      />
      <ButtonAction
        icon={() => (
          <Image
            style={{ width: 15, height: 15 }}
            source={require('../../../assets/buttonActionCancel.svg')}
            transition={100}
          />
        )}
        size='SMALL'
        onPress={onCancelCardSelection}
      />
      {canPlaySelectedCards && (
        <ButtonAction
          label='OK'
          size='SMALL'
          onPress={onPlaySelection}
          style={{ alignSelf: 'flex-end' }}
        />
      )}
    </View>
  );
};

export default GameCardsSelected;

const styles = StyleSheet.create({
  selectedCard: { zIndex: 99999 },
  selectedCardsContainer: {
    position: 'absolute',
    // top: 0,
    alignItems: 'center',
    top: WINDOW_HEIGHT / 2,
    width: '100%',
    zIndex: 99999,
  },
});
