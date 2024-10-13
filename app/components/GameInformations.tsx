import React, { FunctionComponent } from 'react';
import {
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
  Text,
  Platform,
} from 'react-native';
import { ActionName, Game } from 'gameFunctions';
import { FONT_FAMILY_COPPERPLATE_BOLD } from 'constants/HeliosTheme';

interface IGameInformations {
  game: Game;
  style?: ViewStyle;
}

function analyzeCardArray(cards: string | string[]): string {
  try {
    const parsedCards = !!cards && JSON.parse(cards as string);
    if (!!cards && Array.isArray(parsedCards)) {
      const cardValue = parsedCards[0];
      const count = parsedCards.length;
      switch (count) {
        case 2:
          return `Double ${cardValue}`;
        case 3:
          return `Triple ${cardValue}`;
        case 4:
          return `Quadruple ${cardValue}`;
        default:
          return cardValue;
      }
    }
  } catch (error) {
    console.error('Error parsing cards:', error);
  }
  return cards;
}

const GameInformations: FunctionComponent<IGameInformations> = ({
  game,
  style,
}) => {
  const actionToDisplay = () => {
    const { action } = game;
    if (!action) return null;

    switch (action.id) {
      case ActionName.GAME_BEGIN:
        return `${action.winnerDicePlayerId} wins the dice duel and starts the game!`;
      case ActionName.CARD_PLAYED:
        return `${action.playerId} played ${analyzeCardArray(action.card)}`;
      case ActionName.ARTEMIS_GIVED:
        return `${action.playerId} gave ${analyzeCardArray(action.cards)} to ${
          action.targetPlayerId
        } through Artemis`;
      case ActionName.HADES_DISCARDED:
        return `${action.playerId} discarded ${action.card} the best card of ${action.targetPlayerId}`;
      case ActionName.HYPNOS_TURNED_OFF:
        return `${action.playerId} turned off ${action.card} of ${action.targetPlayerId}`;
      case ActionName.JOKER:
        return `${action.playerId} played a Joker and cleaned the table`;
      case ActionName.SKIP_WITH_DICE_ROLL:
        return `${action.playerId} skipped the turn and rolled the dice`;
      case ActionName.SKIP_TURN:
        return `${action.playerId} skipped the turn, now ${action.nextPlayerId} can play`;
      case ActionName.DICE_ROLL_PICK_CARD:
        return `${action.playerId} rolled ${action.diceRoll} and picked a card`;
      case ActionName.DICE_ROLL_UNCHANGED:
        return `${action.playerId} rolled ${action.diceRoll} and nothing changed`;
      case ActionName.GAME_FINISHED:
        return `${action.winnerPlayerId} wins the game against ${action.looserPlayerId}`;
      case ActionName.GAME_FINISHED_ARTEMIS:
        return `${action.winnerPlayerId} wins the game, but ${action.artemisOwnerPlayerId} has an active Artemis card`;
      case ActionName.GAME_FINISHED_GOD:
        return `${action.winnerPlayerId} wins the game by playing a power card as the last card`;
      case ActionName.CURRENT_PLAYER:
        return `It's ${action.playerId} turn`;
      default:
        return null;
    }
  };

  const displayedAction = actionToDisplay();

  return (
    <View style={style}>
      {displayedAction && (
        <View style={styles.container}>
          <Text style={styles.text}>{displayedAction}</Text>
        </View>
      )}
    </View>
  );
};

export default GameInformations;

interface IStyles {
  container: ViewStyle;
  text: TextStyle;
}

const styles: IStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'absolute',
    top: 220,
    alignSelf: 'center',
    zIndex: 2,
    backgroundColor: '#29292D',
    borderColor: '#3F3F45',
    borderWidth: 2,
    borderRadius: 16,
    padding: 8,
  },
  text: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 18 : 10,
    textAlign: 'center',
    fontFamily: FONT_FAMILY_COPPERPLATE_BOLD,
  },
});
