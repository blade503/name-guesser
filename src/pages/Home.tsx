import { useEffect, useState } from 'react'
import { config } from '../config'
import { api, type Prediction, type Result } from '../lib/api'
import Sky from '../components/Sky'
import Countdown from '../components/Countdown'
import PredictionForm from '../components/PredictionForm'
import PredictionList from '../components/PredictionList'
import Leaderboard from '../components/Leaderboard'
import ResultBanner from '../components/ResultBanner'

export default function Home() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(() => localStorage.getItem('pronostic-id') !== null)

  useEffect(() => {
    Promise.all([api.listPredictions(), api.getResult()])
      .then(([p, r]) => {
        setPredictions(p)
        setResult(r)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleCreated(p: Prediction) {
    setPredictions((prev) => [p, ...prev])
    setHasVoted(true)
  }

  return (
    <>
      <Sky />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <header className="mb-10 text-center">
          <span className="inline-block animate-wiggle text-7xl">👶</span>
          <h1 className="mt-3 font-display text-5xl font-extrabold text-blush-deep drop-shadow-sm sm:text-6xl">
            {config.title}
          </h1>
          <p className="mt-3 font-display text-xl text-ink/70">{config.tagline}</p>
        </header>

        <section className="card mb-8">
          {result ? (
            <p className="text-center font-display text-2xl font-bold text-mint">
              Le suspense est terminé 🎊
            </p>
          ) : (
            <Countdown dueDate={config.dueDate} />
          )}
        </section>

        {result && (
          <div className="mb-8">
            <ResultBanner result={result} />
          </div>
        )}

        {loading && <p className="text-center font-display text-lg text-ink/60">Chargement… 🎈</p>}

        {error && (
          <p role="alert" className="card text-center font-semibold text-blush-deep">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {!result && !hasVoted && <PredictionForm onCreated={handleCreated} />}

            {!result && hasVoted && (
              <p className="card text-center font-display text-xl font-semibold text-mint">
                Ton pronostic est enregistré, merci ! 💛
              </p>
            )}

            <section className="card">
              {result ? (
                <Leaderboard predictions={predictions} result={result} />
              ) : (
                <PredictionList predictions={predictions} />
              )}
            </section>
          </div>
        )}

        <footer className="mt-12 text-center font-display text-sm text-ink/40">
          <p>Fait avec 💛 pour {config.parents}</p>
          <p className="mt-1">{config.credit} 😎</p>
        </footer>
      </main>
    </>
  )
}
