import { useState, type FormEvent } from 'react'
import { config } from '../config'
import { api, type Prediction } from '../lib/api'
import { formatHeight, formatWeight } from '../lib/scoring'

const { weightG, heightCm } = config.limits

export default function PredictionForm({ onCreated }: { onCreated: (p: Prediction) => void }) {
  const [author, setAuthor] = useState('')
  const [firstName, setFirstName] = useState('')
  const [weight, setWeight] = useState(3300)
  const [height, setHeight] = useState(50)
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const created = await api.createPrediction({
        author: author.trim(),
        firstName: firstName.trim(),
        weightG: weight,
        heightCm: height,
        message: message.trim() || null,
      })
      localStorage.setItem('pronostic-id', String(created.id))
      onCreated(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="card animate-pop space-y-5">
      <h2 className="text-center text-3xl font-extrabold text-blush-deep">Mon pronostic 🔮</h2>

      <div>
        <label className="label" htmlFor="author">
          Toi, c’est qui ?
        </label>
        <input
          id="author"
          className="field"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Fabien"
          maxLength={40}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="firstName">
          Elle va s’appeler…
        </label>
        <input
          id="firstName"
          className="field"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Pauline"
          maxLength={40}
          required
        />
      </div>

      <Slider
        id="weight"
        label="Elle pèsera"
        display={formatWeight(weight)}
        value={weight}
        onChange={setWeight}
        {...weightG}
        accent="accent-blush-deep"
      />

      <Slider
        id="height"
        label="Elle mesurera"
        display={formatHeight(height)}
        value={height}
        onChange={setHeight}
        {...heightCm}
        accent="accent-sky-deep"
      />

      <div>
        <label className="label" htmlFor="message">
          Un petit mot ? <span className="font-normal text-ink/50">(optionnel)</span>
        </label>
        <textarea
          id="message"
          className="field resize-none"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hâte de te rencontrer !"
          maxLength={200}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-blush/30 px-4 py-3 text-center font-semibold text-blush-deep">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? 'Envoi…' : 'Envoyer mon pronostic ✨'}
      </button>
    </form>
  )
}

type SliderProps = {
  id: string
  label: string
  display: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  accent: string
}

function Slider({ id, label, display, value, onChange, min, max, step, accent }: SliderProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="label mb-0" htmlFor={id}>
          {label}
        </label>
        <span className="font-display text-2xl font-extrabold text-blush-deep tabular-nums">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        className={`h-3 w-full cursor-pointer appearance-none rounded-full bg-lavender/40 ${accent}`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
