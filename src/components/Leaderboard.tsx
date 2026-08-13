import type { Prediction, Result } from '../lib/api'
import { formatHeight, formatWeight, leaderboard } from '../lib/scoring'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({
  predictions,
  result,
}: {
  predictions: Prediction[]
  result: Result
}) {
  const ranked = leaderboard(predictions, result)
  if (ranked.length === 0) return null

  return (
    <div>
      <h2 className="mb-5 text-center text-3xl font-extrabold text-sky-deep">Le classement 🏆</h2>
      <ol className="space-y-3">
        {ranked.map((p, i) => (
          <li
            key={p.id}
            className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-3xl border-4 border-white p-4 shadow-[0_5px_0_0_rgba(74,59,82,0.07)] ${
              i === 0 ? 'bg-sunny/40' : 'bg-white/70'
            }`}
          >
            <span className="w-9 shrink-0 text-center font-display text-2xl font-extrabold text-ink/50">
              {MEDALS[i] ?? i + 1}
            </span>
            <span className="font-display text-xl font-bold">{p.author}</span>
            <span className="ml-auto font-display text-2xl font-extrabold text-blush-deep tabular-nums">
              {p.score} pts
            </span>
            <p className="w-full pl-13 text-sm text-ink/60">
              {p.firstName} {p.nameOk ? '✅' : '❌'} · {formatWeight(p.weightG)}{' '}
              {p.weightDiffG === 0 ? '✅' : `(${p.weightDiffG > 0 ? '±' : ''}${p.weightDiffG} g)`} ·{' '}
              {formatHeight(p.heightCm)}{' '}
              {p.heightDiffCm === 0
                ? '✅'
                : `(±${p.heightDiffCm.toFixed(1).replace('.', ',')} cm)`}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
