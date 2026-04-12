const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'

export const isDemoMode = isDemo
export const BRAND = isDemo ? {
  name: import.meta.env.VITE_DEMO_BRAND_NAME
    || 'ClientNest',
  tagline: import.meta.env.VITE_DEMO_TAGLINE
    || 'Your Property Journey, Simplified',
  primary: import.meta.env.VITE_DEMO_PRIMARY
    || '#52B788',
  dark: import.meta.env.VITE_DEMO_DARK
    || '#2D3A2E',
  accent: import.meta.env.VITE_DEMO_ACCENT
    || '#D4A843',
} : {
  name: 'Buyers Match',
  tagline: "Australia's Leading Buyer's Agency",
  primary: '#52B788',
  dark: '#2D3A2E',
  accent: '#D4A843',
}
