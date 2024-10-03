import React, { FunctionComponent, ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import {
  FONT_FAMILY_COPPERPLATE,
  FONT_FAMILY_COPPERPLATE_BOLD,
  colors,
} from 'constants/HeliosTheme';

export type ButtonActionSize = 'SMALL' | 'LARGE';

interface IButtonActionProps {
  label?: string;
  icon?: () => ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
  size?: ButtonActionSize;
}

/**
 * Button Action, mostly use on a Game for die launch for ex
 */
const ButtonAction: FunctionComponent<IButtonActionProps> = ({
  label = '',
  icon,
  onPress,
  disabled = false,
  testID,
  size = 'SMALL',
  style = {},
}) => {
  const buttonDisabled = disabled || !onPress;

  const getButtonActionSize = () => (size === 'SMALL' ? 60 : 90);

  const getButtonActionContainerStyle = (): ViewStyle =>
    size === 'SMALL' ? styles.containerSmall : styles.containerLarge;

  const getButtonActionLabelStyle = (): TextStyle =>
    size === 'SMALL' ? styles.labelSmall : styles.labelLarge;

  const BUTTON_SIZE = getButtonActionSize() - (size === 'SMALL' ? 11 : 30);

  return (
    <TouchableOpacity
      activeOpacity={!buttonDisabled ? undefined : 1.0}
      testID={`${testID}ButtonAction` || 'ButtonAction'}
      style={{
        ...getButtonActionContainerStyle(),
        ...style,
        ...{ opacity: disabled ? 0.6 : 1 },
      }}
      disabled={disabled}
      onPress={onPress}
    >
      <Image
        style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }}
        source={require('../../../assets/buttonAction.svg')}
        transition={100}
      />
      <View style={styles.containerIcon}>{icon && icon()}</View>
      <View style={styles.contentContainer}>
        <Text
          testID={`${testID}ButtonActionLabel` || 'ButtonActionLabel'}
          style={getButtonActionLabelStyle()}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const ButtonActionIconContainerStyle: ViewStyle = { top: 3 };

export default ButtonAction;

interface IStyles {
  containerSmall: ViewStyle;
  containerLarge: ViewStyle;
  contentContainer: ViewStyle;
  iconContainer: ViewStyle;
  labelSmall: TextStyle;
  labelLarge: TextStyle;
  containerIcon: ViewStyle;
}

const styles: IStyles = StyleSheet.create({
  containerSmall: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: colors.shades[0],
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerLarge: {
    width: 70,
    height: 70,
    borderRadius: 70 / 2,
    backgroundColor: colors.shades[0],
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    top: 3,
  },
  labelSmall: {
    fontSize: 12,
    fontFamily: FONT_FAMILY_COPPERPLATE,
    color: colors.primary,
  },
  labelLarge: {
    fontSize: 14,
    fontFamily: FONT_FAMILY_COPPERPLATE_BOLD,
    color: colors.primary,
  },
  containerIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    height: 1,
  },
});
