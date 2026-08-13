import type { Prediction, Result } from './api'

export type Scored = Prediction & {
  score: number
  nameOk: boolean
  daysDiff: number
  weightDiffG: number
  heightDiffCm: number
}

const normalize = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

const DAY_MS = 86_400_000
const dayNumber = (isoDate: string) => Math.round(new Date(`${isoDate}T00:00:00Z`).getTime() / DAY_MS)

/**
 * 100 points : 40 pour le prénom exact, 20 par critère chiffré.
 * Chaque critère chiffré tombe à 0 au-delà de son écart max (10 jours, 1 kg, 5 cm).
 */
export function score(p: Prediction, r: Result): Scored {
  const nameOk = normalize(p.firstName) === normalize(r.firstName)
  const daysDiff = Math.abs(dayNumber(p.birthDate) - dayNumber(r.bornAt))
  const weightDiffG = Math.abs(p.weightG - r.weightG)
  const heightDiffCm = Math.round(Math.abs(p.heightCm - r.heightCm) * 10) / 10

  const points =
    (nameOk ? 40 : 0) +
    Math.max(0, 20 - daysDiff * 2) +
    Math.max(0, 20 - weightDiffG / 50) +
    Math.max(0, 20 - heightDiffCm * 4)

  return { ...p, score: Math.round(points * 10) / 10, nameOk, daysDiff, weightDiffG, heightDiffCm }
}

export function leaderboard(predictions: Prediction[], result: Result): Scored[] {
  return predictions.map((p) => score(p, result)).sort((a, b) => b.score - a.score)
}

// « 3 kg 250 » plutôt que « 3,250 kg » : la virgule française se confond avec un séparateur de milliers.
export const formatWeight = (g: number) => {
  const kg = Math.floor(g / 1000)
  const rest = g % 1000
  return rest === 0 ? `${kg} kg` : `${kg} kg ${String(rest).padStart(3, '0')}`
}

export const formatHeight = (cm: number) => `${cm.toString().replace('.', ',')} cm`

export const formatDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

export const formatDays = (days: number) => (days === 0 ? 'pile' : `à ${days} j`)
