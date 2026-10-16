import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
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
    {/*
      react-hot-toast only renders notifications once <Toaster /> is mounted;
      until then every toast.success/error/loading call resolves into nothing.
      The app raises notifications from 25 places (login/signup and the admin
      editors), so without this every failure message was a silent no-op. It
      lives here, beside <App />, so it survives every route change.
    */}
    <Toaster />
  </StrictMode>,
)
