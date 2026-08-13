import type { Prediction, Result } from './api'

export type Scored = Prediction & {
  score: number
  nameOk: boolean
  weightDiffG: number
  heightDiffCm: number
}

const normalize = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

/**
 * 100 points max : 50 pour le prénom exact, 25 pour le poids (−1 pt / 40 g d'écart),
 * 25 pour la taille (−1 pt / 0,2 cm d'écart).
 */
export function score(p: Prediction, r: Result): Scored {
  const nameOk = normalize(p.firstName) === normalize(r.firstName)
  const weightDiffG = Math.abs(p.weightG - r.weightG)
  const heightDiffCm = Math.abs(p.heightCm - r.heightCm)

  const points =
    (nameOk ? 50 : 0) +
    Math.max(0, 25 - weightDiffG / 40) +
    Math.max(0, 25 - heightDiffCm * 5)

  return { ...p, score: Math.round(points * 10) / 10, nameOk, weightDiffG, heightDiffCm }
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
