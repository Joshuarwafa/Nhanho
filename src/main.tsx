import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'

const missingEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter(
  (key) => !import.meta.env[key]
)

const root = createRoot(document.getElementById('root')!)

if (missingEnvVars.length > 0) {
  // Checked here, before importing App (and therefore before anything that touches the
  // Supabase client), so a missing env var always produces a visible message instead of
  // a silent blank screen.
  root.render(
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '80px auto', padding: '0 24px', color: '#0B2447' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Configuration error</h1>
      <p style={{ marginTop: 12, lineHeight: 1.6 }}>
        This deployment is missing required environment variable{missingEnvVars.length > 1 ? 's' : ''}:{' '}
        <strong>{missingEnvVars.join(', ')}</strong>.
      </p>
      <p style={{ marginTop: 12, lineHeight: 1.6 }}>
        Set {missingEnvVars.length > 1 ? 'these' : 'it'} in your hosting provider's project settings (e.g. Vercel →
        Project → Settings → Environment Variables), then redeploy.
      </p>
    </div>
  )
} else {
  import('./App.tsx').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>,
    )
  })
}
