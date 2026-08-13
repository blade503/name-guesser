import { config } from '../config'

export type Prediction = {
  id: number
  author: string
  firstName: string
  /** Date de naissance pronostiquée, format YYYY-MM-DD. */
  birthDate: string
  weightG: number
  heightCm: number
  message: string | null
  createdAt: string
}

export type Result = {
  firstName: string
  weightG: number
  heightCm: number
  bornAt: string
}

export type NewPrediction = Omit<Prediction, 'id' | 'createdAt'>

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${config.apiUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError('Impossible de joindre le serveur. Vérifie ta connexion.', 0)
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new ApiError(body?.error ?? `Erreur ${res.status}`, res.status)
  }
  return res.json() as Promise<T>
}

export const api = {
  listPredictions: () => request<Prediction[]>('/api/predictions'),

  createPrediction: (p: NewPrediction) =>
    request<Prediction>('/api/predictions', { method: 'POST', body: JSON.stringify(p) }),

  getResult: () => request<Result | null>('/api/result'),

  saveResult: (r: Result, password: string) =>
    request<Result>('/api/result', {
      method: 'POST',
      headers: { 'X-Admin-Password': password },
      body: JSON.stringify(r),
    }),

  checkPassword: (password: string) =>
    request<{ ok: true }>('/api/admin/check', {
      method: 'POST',
      headers: { 'X-Admin-Password': password },
    }),
}

export { ApiError }
