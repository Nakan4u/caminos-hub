export type Theme = 'light' | 'dark'

export const THEME_COOKIE = 'camino-hub-theme'

export function parseTheme(value: string | undefined): Theme | undefined {
  return value === 'dark' || value === 'light' ? value : undefined
}

export function setThemeCookie(theme: Theme) {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`
}
