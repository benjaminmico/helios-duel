import React, {
  FunctionComponent,
  memo,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { View, ViewStyle } from 'react-native';

interface ICardCurrentPlayerProps {
  index: number;
  children: ReactNode;
  style: ViewStyle;
  nbCards: number;
}

const CardCurrentPlayer: FunctionComponent<ICardCurrentPlayerProps> = ({
  index,
  children,
  style,
  nbCards,
  ...props
}) => {
  const cardContainerStyle = useRef([
    style,
    {
      zIndex: nbCards - index,
      elevation: nbCards - index,
    },
  ]);

  useEffect(() => {
    // Trick to make the elevation style working on Android
    setTimeout(() => {
      cardContainerStyle.current = [
        ...cardContainerStyle.current,
        { zIndex: nbCards - index, elevation: nbCards - index },
      ];
    }, 100);
  }, [index, nbCards]);

  return (
    <View {...props} style={cardContainerStyle.current}>
      {children}
    </View>
  );
};

export default memo(CardCurrentPlayer);
