import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeColors {
  /** CSS variable values (HSL without hsl() wrapper) */
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  /** THREE.js background color for the 3D canvas */
  canvasBg: string;
  /** THREE.js fog color */
  canvasFog: string;
  /** Body shell color */
  bodyColor: string;
  /** Body shell opacity */
  bodyOpacity: number;
}

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  isDark: boolean;
  colors: ThemeColors;
}

export const themes: Theme[] = [
  {
    id: 'space-dark',
    name: 'חלל כהה',
    emoji: '🌌',
    isDark: true,
    colors: {
      background: '220 25% 6%',
      foreground: '210 40% 96%',
      card: '220 25% 10%',
      cardForeground: '210 40% 96%',
      primary: '200 85% 55%',
      primaryForeground: '220 25% 6%',
      secondary: '220 25% 16%',
      secondaryForeground: '210 40% 96%',
      muted: '220 20% 14%',
      mutedForeground: '215 15% 55%',
      accent: '170 70% 45%',
      accentForeground: '220 25% 6%',
      border: '220 20% 18%',
      canvasBg: '#080e18',
      canvasFog: '#080e18',
      bodyColor: '#5a9fcf',
      bodyOpacity: 0.35,
    },
  },
  {
    id: 'ocean-dark',
    name: 'אוקיינוס עמוק',
    emoji: '🌊',
    isDark: true,
    colors: {
      background: '200 30% 7%',
      foreground: '195 30% 95%',
      card: '200 30% 11%',
      cardForeground: '195 30% 95%',
      primary: '185 75% 48%',
      primaryForeground: '200 30% 6%',
      secondary: '200 25% 17%',
      secondaryForeground: '195 30% 90%',
      muted: '200 18% 15%',
      mutedForeground: '195 15% 52%',
      accent: '160 65% 42%',
      accentForeground: '200 30% 6%',
      border: '200 20% 20%',
      canvasBg: '#061520',
      canvasFog: '#061520',
      bodyColor: '#3da8b5',
      bodyOpacity: 0.38,
    },
  },
  {
    id: 'sunset-dark',
    name: 'שקיעה חמה',
    emoji: '🌅',
    isDark: true,
    colors: {
      background: '15 25% 7%',
      foreground: '30 30% 94%',
      card: '15 25% 11%',
      cardForeground: '30 30% 94%',
      primary: '25 90% 55%',
      primaryForeground: '15 25% 6%',
      secondary: '15 20% 17%',
      secondaryForeground: '30 30% 90%',
      muted: '15 15% 14%',
      mutedForeground: '20 12% 50%',
      accent: '340 65% 55%',
      accentForeground: '15 25% 6%',
      border: '15 18% 20%',
      canvasBg: '#1a0e08',
      canvasFog: '#1a0e08',
      bodyColor: '#c48860',
      bodyOpacity: 0.36,
    },
  },
  {
    id: 'clinical-light',
    name: 'קליני בהיר',
    emoji: '🏥',
    isDark: false,
    colors: {
      background: '210 25% 97%',
      foreground: '220 25% 12%',
      card: '210 20% 100%',
      cardForeground: '220 25% 12%',
      primary: '205 80% 48%',
      primaryForeground: '0 0% 100%',
      secondary: '210 18% 92%',
      secondaryForeground: '220 25% 20%',
      muted: '210 15% 94%',
      mutedForeground: '215 10% 42%',
      accent: '170 60% 40%',
      accentForeground: '0 0% 100%',
      border: '210 15% 88%',
      canvasBg: '#e8f0f8',
      canvasFog: '#e8f0f8',
      bodyColor: '#88b8dc',
      bodyOpacity: 0.42,
    },
  },
  {
    id: 'nature-light',
    name: 'טבע ירוק',
    emoji: '🌿',
    isDark: false,
    colors: {
      background: '120 15% 96%',
      foreground: '140 20% 12%',
      card: '120 12% 100%',
      cardForeground: '140 20% 12%',
      primary: '145 55% 42%',
      primaryForeground: '0 0% 100%',
      secondary: '120 12% 91%',
      secondaryForeground: '140 20% 20%',
      muted: '120 10% 93%',
      mutedForeground: '130 8% 44%',
      accent: '80 50% 45%',
      accentForeground: '0 0% 100%',
      border: '120 10% 86%',
      canvasBg: '#e6f2e8',
      canvasFog: '#e6f2e8',
      bodyColor: '#7cb88a',
      bodyOpacity: 0.40,
    },
  },
  {
    id: 'golden-light',
    name: 'שמש זהובה',
    emoji: '☀️',
    isDark: false,
    colors: {
      background: '40 25% 96%',
      foreground: '35 25% 12%',
      card: '40 20% 100%',
      cardForeground: '35 25% 12%',
      primary: '35 85% 52%',
      primaryForeground: '0 0% 100%',
      secondary: '40 18% 91%',
      secondaryForeground: '35 25% 20%',
      muted: '40 14% 93%',
      mutedForeground: '35 10% 44%',
      accent: '15 70% 52%',
      accentForeground: '0 0% 100%',
      border: '40 15% 86%',
      canvasBg: '#f5efe0',
      canvasFog: '#f5efe0',
      bodyColor: '#c8a870',
      bodyOpacity: 0.40,
    },
  },
];

interface ThemeContextValue {
  theme: Theme;
  setThemeId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: themes[0],
  setThemeId: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('body-explorer-theme') || 'space-dark';
  });

  const theme = themes.find((t) => t.id === themeId) ?? themes[0];

  useEffect(() => {
    localStorage.setItem('body-explorer-theme', themeId);

    const root = document.documentElement;
    const c = theme.colors;
    root.style.setProperty('--background', c.background);
    root.style.setProperty('--foreground', c.foreground);
    root.style.setProperty('--card', c.card);
    root.style.setProperty('--card-foreground', c.cardForeground);
    root.style.setProperty('--primary', c.primary);
    root.style.setProperty('--primary-foreground', c.primaryForeground);
    root.style.setProperty('--secondary', c.secondary);
    root.style.setProperty('--secondary-foreground', c.secondaryForeground);
    root.style.setProperty('--muted', c.muted);
    root.style.setProperty('--muted-foreground', c.mutedForeground);
    root.style.setProperty('--accent', c.accent);
    root.style.setProperty('--accent-foreground', c.accentForeground);
    root.style.setProperty('--border', c.border);

    // Toggle dark class for Tailwind
    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, themeId]);

  return (
    <ThemeContext.Provider value={{ theme, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
};
