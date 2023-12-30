import { ViewStyle } from 'react-native';

export type TokenStyle = { borderColor: string; backgroundColor: string };

export type Colors = {
  background: string;
  primary: string;
  secondary: string;
  success: string;
  failure: string;
  gold: string;
  shades: { [key: string]: string };
  neutrals: { [key: string]: string };
  borders: {
    [key: string]: string;
    cards: string;
    cardsActive: string;
    avatar: string;
    buttons: string;
  };
  tokens: { [key: string]: TokenStyle };
  input: {
    placeholder: string;
  };
  opacity: {
    blackOpacity: string;
    blackLightOpacity: string;
    blackSuperLightOpacity: string;
    primaryLightOpacity: string;
  };
  progress: {
    unfilled: string;
  };
  buttons: {
    signUpBackgroundColor: string;
    genderBackgroundColor: string;
  };
  tokensCounter: {
    backgroundColor: string;
  };
  toast: {
    backgroundColor: string;
  };
  profileCategoryItem: {
    backgroundColor: string;
    selectedLabel: string;
  };
};

export type CommonStyles = {
  borders: ViewStyle;
};

const colors: Colors = {
  background: '#000000',
  primary: '#EAB308',
  secondary: '#CA8E00',
  success: 'rgba(22, 163, 74, 1)',
  failure: 'rgba(239, 68, 68, 1)',
  gold: '#C98D00',
  shades: {
    0: '#000000',
    1: '#FFFFFF',
  },
  neutrals: {
    0: '#4D4D4D',
    1: '#989898',
    2: '#E5E5E5',
    3: '#D6D3D1',
    4: '#212121',
  },
  borders: {
    0: '#EAB308',
    1: '#C98D00',
    cards: '#3C3C3B',
    cardsActive: '#EAB308',
    avatar: '#C98D00',
    buttons: '#C98D00',
    tokensCounter: '#C98D00',
  },
  tokens: {
    bronze: {
      borderColor: '#AB5459',
      backgroundColor: '#7D313D',
    },
    silver: {
      borderColor: '#B1B1B1',
      backgroundColor: '#636362',
    },
    gold: {
      borderColor: '#9A6505',
      backgroundColor: '#8D5B00',
    },
    black: {
      borderColor: '#707070',
      backgroundColor: '#000000',
    },
  },
  input: {
    placeholder: 'rgba(255,255,255,0.3)',
  },
  opacity: {
    blackOpacity: 'rgba(0,0,0,0.8)',
    blackLightOpacity: 'rgba(0,0,0,0.8)',
    blackSuperLightOpacity: 'rgba(0,0,0,0.2)',
    primaryLightOpacity: 'rgba(201, 141, 0, 0.5)',
  },
  progress: {
    unfilled: '#333333',
  },
  buttons: {
    signUpBackgroundColor: '#1A1A1A',
    genderBackgroundColor: '#5E3A00',
  },
  tokensCounter: {
    backgroundColor: '#1A1A1A',
  },
  toast: {
    backgroundColor: '#1A1A1A',
  },
  profileCategoryItem: {
    backgroundColor: '#331D00',
    selectedLabel: '#331D00',
  },
};

const commonStyles: CommonStyles = {
  borders: { borderColor: colors.primary, borderWidth: 1, borderRadius: 4 },
};

const commonPaddingScreen = { paddingLeft: 16, paddingRight: 16 };

const FONT_FAMILY = 'Amiri';
const FONT_FAMILY_COPPERPLATE = 'Copperplate';
const FONT_FAMILY_COPPERPLATE_BOLD = 'Copperplate-Bold';
const FONT_FAMILY_TIMES = 'Times';
const FONT_FAMILY_OPEN_SANS = 'OpenSans';

export {
  colors,
  commonStyles,
  FONT_FAMILY,
  FONT_FAMILY_COPPERPLATE,
  FONT_FAMILY_COPPERPLATE_BOLD,
  FONT_FAMILY_TIMES,
  FONT_FAMILY_OPEN_SANS,
  commonPaddingScreen,
};
