import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

/* Sert api/reservation.ts en développement, avec le même contrat que la
   fonction serverless Vercel en production : POST /api/reservation.
   Les variables du .env (RESEND_API_KEY, MAIL_TO, MAIL_FROM) sont injectées
   dans process.env, jamais dans le bundle client. */
function apiPlugin(env: Record<string, string>): Plugin {
  const handler = fileURLToPath(new URL('./api/reservation.ts', import.meta.url))
  return {
    name: 'vitrine-api-dev',
    configureServer(server) {
      for (const key of ['RESEND_API_KEY', 'MAIL_TO', 'MAIL_FROM']) {
        if (!process.env[key] && env[key]) process.env[key] = env[key]
      }
      server.middlewares.use('/api/reservation', async (req, res) => {
        try {
          const mod = await server.ssrLoadModule(handler)
          await mod.default(req, res)
        } catch (err) {
          server.config.logger.error(`[api/reservation] ${String(err)}`)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: 'Erreur interne du serveur de développement.' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    apiPlugin(loadEnv(mode, process.cwd(), '')),
  ],
}))
