export const theme = {
  colors: {
    primary: '#E50914',
    background: {
      main: '#141414',
      light: '#181818',
      dark: '#000000'
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)'
    },
    hover: {
      primary: '#F40612',
      card: '#181818'
    },
    overlay: {
      dark: 'rgba(0, 0, 0, 0.7)',
      gradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(20, 20, 20, 1) 100%)'
    }
  },
  spacing: {
    section: {
      desktop: '60px',
      mobile: '32px'
    },
    card: {
      gap: '0.5rem',
      padding: '0.75rem'
    }
  },
  transitions: {
    default: '200ms ease-in-out',
    slow: '300ms ease-in-out',
    fast: '150ms ease-in-out'
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  },
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }
}; 