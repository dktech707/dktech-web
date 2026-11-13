import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'

import { App } from './App'
import { syncTempoToCSS } from './lib/motion'

// One authoritative tempo clock: mirror the BPM constants (motion.ts) onto the
// CSS custom properties before first paint so JS and CSS never diverge.
syncTempoToCSS()

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
