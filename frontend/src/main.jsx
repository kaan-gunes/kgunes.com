import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n' // i18n initialization
import './index.css'
import App from './App.jsx'

// Sayfa yüklendiğinde en başa scroll
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
