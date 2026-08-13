import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { config } from '../config'
import { api, type Result } from '../lib/api'
import Sky from '../components/Sky'

const { weightG, heightCm } = config.limits
const todayISO = () => new Date().toISOString().slice(0, 10)

export default function Admin() {
  const [password, setPassword] = useState(() => sessionStorage.getItem('admin-password') ?? '')
  const [unlocked, setUnlocked] = useState(false)
  const [checking, setChecking] = useState(true)

  // Le mot de passe est validé par le Worker : rien ne sert de le comparer ici.
  useEffect(() => {
    if (!password) return setChecking(false)
    api
      .checkPassword(password)
      .then(() => setUnlocked(true))
      .catch(() => sessionStorage.removeItem('admin-password'))
      .finally(() => setChecking(false))
  }, [password])

  return (
    <>
      <Sky />
      <main className="mx-auto max-w-xl px-4 py-12">
        <header className="mb-8 text-center">
          <span className="inline-block animate-bob text-6xl">🔐</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-blush-deep">Espace parents</h1>
        </header>

        {checking ? (
          <p className="text-center font-display text-lg text-ink/60">Vérification…</p>
        ) : unlocked ? (
          <ResultForm password={password} />
        ) : (
          <PasswordGate
            onUnlocked={(pwd) => {
              sessionStorage.setItem('admin-password', pwd)
              setPassword(pwd)
              setUnlocked(true)
            }}
          />
        )}

        <p className="mt-8 text-center">
          <Link to="/" className="font-display text-ink/50 underline">
            ← Retour au site
          </Link>
        </p>
      </main>
    </>
  )
}

function PasswordGate({ onUnlocked }: { onUnlocked: (password: string) => void }) {
  const [value, setValue] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await api.checkPassword(value)
      onUnlocked(value)
    } catch {
      setError('Mot de passe incorrect.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div>
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          className="field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-center font-semibold text-blush-deep">
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? 'Vérification…' : 'Entrer'}
      </button>
    </form>
  )
}

function ResultForm({ password }: { password: string }) {
  const [firstName, setFirstName] = useState('')
  const [weight, setWeight] = useState(3300)
  const [height, setHeight] = useState(50)
  const [bornAt, setBornAt] = useState(todayISO())
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Pré-remplit si un résultat a déjà été publié (correction d'une faute de frappe).
  useEffect(() => {
    api.getResult().then((r) => {
      if (!r) return
      setFirstName(r.firstName)
      setWeight(r.weightG)
      setHeight(r.heightCm)
      setBornAt(r.bornAt.slice(0, 10))
    })
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const result: Result = {
        firstName: firstName.trim(),
        weightG: weight,
        heightCm: height,
        bornAt,
      }
      await api.saveResult(result, password)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setPending(false)
    }
  }

  if (saved) {
    return (
      <div className="card animate-pop text-center">
        <p className="text-6xl">🎉</p>
        <p className="mt-3 font-display text-2xl font-bold text-mint">Résultat publié !</p>
        <p className="mt-2 text-ink/60">Le classement est maintenant visible par tout le monde.</p>
        <button className="btn-secondary mt-6" onClick={() => setSaved(false)}>
          Modifier
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="card space-y-5">
      <p className="rounded-2xl bg-sunny/30 px-4 py-3 text-center font-semibold text-ink/70">
        ⚠️ Une fois publié, le résultat et le classement sont visibles par tout le monde.
      </p>

      <div>
        <label className="label" htmlFor="firstName">
          Son prénom
        </label>
        <input
          id="firstName"
          className="field"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          maxLength={40}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="bornAt">
          Date de naissance
        </label>
        <input
          id="bornAt"
          type="date"
          className="field"
          value={bornAt}
          onChange={(e) => setBornAt(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="weight">
            Poids (g)
          </label>
          <input
            id="weight"
            type="number"
            className="field"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            min={weightG.min}
            max={weightG.max}
            step={1}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="height">
            Taille (cm)
          </label>
          <input
            id="height"
            type="number"
            className="field"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            min={heightCm.min}
            max={heightCm.max}
            step={0.1}
            required
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-center font-semibold text-blush-deep">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? 'Publication…' : 'Publier le résultat 🎉'}
      </button>
    </form>
  )
}
