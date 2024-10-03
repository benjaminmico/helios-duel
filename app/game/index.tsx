// App.js

import React, { useRef } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Pressable,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Constants for card dimensions
const CARD_WIDTH = 100;
const CARD_HEIGHT = 150;

// Card Component
const Card = ({ initialX, initialY }) => {
  const cardRef = useRef(null);

  // Shared values for position
  const offsetX = useSharedValue(initialX);
  const offsetY = useSharedValue(initialY);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
  }));

  // Function to move card to center
  const moveCardToCenter = () => {
    cardRef.current.measure((x, y, width, height, pageX, pageY) => {
      // Calculate screen center
      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;

      // Calculate card's center position
      const cardCenterX = pageX + width / 2;
      const cardCenterY = pageY + height / 2;

      // Calculate translation needed
      const translateX = centerX - cardCenterX;
      const translateY = centerY - cardCenterY;

      // Update shared values to animate
      offsetX.value = withSpring(offsetX.value + translateX);
      offsetY.value = withSpring(offsetY.value + translateY);
    });
  };

  return (
    <Animated.View ref={cardRef} style={[styles.card, animatedStyle]}>
      <Pressable style={styles.cardContent} onPress={moveCardToCenter}>
        {/* Card content goes here */}
      </Pressable>
    </Animated.View>
  );
};

// Main App Component
const App = () => {
  // Function to generate random positions
  const getRandomPosition = () => {
    const x = Math.random() * (screenWidth - CARD_WIDTH);
    const y =
      Math.random() * (screenHeight - CARD_HEIGHT - StatusBar.currentHeight);
    return { x, y };
  };

  // Create multiple cards
  const cards = Array.from({ length: 10 }).map((_, index) => {
    const position = getRandomPosition();
    return <Card key={index} initialX={position.x} initialY={position.y} />;
  });

  return <View style={styles.container}>{cards}</View>;
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardContent: {
    flex: 1,
    backgroundColor: 'skyblue',
    borderRadius: 10,
  },
});

export default App;
