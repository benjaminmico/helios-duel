import { colors } from 'constants/HeliosTheme';
import { Image, ImageStyle } from 'expo-image';
import { FunctionComponent, ReactNode } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

interface IGameBackgroundViewProps {
  children: ReactNode;
}

// Base dimensions for phone
const baseWidth = 375;
const baseHeight = 812;

// Original gameTable dimensions for base phone size
const originalGameTableWidth = 369;
const originalGameTableHeight = 395;

const GameBackgroundView: FunctionComponent<IGameBackgroundViewProps> = ({
  children,
}) => {
  const insets = useSafeAreaInsets();
  // Function to determine the style for gameTable based on screen size
  const getGameTableStyle = (): ImageStyle => {
    // Calculate scale factor
    const scaleFactor = Math.min(
      WINDOW_WIDTH / baseWidth,
      WINDOW_HEIGHT / baseHeight
    );

    return {
      width: originalGameTableWidth * scaleFactor,
      height: originalGameTableHeight * scaleFactor,
      position: 'absolute',
      alignSelf: 'center',
      left: '50%',
      top: '60%',
      transform: [
        { translateX: -(originalGameTableWidth * scaleFactor) / 2 },
        { translateY: -(originalGameTableHeight * scaleFactor) / 1.5 },
      ],
    };
  };

  return (
    <View style={styles.container}>
      <Image
        style={[styles.cornerImage, styles.top]}
        source={require('../../../assets/gameFrame.svg')}
        transition={300}
      />
      <Image
        style={[styles.cornerImage, styles.bottom]}
        source={require('../../../assets/gameFrame.svg')}
        transition={300}
      />
      <Image
        style={getGameTableStyle()}
        source={require('../../../assets/gameTable.png')}
        transition={300}
      />
      <View style={[styles.absoluteChildren]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  cornerImage: {
    width: WINDOW_WIDTH,
    height: 200,
  },
  top: {
    transform: [{ rotate: '360deg' }],
    alignSelf: 'flex-start',
  },
  bottom: {
    transform: [{ rotate: '180deg' }],
    alignSelf: 'flex-start',
  },
  absoluteChildren: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default GameBackgroundView;
