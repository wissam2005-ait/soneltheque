import { useState, type ReactNode } from 'react'
import { Icon } from './icons'
import { isFileVersion, isLoggedIn, login, useSyncStatus } from '../lib/sync'
import logoUrl from '../assets/logo-sonaltech.png'

const features = [
  { icon: 'doc' as const, title: 'Devis, factures, bons pour', text: 'Numérotés automatiquement, en PDF au format de l’entreprise.' },
  { icon: 'building' as const, title: 'Chantiers et attachements', text: 'Quantités du contrat, réalisées et restantes.' },
  { icon: 'inbox' as const, title: 'Demandes du site', text: 'Les demandes de devis des clients arrivent ici.' },
]

/**
 * Version en ligne : l'espace de gestion demande le mot de passe de l'entreprise (une fois par appareil).
 * Version fichier (clé USB) : accès direct, la connexion au site reste facultative.
 */
export default function AdminGate({ children }: { children: ReactNode }) {
  const status = useSyncStatus()
  const [, refresh] = useState(0)
  const ok = isFileVersion() || (isLoggedIn() && status.state !== 'login')
  const changed = status.state === 'login' && status.message === 'Reconnectez-vous.'
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (ok) return <>{children}</>

  return (
    <div className="flex min-h-screen bg-white">
      {/* Panneau de marque (ordinateur) */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }} aria-hidden="true" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-flash/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-flash/15 blur-3xl" aria-hidden="true" />
        <div className="relative inline-flex self-start rounded-xl bg-white px-4 py-3"><img src={logoUrl} alt="Sonaltech Électrique" className="h-10 w-auto" /></div>
        <div className="relative">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-flash">Espace de gestion</p>
          <h2 className="mt-3 max-w-md text-5xl font-bold leading-[1.05]">Toute l’entreprise, au même endroit.</h2>
          <ul className="mt-10 space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white/10 text-flash"><Icon name={f.icon} size={22} /></span>
                <span><span className="block font-bold">{f.title}</span><span className="text-sm text-white/65">{f.text}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-white/50"><Icon name="shield" size={16} /> Accès réservé à l’entreprise · connexion sécurisée</p>
      </aside>

      {/* Formulaire */}
      <main className="flex flex-1 flex-col items-center justify-center bg-panel px-5 py-10 lg:bg-white">
        <div className="w-full max-w-sm">
          <img src={logoUrl} alt="Sonaltech Électrique" className="mx-auto mb-8 w-full max-w-[260px] lg:hidden" />
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-line lg:p-0 lg:shadow-none lg:ring-0">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-flash/10 text-flash"><Icon name="shield" size={28} /></span>
            <h1 className="mt-5 text-3xl font-bold text-ink">Connexion</h1>
            <p className="mt-1 text-ink/60">Entrez le mot de passe de l’entreprise pour accéder à la gestion.</p>
            {changed && <p className="mt-4 rounded-lg bg-[#fff4d6] p-3 text-sm text-[#6b4e00]">Le mot de passe a été changé : reconnectez-vous avec le nouveau.</p>}

            <form className="mt-7" onSubmit={async (e) => {
              e.preventDefault(); setError(''); setBusy(true)
              try { await login(password); setPassword(''); refresh((n) => n + 1) } catch (err) {
                setError((err as Error).message === 'Failed to fetch' ? 'Pas de connexion internet : la première connexion en a besoin.' : (err as Error).message)
                setPassword('')
              } finally { setBusy(false) }
            }}>
              <label htmlFor="pw" className="label">Mot de passe</label>
              <div className="relative mt-1">
                <input id="pw" className={`input pr-12 text-lg ${error ? 'border-[#d33] ring-2 ring-[#d33]/15' : ''}`} type={show ? 'text' : 'password'} required autoFocus
                  autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} placeholder="••••••••••" />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink/45 hover:text-ink"><Icon name={show ? 'eyeOff' : 'eye'} size={20} /></button>
              </div>
              {error && <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-[#fbe7e6] p-3 text-sm text-[#8e1f19]"><Icon name="alert" size={16} className="mt-0.5 shrink-0" />{error}</p>}
              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-flash px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-flash/25 transition hover:brightness-110 disabled:opacity-60" disabled={busy}>
                {busy ? 'Vérification…' : <>Se connecter <Icon name="arrow" size={18} /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-ink/50">Une seule connexion par appareil : vous resterez connecté ensuite, même sans internet.</p>
          </div>
          <a href="/" className="mt-8 flex items-center justify-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink"><Icon name="back" size={16} /> Retour au site</a>
        </div>
      </main>
    </div>
  )
}
