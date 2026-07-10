import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Routes are prerendered to static HTML for crawlers and first paint
// (scripts/prerender.mjs). We deliberately client-render over that markup
// instead of hydrating: production React reported mismatches on subroutes
// (#418) and its recovery path is a client re-render anyway — doing it
// unconditionally is byte-identical markup swapped in with zero errors.
const container = document.getElementById('root')!
createRoot(container).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
