/**
 * API des pronostics. Le mot de passe parents ne quitte jamais le Worker :
 * le front l'envoie dans X-Admin-Password, la comparaison se fait ici.
 */

export type Env = {
  DB: D1Database
  ADMIN_PASSWORD: string
  /** Origines autorisées, séparées par des virgules. */
  ALLOWED_ORIGINS: string
}

type PredictionRow = {
  id: number
  author: string
  first_name: string
  birth_date: string
  weight_g: number
  height_cm: number
  message: string | null
  created_at: string
}

type ResultRow = {
  first_name: string | null
  weight_g: number | null
  height_cm: number | null
  born_at: string | null
  published: number
}

const LIMITS = {
  weightG: { min: 1000, max: 6000 },
  heightCm: { min: 30, max: 65 },
  author: 40,
  firstName: 40,
  message: 200,
  /** Garde-fou anti-spam : au-delà, les insertions sont refusées. */
  maxPredictions: 500,
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    const { pathname } = new URL(request.url)

    try {
      const res = await route(request, env, pathname)
      for (const [k, v] of Object.entries(cors)) res.headers.set(k, v)
      return res
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500
      const message = err instanceof HttpError ? err.message : 'Erreur interne.'
      if (status === 500) console.error(err)
      return json({ error: message }, status, cors)
    }
  },
} satisfies ExportedHandler<Env>

async function route(request: Request, env: Env, pathname: string): Promise<Response> {
  const method = request.method

  if (pathname === '/api/predictions' && method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT id, author, first_name, birth_date, weight_g, height_cm, message, created_at FROM predictions ORDER BY created_at DESC, id DESC',
    ).all<PredictionRow>()
    return json(results.map(toPrediction))
  }

  if (pathname === '/api/predictions' && method === 'POST') {
    return json(await createPrediction(request, env), 201)
  }

  // Tant que published = 0, la route publique ne révèle rien — pas même le prénom.
  if (pathname === '/api/result' && method === 'GET') {
    const row = await readResult(env)
    return json(row?.published ? toResult(row) : null)
  }

  // Vue des parents : renvoie le brouillon scellé, publié ou non.
  if (pathname === '/api/admin/result' && method === 'GET') {
    requireAdmin(request, env)
    const row = await readResult(env)
    return json(row ? toDraft(row) : null)
  }

  if (pathname === '/api/result' && method === 'POST') {
    requireAdmin(request, env)
    return json(await saveResult(request, env))
  }

  if (pathname === '/api/admin/check' && method === 'POST') {
    requireAdmin(request, env)
    return json({ ok: true })
  }

  throw new HttpError('Route inconnue.', 404)
}

async function createPrediction(request: Request, env: Env) {
  const body = await readJson(request)

  const author = text(body.author, 'author', LIMITS.author)
  const firstName = text(body.firstName, 'firstName', LIMITS.firstName)
  const birthDate = date(body.birthDate, 'birthDate')
  const weightG = int(body.weightG, 'weightG', LIMITS.weightG)
  const heightCm = num(body.heightCm, 'heightCm', LIMITS.heightCm)
  const message =
    body.message == null || String(body.message).trim() === ''
      ? null
      : text(body.message, 'message', LIMITS.message)

  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM predictions').first<{ n: number }>()
  if ((count?.n ?? 0) >= LIMITS.maxPredictions) {
    throw new HttpError('Les pronostics sont clos.', 429)
  }

  const row = await env.DB.prepare(
    `INSERT INTO predictions (author, first_name, birth_date, weight_g, height_cm, message)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING id, author, first_name, birth_date, weight_g, height_cm, message, created_at`,
  )
    .bind(author, firstName, birthDate, weightG, heightCm, message)
    .first<PredictionRow>()

  if (!row) throw new HttpError('Enregistrement impossible.', 500)
  return toPrediction(row)
}

const readResult = (env: Env) =>
  env.DB.prepare(
    'SELECT first_name, weight_g, height_cm, born_at, published FROM result WHERE id = 1',
  ).first<ResultRow>()

