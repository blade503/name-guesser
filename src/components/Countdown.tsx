import { useEffect, useState } from 'react'

type Parts = { days: number; hours: number; minutes: number; seconds: number }

function remaining(target: number): Parts | null {
  const ms = target - Date.now()
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

export default function Countdown({ dueDate }: { dueDate: string }) {
  const target = new Date(dueDate).getTime()
  const [parts, setParts] = useState(() => remaining(target))

  useEffect(() => {
    const id = setInterval(() => setParts(remaining(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!parts) {
    return (
      <p className="text-center font-display text-2xl font-bold text-blush-deep">
        C’est pour aujourd’hui ou demain… 👶✨
      </p>
    )
  }

  return (
    <div>
      <p className="mb-4 text-center font-display text-lg text-ink/70">
        Réponse dans&nbsp;:
      </p>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        <Unit value={parts.days} label={parts.days > 1 ? 'jours' : 'jour'} color="bg-blush" />
        <Unit value={parts.hours} label="heures" color="bg-sky-deep" />
        <Unit value={parts.minutes} label="minutes" color="bg-mint" />
        <Unit value={parts.seconds} label="secondes" color="bg-lavender" />
      </div>
    </div>
  )
}

function Unit({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div
      className={`${color} flex min-w-[4.5rem] flex-col items-center rounded-3xl border-4 border-white px-3 py-3 shadow-[0_5px_0_0_rgba(74,59,82,0.12)] sm:min-w-[5.5rem]`}
    >
      <span className="font-display text-3xl font-extrabold tabular-nums text-white drop-shadow-sm sm:text-4xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="font-display text-xs font-semibold uppercase tracking-wide text-white/90">{label}</span>
    </div>
  )
}
