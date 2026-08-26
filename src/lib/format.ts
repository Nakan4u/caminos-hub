/** Shared call signature of `useTranslations`/`getTranslations` for a given namespace. */
type Translator = (key: string, values?: Record<string, string | number>) => string

export function formatKm(km: number, t: Translator): string {
  const value = Number.isInteger(km) ? km : km.toFixed(1)
  return t('km', { km: value })
}

export function formatPopularity(pilgrims: number, t: Translator): string {
  if (pilgrims >= 1000) return t('popularityThousands', { count: Math.round(pilgrims / 1000) })
  return t('popularityUnits', { count: pilgrims })
}
