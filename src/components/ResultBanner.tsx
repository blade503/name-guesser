import type { Result } from '../lib/api'
import { formatHeight, formatWeight } from '../lib/scoring'

export default function ResultBanner({ result }: { result: Result }) {
  const born = new Date(result.bornAt).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className="card animate-pop bg-gradient-to-b from-blush/40 to-sunny/30 text-center">
      <p className="font-display text-xl font-semibold text-ink/70">Elle est là&nbsp;! 🎉</p>
      <h2 className="my-2 font-display text-5xl font-extrabold text-blush-deep sm:text-6xl">
        {result.firstName}
      </h2>
      <p className="font-display text-lg text-ink/70">née le {born}</p>
      <div className="mt-5 flex justify-center gap-4">
        <Stat label="poids" value={formatWeight(result.weightG)} />
        <Stat label="taille" value={formatHeight(result.heightCm)} />
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border-4 border-white bg-white/80 px-5 py-3">
      <p className="font-display text-2xl font-extrabold text-ink">{value}</p>
      <p className="font-display text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</p>
    </div>
  )
}
