/**
 * 🏫 Design System Institucional - EduCalendário
 * 
 * Paleta de cores profissional para ambiente educacional
 * Baseada em azul institucional (#1E40AF) - confiança, conhecimento, seriedade
 */

// ============================================
// 🎨 PALETA DE CORES INSTITUCIONAL
// ============================================

export const colors = {
  // Cores Primárias (Institucional)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },
  
  // Cores Neutras (Profissionais)
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  
  // Cores Semânticas (Feedback)
  semantic: {
    success: {
      50: '#F0FDF4',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      50: '#FFFBEB',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    error: {
      50: '#FEF2F2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },
    info: {
      50: '#EFF6FF',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
    },
  },
  
  // Cores por Perfil (mantendo compatibilidade)
  profile: {
    professor: '#1E40AF', // Azul institucional
    aluno: '#059669',     // Verde profissional
    gestao: '#7C3AED',    // Roxo de autoridade
  },
} as const

// ============================================
// 📐 ESPAÇAMENTO (8px Grid System)
// ============================================

export const spacing = {
  0: '0px',
  0.5: '4px',
  1: '8px',
  1.5: '12px',
  2: '16px',
  2.5: '20px',
  3: '24px',
  3.5: '28px',
  4: '32px',
  5: '40px',
  6: '48px',
  7: '56px',
  8: '64px',
  9: '72px',
  10: '80px',
  11: '88px',
  12: '96px',
  14: '112px',
  16: '128px',
  20: '160px',
  24: '192px',
  28: '224px',
  32: '256px',
  36: '288px',
  40: '320px',
  44: '352px',
  48: '384px',
  52: '416px',
  56: '448px',
  60: '480px',
  64: '512px',
  72: '576px',
  80: '640px',
  96: '768px',
} as const

// ============================================
// 🔤 TIPOGRAFIA
// ============================================

export const typography = {
  fontFamily: {
    sans: '"Inter", "Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
    '9xl': '128px',
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

// ============================================
// 🎬 ANIMAÇÕES E TRANSITIONS
// ============================================

export const animations = {
  duration: {
    fastest: '75ms',
    faster: '100ms',
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms',
  },
  
  timing: {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    'material-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'material-decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
    'material-accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
  },
  
  stagger: {
    xs: '50ms',
    sm: '75ms',
    base: '100ms',
    lg: '150ms',
    xl: '200ms',
  },
} as const

// ============================================
// 🎪 BORDER RADIUS
// ============================================

export const borderRadius = {
  none: '0px',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  full: '9999px',
} as const

// ============================================
// 🌫️ BOX SHADOW
// ============================================

export const boxShadow = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '2xl': '0 50px 100px -20px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
} as const

// ============================================
// 📱 BREAKPOINTS (Mobile-first)
// ============================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================
// 🎯 CONFIGURAÇÕES POR PERFIL
// ============================================

export const profileConfig = {
  professor: {
    primary: colors.primary[800], // #1E40AF
    light: colors.primary[100],
    muted: 'rgba(30, 64, 175, 0.1)',
    text: colors.neutral[900],
  },
  aluno: {
    primary: colors.semantic.success[600], // #059669
    light: colors.semantic.success[50],
    muted: 'rgba(5, 150, 105, 0.1)',
    text: colors.neutral[900],
  },
  gestao: {
    primary: colors.profile.gestao, // #7C3AED
    light: '#EDE9FE',
    muted: 'rgba(124, 58, 237, 0.1)',
    text: colors.neutral[900],
  },
} as const

// ============================================
// 🎪 TEMA PADRÃO (Light)
// ============================================

export const defaultTheme = {
  colors: {
    background: colors.neutral[50], // #F8FAFC
    foreground: colors.neutral[900], // #0F172A
    card: colors.neutral[0], // #FFFFFF
    'card-foreground': colors.neutral[900],
    primary: colors.primary[800], // #1E40AF
    'primary-foreground': colors.neutral[0],
    secondary: colors.primary[100],
    'secondary-foreground': colors.primary[900],
    muted: colors.neutral[100],
    'muted-foreground': colors.neutral[600],
    accent: colors.primary[500],
    'accent-foreground': colors.neutral[0],
    destructive: colors.semantic.error[600],
    'destructive-foreground': colors.neutral[0],
    border: colors.neutral[200],
    input: colors.neutral[300],
    ring: colors.primary[500],
  },
  
  borderRadius: {
    ...borderRadius,
    container: borderRadius.lg,
  },
  
  fontFamily: typography.fontFamily.sans,
  
  spacing,
  
  animations: {
    ...animations,
    prefersReducedMotion: '(prefers-reduced-motion: reduce)',
  },
} as const

// ============================================
// 🌙 TEMA ESCURO
// ============================================

export const darkTheme = {
  colors: {
    background: colors.neutral[950], // #020617
    foreground: colors.neutral[50], // #F8FAFC
    card: colors.neutral[900], // #0F172A
    'card-foreground': colors.neutral[50],
    primary: colors.primary[400], // #60A5FA
    'primary-foreground': colors.neutral[950],
    secondary: colors.neutral[800],
    'secondary-foreground': colors.neutral[50],
    muted: colors.neutral[800],
    'muted-foreground': colors.neutral[400],
    accent: colors.primary[700],
    'accent-foreground': colors.neutral[50],
    destructive: colors.semantic.error[700],
    'destructive-foreground': colors.neutral[50],
    border: colors.neutral[800],
    input: colors.neutral[700],
    ring: colors.primary[600],
  },
  
  // Restante das configurações mantidas do tema light
  borderRadius: defaultTheme.borderRadius,
  fontFamily: defaultTheme.fontFamily,
  spacing: defaultTheme.spacing,
  animations: defaultTheme.animations,
} as const

// ============================================
// 🛠️ UTILITÁRIOS
// ============================================

/**
 * Retorna a configuração de cores para um perfil específico
 */
export function getProfileColors(profile: keyof typeof profileConfig) {
  return profileConfig[profile]
}

/**
 * Retorna o tema atual (light/dark) baseado em preferências
 */
export function getCurrentTheme(isDarkMode = false) {
  return isDarkMode ? darkTheme : defaultTheme
}

/**
 * Converte valores do design system para CSS custom properties
 */
export function toCSSVariables(theme: typeof defaultTheme, prefix = 'edu') {
  const variables: Record<string, string> = {}
  
  // Cores
  Object.entries(theme.colors).forEach(([key, value]) => {
    variables[`--${prefix}-${key}`] = value
  })
  
  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    variables[`--${prefix}-radius-${key}`] = value
  })
  
  // Espaçamento
  Object.entries(theme.spacing).forEach(([key, value]) => {
    variables[`--${prefix}-spacing-${key}`] = value
  })
  
  return variables
}

/**
 * Tipo para o tema completo
 */
export type Theme = typeof defaultTheme
export type ColorPalette = typeof colors
export type ProfileType = keyof typeof profileConfig