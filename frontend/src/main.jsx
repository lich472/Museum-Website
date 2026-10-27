import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installGoogleTranslateGuard } from './utils/googleTranslateSafety'
import { suppressGoogleTranslateBanner } from './utils/googleTranslateBanner'

// Installed before the first render so React's very first commits are covered.
installGoogleTranslateGuard()

// Removes Google's own top bar; the site supplies the language dropdown.
suppressGoogleTranslateBanner()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