/**
 * Enregistre le brouillon des parents. Les champs absents sont acceptés tant que
 * `publish` est faux — publier exige en revanche les quatre.
 */
async function saveResult(request: Request, env: Env) {
  const body = await readJson(request)
  const publish = body.publish === true

  const optional = <T>(value: unknown, parse: () => T): T | null =>
    value == null || value === '' ? null : parse()

  const firstName = optional(body.firstName, () => text(body.firstName, 'firstName', LIMITS.firstName))
  const weightG = optional(body.weightG, () => int(body.weightG, 'weightG', LIMITS.weightG))
  const heightCm = optional(body.heightCm, () => num(body.heightCm, 'heightCm', LIMITS.heightCm))
  const bornAt = optional(body.bornAt, () => date(body.bornAt, 'bornAt'))

  if (publish && (firstName === null || weightG === null || heightCm === null || bornAt === null)) {
    throw new HttpError('Prénom, date, poids et taille sont tous requis pour publier.', 400)
  }

  await env.DB.prepare(
    `INSERT INTO result (id, first_name, weight_g, height_cm, born_at, published, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       first_name = excluded.first_name,
       weight_g   = excluded.weight_g,
       height_cm  = excluded.height_cm,
       born_at    = excluded.born_at,
       published  = excluded.published,
       updated_at = excluded.updated_at`,
  )
    .bind(firstName, weightG, heightCm, bornAt, publish ? 1 : 0)
    .run()

  return { firstName, weightG, heightCm, bornAt, published: publish }
}

/* ---------- auth ---------- */

function requireAdmin(request: Request, env: Env) {
  const given = request.headers.get('X-Admin-Password') ?? ''
  if (!env.ADMIN_PASSWORD || !timingSafeEqual(given, env.ADMIN_PASSWORD)) {
    throw new HttpError('Mot de passe incorrect.', 401)
  }
}

/** Comparaison à durée constante : empêche de deviner le mot de passe caractère par caractère. */
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const ab = encoder.encode(a)
  const bb = encoder.encode(b)
  // timingSafeEqual exige des tailles égales ; la longueur seule n'est pas un secret utile.
  if (ab.byteLength !== bb.byteLength) return false
  return crypto.subtle.timingSafeEqual(ab, bb)
}

/* ---------- helpers ---------- */

class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') throw new HttpError('Corps de requête invalide.', 400)
  return body as Record<string, unknown>
}

function text(value: unknown, field: string, maxLength: number): string {
  const s = String(value ?? '').trim()
  if (s.length === 0) throw new HttpError(`Le champ « ${field} » est obligatoire.`, 400)
  if (s.length > maxLength) throw new HttpError(`Le champ « ${field} » est trop long.`, 400)
  return s
}

function num(value: unknown, field: string, range: { min: number; max: number }): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < range.min || n > range.max) {
    throw new HttpError(`Le champ « ${field} » doit être compris entre ${range.min} et ${range.max}.`, 400)
  }
  return n
}

function int(value: unknown, field: string, range: { min: number; max: number }): number {
  return Math.round(num(value, field, range))
}

/** Date au format YYYY-MM-DD, réellement existante (rejette 2026-02-31). */
function date(value: unknown, field: string): string {
  const s = String(value ?? '')
  const parsed = new Date(`${s}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== s) {
    throw new HttpError(`Le champ « ${field} » n'est pas une date valide.`, 400)
  }
  return s
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') ?? ''
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
  if (allowed.includes('*') || allowed.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = allowed.includes('*') ? '*' : origin
  }
  return headers
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })
}

const toPrediction = (r: PredictionRow) => ({
  id: r.id,
  author: r.author,
  firstName: r.first_name,
  birthDate: r.birth_date,
  weightG: r.weight_g,
  heightCm: r.height_cm,
  message: r.message,
  createdAt: r.created_at,
})

const toResult = (r: ResultRow) => ({
  firstName: r.first_name,
  weightG: r.weight_g,
  heightCm: r.height_cm,
  bornAt: r.born_at,
})

const toDraft = (r: ResultRow) => ({ ...toResult(r), published: r.published === 1 })
