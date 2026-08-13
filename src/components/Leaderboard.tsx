import type { Prediction, Result } from '../lib/api'
import { formatDate, formatHeight, formatWeight, leaderboard } from '../lib/scoring'

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
            className={`rounded-3xl border-4 border-white p-4 shadow-[0_5px_0_0_rgba(74,59,82,0.07)] ${
              i === 0 ? 'bg-sunny/40' : 'bg-white/70'
            }`}
          >
            <div className="flex flex-wrap items-center gap-x-3">
              <span className="w-9 shrink-0 text-center font-display text-2xl font-extrabold text-ink/50">
                {MEDALS[i] ?? i + 1}
              </span>
              <span className="font-display text-xl font-bold">{p.author}</span>
              <span className="ml-auto font-display text-2xl font-extrabold tabular-nums text-blush-deep">
                {p.score} pts
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 pl-12">
              <Chip label={p.firstName} exact={p.nameOk} gap={p.nameOk ? null : 'raté'} />
              <Chip
                label={formatDate(p.birthDate)}
                exact={p.daysDiff === 0}
                gap={p.daysDiff === 0 ? null : `${p.daysDiff} j`}
              />
              <Chip
                label={formatWeight(p.weightG)}
                exact={p.weightDiffG === 0}
                gap={p.weightDiffG === 0 ? null : `${p.weightDiffG} g`}
              />
              <Chip
                label={formatHeight(p.heightCm)}
                exact={p.heightDiffCm === 0}
                gap={p.heightDiffCm === 0 ? null : `${p.heightDiffCm.toString().replace('.', ',')} cm`}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** `gap` = écart avec le résultat réel, null si le pronostic est exact. */
function Chip({ label, exact, gap }: { label: string; exact: boolean; gap: string | null }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${
        exact ? 'bg-mint/60 text-ink' : 'bg-white/70 text-ink/60'
      }`}
    >
      {label} {exact ? '✅' : <span className="text-ink/40">−{gap}</span>}
    </span>
  )
}
