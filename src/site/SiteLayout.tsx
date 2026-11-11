import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon } from '../components/icons'
import { site, telHref, waHref } from './content'
import { usePublic } from './usePublic'
import logoUrl from '../assets/logo-sonaltech.png'

const nav = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/services', label: 'Services' },
  { to: '/realisations', label: 'Réalisations' },
  { to: '/contact', label: 'Contact' },
]

export default function SiteLayout() {
  const { company } = usePublic()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="hidden bg-ink text-[13px] text-white/75 md:block">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-1.5">
          <span className="mr-auto flex items-center gap-1.5"><Icon name="pin" size={14} /> {site.area}</span>
          <a href={telHref(company.phone)} className="flex items-center gap-1.5 hover:text-white"><Icon name="phone" size={14} /> {company.phone}</a>
          <a href={waHref()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white"><Icon name="whatsapp" size={14} /> WhatsApp</a>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" aria-label="Accueil"><img src={logoUrl} alt={company.name} className="h-11 w-auto sm:h-12" /></Link>
          <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `rounded px-3 py-2 text-[15px] font-semibold transition ${isActive ? 'text-flash' : 'text-ink/75 hover:text-ink'}`}>{n.label}</NavLink>
            ))}
            <Link to="/devis" className="ml-2 flex items-center gap-2 rounded-md bg-flash px-4 py-2.5 font-bold text-white transition hover:brightness-110">Devis gratuit <Icon name="arrow" size={16} /></Link>
          </nav>
          <button type="button" className="rounded-md p-2 md:hidden" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}><Icon name={open ? 'x' : 'menu'} size={26} /></button>
        </div>
        {open && (
          <nav className="border-t border-line px-4 pb-5 pt-2 md:hidden">
            {nav.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `block border-b border-line/60 py-3 text-lg font-semibold ${isActive ? 'text-flash' : ''}`}>{n.label}</NavLink>)}
            <Link to="/devis" className="mt-4 flex justify-center rounded-md bg-flash px-4 py-3 font-bold text-white">Demander un devis gratuit</Link>
          </nav>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="bg-ink text-white/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="inline-block rounded-lg bg-white p-2"><img src={logoUrl} alt={company.name} className="h-10 w-auto" /></div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">Électricité générale : installation, rénovation, mise aux normes, tableaux et dépannage. {site.area}.</p>
          </div>
          <div>
            <p className="font-display text-lg font-bold uppercase tracking-wide text-white">Le site</p>
            <ul className="mt-4 space-y-2 text-sm">
              {nav.map((n) => <li key={n.to}><Link to={n.to} className="hover:text-white">{n.label}</Link></li>)}
              <li><Link to="/devis" className="hover:text-white">Demande de devis</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-display text-lg font-bold uppercase tracking-wide text-white">Contact</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href={telHref(company.phone)} className="flex gap-2 hover:text-white"><Icon name="phone" size={16} className="mt-0.5 text-flash" />{company.phone}</a></li>
              <li><a href={waHref()} target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-white"><Icon name="whatsapp" size={16} className="mt-0.5 text-flash" />WhatsApp</a></li>
              {company.email && <li><a href={`mailto:${company.email}`} className="flex gap-2 break-all hover:text-white"><Icon name="mail" size={16} className="mt-0.5 text-flash" />{company.email}</a></li>}
              <li className="flex gap-2"><Icon name="pin" size={16} className="mt-0.5 shrink-0 text-flash" />{company.address}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs">
            <p>© {new Date().getFullYear()} {company.name}</p>
            <a href="/admin" className="flex items-center gap-1.5 hover:text-white"><Icon name="key" size={14} /> Espace de gestion</a>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
        <a href={telHref(company.phone)} aria-label={`Appeler le ${company.phone}`} className="grid h-14 w-14 place-items-center rounded-full bg-flash text-white shadow-lg md:hidden"><Icon name="phone" size={24} /></a>
        <a href={waHref()} target="_blank" rel="noopener noreferrer" aria-label="Écrire sur WhatsApp" className="flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 text-white shadow-lg transition hover:bg-[#1ebe5b]">
          <Icon name="whatsapp" size={26} /><span className="hidden pr-1 font-semibold md:inline">WhatsApp</span>
        </a>
      </div>
    </div>
  )
}

/** Bandeau de titre des pages intérieures */
export function PageHero({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-flash/25 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-flash">{kicker}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.05] sm:text-6xl">{title}</h1>
        {text && <p className="mt-5 max-w-2xl text-lg text-white/75">{text}</p>}
      </div>
    </section>
  )
}

/** Appel à l'action en bas de page */
export function CtaBand() {
  const { company } = usePublic()
  return (
    <section className="bg-flash text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-12">
        <div><p className="text-3xl font-bold sm:text-4xl">Un projet, une panne ?</p><p className="mt-1 text-lg text-white/85">Le devis est gratuit et sans engagement.</p></div>
        <div className="flex flex-wrap gap-3">
          <Link to="/devis" className="flex items-center gap-2 rounded-md bg-white px-6 py-3.5 font-bold text-flash hover:bg-white/90">Demander un devis <Icon name="arrow" size={18} /></Link>
          <a href={telHref(company.phone)} className="flex items-center gap-2 rounded-md border-2 border-white px-6 py-3 font-bold hover:bg-white hover:text-flash"><Icon name="phone" size={18} /> {company.phone}</a>
        </div>
      </div>
    </section>
  )
}
