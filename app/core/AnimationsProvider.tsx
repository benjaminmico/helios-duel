import React, { FunctionComponent, useState } from 'react';

export const AnimationsContext = React.createContext<IAnimationsContext>({
  hasPendingAnimations: false,
  setHasPendingAnimations: () => {},
});

interface IAnimationsProviderProps {
  children: React.ReactNode;
}

export interface IAnimationsContext {
  hasPendingAnimations: boolean;
  setHasPendingAnimations: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnimationsProvider: FunctionComponent<IAnimationsProviderProps> = ({
  children,
}) => {
  const [hasPendingAnimations, setHasPendingAnimations] = useState(false);

  return (
    <AnimationsContext.Provider
      value={{ hasPendingAnimations, setHasPendingAnimations }}
    >
      {children}
    </AnimationsContext.Provider>
  );
};

export default AnimationsProvider;
