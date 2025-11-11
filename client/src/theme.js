import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#e0f7ff',
    100: '#b8e8ff',
    200: '#8ad5ff',
    300: '#5cc1ff',
    400: '#2eadff',
    500: '#0099ff',
    600: '#007acc',
    700: '#005c99',
    800: '#003d66',
    900: '#001f33',
  },
  accent: {
    50: '#f0e0ff',
    100: '#d9b3ff',
    200: '#c285ff',
    300: '#ab57ff',
    400: '#942aff',
    500: '#7c00fc',
    600: '#6200c9',
    700: '#490096',
    800: '#300064',
    900: '#180032',
  },
  neon: {
    green: '#39FF14',
    blue: '#00FFFF',
    purple: '#BC13FE',
    pink: '#FF10F0',
    yellow: '#FFFF00',
  },
  glass: {
    bg: 'rgba(17, 25, 40, 0.75)',
    border: 'rgba(255, 255, 255, 0.125)',
    highlight: 'rgba(255, 255, 255, 0.05)',
  }
};

const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      backgroundImage: props.colorMode === 'dark' 
        ? 'linear-gradient(to bottom right, rgba(0, 153, 255, 0.05), rgba(124, 0, 252, 0.05))'
        : 'none',
    },
  }),
};

const components = {
  Card: {
    baseStyle: (props) => ({
      container: {
        borderRadius: '20px',
        boxShadow: props.colorMode === 'dark' 
          ? '0 10px 40px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          : '0 8px 24px 0 rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        backdropFilter: 'blur(12px)',
        background: props.colorMode === 'dark'
          ? 'linear-gradient(135deg, rgba(26, 32, 44, 0.9) 0%, rgba(45, 55, 72, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(247, 250, 252, 0.9) 100%)',
        border: props.colorMode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        _hover: {
          transform: 'translateY(-8px) scale(1.01)',
          boxShadow: props.colorMode === 'dark' 
            ? '0 20px 50px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 153, 255, 0.3)'
            : '0 15px 35px 0 rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 153, 255, 0.2)',
        },
        _before: props.colorMode === 'dark' ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(0, 153, 255, 0.5), transparent)',
          opacity: 0,
          transition: 'opacity 0.3s',
        } : {},
        _after: props.colorMode === 'dark' ? {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: '20px',
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(0, 153, 255, 0.1), rgba(124, 0, 252, 0.1))',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          opacity: 0,
          transition: 'opacity 0.3s',
        } : {},
      },
    }),
  },
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'xl',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    variants: {
      neon: (props) => ({
        bg: props.colorMode === 'dark' 
          ? 'linear-gradient(135deg, rgba(0, 153, 255, 0.1), rgba(0, 255, 255, 0.1))'
          : 'linear-gradient(135deg, rgba(0, 153, 255, 0.05), rgba(0, 153, 255, 0.1))',
        color: props.colorMode === 'dark' ? 'neon.blue' : 'brand.600',
        border: '2px solid',
        borderColor: props.colorMode === 'dark' ? 'neon.blue' : 'brand.500',
        borderRadius: 'xl',
        position: 'relative',
        overflow: 'hidden',
        _hover: {
          bg: props.colorMode === 'dark' 
            ? 'linear-gradient(135deg, rgba(0, 153, 255, 0.2), rgba(0, 255, 255, 0.2))'
            : 'linear-gradient(135deg, rgba(0, 153, 255, 0.1), rgba(0, 153, 255, 0.15))',
          boxShadow: props.colorMode === 'dark' 
            ? '0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 153, 255, 0.2)'
            : '0 4px 15px rgba(0, 153, 255, 0.3)',
          transform: 'translateY(-2px)',
        },
        _active: {
          transform: 'translateY(0)',
          bg: props.colorMode === 'dark' ? 'rgba(0, 255, 255, 0.25)' : 'rgba(0, 153, 255, 0.2)',
        },
      }),
      solid: (props) => ({
        bg: props.colorMode === 'dark'
          ? 'linear-gradient(135deg, #0099ff 0%, #7c00fc 100%)'
          : 'linear-gradient(135deg, #0099ff 0%, #00b8ff 100%)',
        color: 'white',
        borderRadius: 'xl',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0, 153, 255, 0.4)',
        },
        _active: {
          transform: 'translateY(0)',
        },
      }),
      glass: (props) => ({
        bg: 'rgba(17, 25, 40, 0.6)',
        color: 'white',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'xl',
        _hover: {
          bg: 'rgba(17, 25, 40, 0.8)',
          transform: 'translateY(-2px)',
        },
      }),
    },
  },
  Progress: {
    baseStyle: (props) => ({
      filledTrack: {
        bg: props.colorMode === 'dark' 
          ? 'linear-gradient(90deg, #0099ff, #7c00fc)'
          : 'linear-gradient(90deg, #0099ff, #00b8ff)',
        transition: 'all 0.3s ease',
      },
      track: {
        bg: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200',
        borderRadius: 'full',
      },
    }),
  },
  Badge: {
    baseStyle: {
      borderRadius: 'lg',
      px: 3,
      py: 1,
      fontWeight: '600',
      fontSize: 'xs',
      textTransform: 'uppercase',
      letterSpacing: 'wider',
    },
    variants: {
      subtle: (props) => ({
        bg: props.colorMode === 'dark'
          ? 'rgba(0, 153, 255, 0.15)'
          : 'rgba(0, 153, 255, 0.1)',
        color: props.colorMode === 'dark' ? 'neon.blue' : 'brand.600',
        border: '1px solid',
        borderColor: props.colorMode === 'dark' 
          ? 'rgba(0, 153, 255, 0.3)'
          : 'rgba(0, 153, 255, 0.2)',
      }),
    },
  },
  Input: {
    variants: {
      filled: (props) => ({
        field: {
          bg: props.colorMode === 'dark' 
            ? 'rgba(45, 55, 72, 0.6)'
            : 'rgba(247, 250, 252, 0.8)',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: props.colorMode === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.05)',
          _hover: {
            bg: props.colorMode === 'dark' 
              ? 'rgba(45, 55, 72, 0.8)'
              : 'rgba(247, 250, 252, 1)',
          },
          _focus: {
            bg: props.colorMode === 'dark' 
              ? 'rgba(45, 55, 72, 0.9)'
              : 'white',
            borderColor: props.colorMode === 'dark' ? 'neon.blue' : 'brand.500',
            boxShadow: props.colorMode === 'dark'
              ? '0 0 0 1px rgba(0, 255, 255, 0.3)'
              : '0 0 0 1px rgba(0, 153, 255, 0.3)',
          },
        },
      }),
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Select: {
    variants: {
      filled: (props) => ({
        field: {
          bg: props.colorMode === 'dark' 
            ? 'rgba(45, 55, 72, 0.6)'
            : 'rgba(247, 250, 252, 0.8)',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: props.colorMode === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.05)',
          _hover: {
            bg: props.colorMode === 'dark' 
              ? 'rgba(45, 55, 72, 0.8)'
              : 'rgba(247, 250, 252, 1)',
          },
          _focus: {
            bg: props.colorMode === 'dark' 
              ? 'rgba(45, 55, 72, 0.9)'
              : 'white',
            borderColor: props.colorMode === 'dark' ? 'neon.blue' : 'brand.500',
            boxShadow: props.colorMode === 'dark'
              ? '0 0 0 1px rgba(0, 255, 255, 0.3)'
              : '0 0 0 1px rgba(0, 153, 255, 0.3)',
          },
        },
      }),
    },
    defaultProps: {
      variant: 'filled',
    },
  },
};

const theme = extendTheme({ 
  config, 
  colors, 
  styles,
  components,
  fonts: {
    heading: "'Montserrat', sans-serif",
    body: "'Inter', sans-serif",
  },
  layerStyles: {
    glassmorphism: {
      bg: 'glass.bg',
      backdropFilter: 'blur(4px)',
      borderRadius: 'xl',
      border: '1px solid',
      borderColor: 'glass.border',
    },
  },
});

export default theme;
