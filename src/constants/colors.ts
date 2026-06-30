// ─── Color Constants ───────────────────────────────────────────────────────

export const COLORS = {
  // Primary
  neonGreen: '#00ff41',
  neonGreenDim: '#00cc33',
  neonGreenGlow: 'rgba(0, 255, 65, 0.15)',
  
  // Blues
  cyberBlue: '#00d4ff',
  cyberBlueDim: '#0099cc',
  cyberBlueGlow: 'rgba(0, 212, 255, 0.15)',
  
  // Backgrounds
  bgPrimary: '#0a0a0f',
  bgSecondary: '#0f0f17',
  bgTertiary: '#141420',
  bgCard: '#1a1a2e',
  bgCardHover: '#1f1f35',
  bgInput: '#12121c',
  
  // Grays
  gray50: '#fafafa',
  gray100: '#e4e4e7',
  gray200: '#c8c8d0',
  gray300: '#a1a1aa',
  gray400: '#71717a',
  gray500: '#52525b',
  gray600: '#3f3f46',
  gray700: '#27272a',
  gray800: '#1c1c22',
  gray900: '#111116',
  
  // Severity Colors
  critical: '#ff1744',
  criticalGlow: 'rgba(255, 23, 68, 0.15)',
  high: '#ff6d00',
  highGlow: 'rgba(255, 109, 0, 0.15)',
  medium: '#ffab00',
  mediumGlow: 'rgba(255, 171, 0, 0.15)',
  low: '#00e676',
  lowGlow: 'rgba(0, 230, 118, 0.15)',
  info: '#2979ff',
  infoGlow: 'rgba(41, 121, 255, 0.15)',
  
  // Status
  success: '#00e676',
  warning: '#ffab00',
  error: '#ff1744',
  
  // Glass
  glassBg: 'rgba(20, 20, 32, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.06)',
  glassBorderHover: 'rgba(255, 255, 255, 0.1)',
} as const;

export const SEVERITY_COLORS: Record<string, string> = {
  critical: COLORS.critical,
  high: COLORS.high,
  medium: COLORS.medium,
  low: COLORS.low,
  info: COLORS.info,
};
