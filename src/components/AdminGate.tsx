import { useState, type ReactNode } from 'react'
import { Icon } from './icons'
import { isFileVersion, isLoggedIn, login } from '../lib/sync'
import logoUrl from '../assets/logo-sonaltech.png'

/**
 * Version en ligne : l'espace admin demande le mot de passe de l'entreprise (une fois par appareil).
 * Version fichier (clé USB) : accès direct, la connexion au site reste facultative.
 */
export default function AdminGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(() => isFileVersion() || isLoggedIn())
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (ok) return <>{children}</>
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <form className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl" onSubmit={async (e) => {
        e.preventDefault(); setError(''); setBusy(true)
        try { await login(password); setOk(true) } catch (err) {
          setError((err as Error).message === 'Failed to fetch' ? 'Pas de connexion internet : la première connexion en a besoin.' : (err as Error).message)
        } finally { setBusy(false) }
      }}>
        <img src={logoUrl} alt="Sonaltech Électrique" className="mx-auto w-full max-w-[280px]" />
        <h1 className="mt-6 text-center text-2xl font-bold">Espace de gestion</h1>
        <p className="mt-1 text-center text-sm text-ink/60">Réservé à l'entreprise</p>
        <label className="mt-6 block"><span className="label">Mot de passe</span>
          <input className="input" type="password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="mt-3 rounded-md bg-[#fbe7e6] p-3 text-sm text-[#8e1f19]">{error}</p>}
        <button className="btn-primary mt-5 w-full" disabled={busy}><Icon name="key" size={16} /> {busy ? 'Connexion…' : 'Se connecter'}</button>
        <a href="/" className="mt-4 block text-center text-sm text-ink/60 hover:text-ink">← Retour au site</a>
      </form>
    </div>
  )
}
