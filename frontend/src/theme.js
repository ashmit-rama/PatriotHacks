/**
 * Linear-style design system with dark/light mode support
 * Clean, minimal SaaS product theme
 */

export const theme = {
  dark: {
    // Background - Dark navy/charcoal
    bg: '#0d1117',
    bgElevated: '#161b22',
    bgHover: '#1c2128',
    
    // Surfaces - Soft greys
    surface: '#161b22',
    surfaceHover: '#1c2128',
    surfaceActive: '#21262d',
    
    // Borders - Subtle
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
    borderFocus: 'rgba(139, 92, 246, 0.5)',
    
    // Text
    text: '#f0f6fc',
    textSecondary: '#8b949e',
    textMuted: '#6e7681',
    textInverse: '#0d1117',
    
    // Accent - Single purple (Linear-style)
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    accentActive: '#6d28d9',
    accentLight: 'rgba(139, 92, 246, 0.1)',
    
    // Status
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    
    // Interactive
    interactive: 'rgba(255, 255, 255, 0.05)',
    interactiveHover: 'rgba(255, 255, 255, 0.08)',
  },
  
  light: {
    // Background - Light
    bg: '#ffffff',
    bgElevated: '#f8fafc',
    bgHover: '#f1f5f9',
    
    // Surfaces
    surface: '#ffffff',
    surfaceHover: '#f8fafc',
    surfaceActive: '#f1f5f9',
    
    // Borders
    border: 'rgba(0, 0, 0, 0.1)',
    borderHover: 'rgba(0, 0, 0, 0.15)',
    borderFocus: 'rgba(139, 92, 246, 0.5)',
    
    // Text
    text: '#0d1117',
    textSecondary: '#6e7681',
    textMuted: '#8b949e',
    textInverse: '#ffffff',
    
    // Accent
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    accentActive: '#6d28d9',
    accentLight: 'rgba(139, 92, 246, 0.1)',
    
    // Status
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    
    // Interactive
    interactive: 'rgba(0, 0, 0, 0.05)',
    interactiveHover: 'rgba(0, 0, 0, 0.08)',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '10px',
    xl: '12px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 2px 8px rgba(0, 0, 0, 0.15)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
  
  typography: {
    fontFamily: {
      sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      mono: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
};
