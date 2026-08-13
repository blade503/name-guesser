import type { Prediction } from '../lib/api'
import { formatDate, formatHeight, formatWeight } from '../lib/scoring'

const TINTS = ['bg-blush/25', 'bg-sky-soft/40', 'bg-mint/30', 'bg-sunny/30', 'bg-lavender/25']

export default function PredictionList({ predictions }: { predictions: Prediction[] }) {
  if (predictions.length === 0) {
    return (
      <p className="text-center font-display text-lg text-ink/60">
        Personne n’a encore parié. Sois le premier ! 🎈
      </p>
    )
  }

  return (
    <div>
      <h2 className="mb-5 text-center text-3xl font-extrabold text-sky-deep">
        {predictions.length} pronostic{predictions.length > 1 ? 's' : ''} 🎯
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {predictions.map((p, i) => (
          <li
            key={p.id}
            className={`${TINTS[i % TINTS.length]} rounded-3xl border-4 border-white p-5 shadow-[0_5px_0_0_rgba(74,59,82,0.07)]`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-lg font-bold text-ink/70">{p.author}</span>
              <span className="font-display text-2xl font-extrabold text-blush-deep">{p.firstName}</span>
            </div>
            <p className="mt-2 font-semibold text-ink/80">
              le {formatDate(p.birthDate)}
            </p>
            <p className="font-semibold text-ink/80">
              {formatWeight(p.weightG)} · {formatHeight(p.heightCm)}
            </p>
            {p.message && <p className="mt-2 text-sm italic text-ink/60">« {p.message} »</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
