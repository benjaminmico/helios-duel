import GameBackgroundView from 'app/components/GameBackgroundView';
import React, { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../reducers';
import GameCards from 'app/components/GameCards';
import { StatusBar } from 'expo-status-bar';

const HeliosDuelTest: FunctionComponent = () => {
  const game = useSelector((state: RootState) => state.game);

  return (
    <GameBackgroundView>
      <StatusBar style='light' />
      <View style={styles.container}>
        <GameCards game={game} />
      </View>
    </GameBackgroundView>
  );
};

export default HeliosDuelTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
