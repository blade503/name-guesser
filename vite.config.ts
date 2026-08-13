import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base = sous-chemin GitHub Pages (https://<user>.github.io/<repo>/).
// Surchargé par VITE_BASE en CI ; '/' en local.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? (process.env.VITE_BASE ?? '/pronostics-bebe/') : '/',
  plugins: [react(), tailwindcss()],
}))
