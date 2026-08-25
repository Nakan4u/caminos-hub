import type { Difficulty } from '@/lib/filters'

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: 'Easy',
  MODERATE: 'Moderate',
  HARD: 'Hard',
}

export const DIFFICULTY_BLURBS: Record<Difficulty, string> = {
  EASY: 'Gentle terrain and short stages, with services throughout.',
  MODERATE: 'Sustained walking with real climbs, but nothing technical.',
  HARD: 'Long days, big ascent or long gaps between services.',
}

export function formatKm(km: number): string {
  return `${Number.isInteger(km) ? km : km.toFixed(1)} km`
}

export function formatPopularity(pilgrims: number): string {
  if (pilgrims >= 1000) return `~${Math.round(pilgrims / 1000)}k a year`
  return `~${pilgrims} a year`
}
