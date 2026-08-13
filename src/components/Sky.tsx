/** Décor de fond : nuages, étoiles, montgolfière. Purement ornemental. */
export default function Sky() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Cloud className="left-[4%] top-[8%] w-40 animate-float text-white/80" />
      <Cloud className="right-[8%] top-[18%] w-28 animate-float text-white/60 [animation-delay:-2s]" />
      <Cloud className="left-[12%] top-[62%] w-32 animate-float text-white/50 [animation-delay:-4s]" />
      <Cloud className="right-[14%] top-[78%] w-24 animate-float text-white/70 [animation-delay:-1s]" />

      <Balloon className="right-[6%] top-[42%] hidden w-20 animate-bob text-blush-deep sm:block" />

      <Star className="left-[28%] top-[26%] w-6 animate-twinkle text-sunny" />
      <Star className="right-[30%] top-[12%] w-4 animate-twinkle text-lavender [animation-delay:-1s]" />
      <Star className="left-[70%] top-[56%] w-5 animate-twinkle text-blush [animation-delay:-2s]" />
      <Star className="left-[8%] top-[38%] w-4 animate-twinkle text-mint [animation-delay:-1.5s]" />
    </div>
  )
}

function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={`absolute ${className}`} fill="currentColor">
      <ellipse cx="35" cy="38" rx="26" ry="20" />
      <ellipse cx="62" cy="28" rx="30" ry="24" />
      <ellipse cx="90" cy="40" rx="24" ry="18" />
      <rect x="30" y="40" width="65" height="18" rx="9" />
    </svg>
  )
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`absolute ${className}`} fill="currentColor">
      <path d="M12 0c1 6.5 5.5 11 12 12-6.5 1-11 5.5-12 12-1-6.5-5.5-11-12-12C6.5 11 11 6.5 12 0Z" />
    </svg>
  )
}

function Balloon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={`absolute ${className}`}>
      <path
        d="M40 4c19 0 32 14 32 32 0 20-19 36-32 48C27 72 8 56 8 36 8 18 21 4 40 4Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M40 4c7 0 11 15 11 34s-4 34-11 46c-7-12-11-27-11-46S33 4 40 4Z" fill="#fff" opacity="0.35" />
      <path d="M33 86h14l-3 12H36l-3-12Z" fill="var(--color-sunny)" />
      <path d="M34 84h12M35 78l4 6M45 78l-4 6" stroke="var(--color-ink)" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  )
}
