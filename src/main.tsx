import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/500.css'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow/700.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import './index.css'
import { seedIfEmpty, upgradeCompanyName } from './lib/db'
import { askPersistentStorage } from './lib/backup'
import { startSync } from './lib/sync'
import AdminApp from './AdminApp'
import AdminGate from './components/AdminGate'
import SiteApp from './site/SiteApp'

const root = createRoot(document.getElementById('root')!)
const startAdmin = () => { void askPersistentStorage(); void seedIfEmpty().then(upgradeCompanyName).then(startSync) }

if (import.meta.env.MODE === 'usb') {
  // Version clé USB : uniquement l'espace de gestion, adresses en « # » (fonctionne sans serveur)
  startAdmin()
  root.render(<StrictMode><HashRouter><AdminApp /></HashRouter></StrictMode>)
} else if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) {
  startAdmin()
  root.render(<StrictMode><AdminGate><BrowserRouter basename="/admin"><AdminApp /></BrowserRouter></AdminGate></StrictMode>)
} else {
  root.render(<StrictMode><BrowserRouter><SiteApp /></BrowserRouter></StrictMode>)
}
