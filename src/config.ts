/**
 * Seul fichier à éditer pour personnaliser le site.
 */
export const config = {
  /** Titre affiché en gros sur la page d'accueil. */
  title: 'Bienvenue petite puce',

  /** Sous-titre / phrase d'accroche. */
  tagline: 'Prénom, poids, taille… à toi de deviner !',

  /** Prénoms des parents, affichés dans le texte d'intro. */
  parents: 'Stéphanie & Julien',

  /** Signature affichée en pied de page. */
  credit: 'par le meilleur tonton du monde',

  /** Date prévue d'accouchement (ISO, heure locale). Sert au compte à rebours. */
  dueDate: '2026-09-15T00:00:00',

  /**
   * URL du Worker Cloudflare qui expose l'API. Publique par nature (elle finit dans
   * le bundle), donc écrite en dur : en dev on vise le Worker local, sinon le déployé.
   * VITE_API_URL reste prioritaire si besoin de pointer ailleurs.
   */
  apiUrl:
    import.meta.env.VITE_API_URL ??
    (import.meta.env.DEV
      ? 'http://localhost:8787'
      : 'https://name-guesser-api.pronostics-bebe.workers.dev'),

  /** Bornes des champs du formulaire (garde-fous de saisie). */
  limits: {
    weightG: { min: 1000, max: 6000, step: 10 },
    heightCm: { min: 30, max: 65, step: 0.5 },
  },
} as const
