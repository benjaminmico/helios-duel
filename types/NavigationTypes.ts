import { StackNavigationProp } from '@react-navigation/stack';
import { Game } from '@/gameFunctions'; // Import the necessary types from gameFunctions

// Define the type for the navigation stack parameters
export type RootStackParamList = {
  start: undefined; // No additional params for StartScreen
  game: { game: Game }; // Pass the game object as a parameter to GameScreen
  // Add other screens and their respective parameters if needed
};
