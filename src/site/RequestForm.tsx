import { useState, type FormEvent } from 'react'
import { Icon } from '../components/icons'
import { site, telHref, waHref } from './content'
import { usePublic } from './usePublic'

const input = 'mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5 text-ink outline-none transition focus:border-flash focus:ring-2 focus:ring-flash/20'

/** Formulaire de demande de devis / de contact → arrive dans l'admin (Demandes reçues). */
export default function RequestForm({ kind }: { kind: 'devis' | 'contact' }) {
  const { company } = usePublic()
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    if (!f.phone?.trim() && !f.email?.trim()) { setError('Indiquez au moins un téléphone ou un e-mail pour que nous puissions vous répondre.'); setState('error'); return }
    setState('sending'); setError('')
    try {
      const r = await fetch('/api/demande', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, kind }) })
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.error || 'Erreur')
      setState('sent')
    } catch {
      setError("L'envoi n'a pas abouti. Réessayez, ou contactez-nous directement par téléphone ou WhatsApp."); setState('error')
    }
  }

  if (state === 'sent') return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-600 text-white"><Icon name="check" size={30} /></div>
      <p className="mt-4 text-2xl font-bold text-ink">Demande envoyée, merci !</p>
      <p className="mt-2 text-ink/70">Nous vous recontactons rapidement. Pour une urgence, appelez le <a className="font-semibold text-flash" href={telHref(company.phone)}>{company.phone}</a>.</p>
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-line bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-ink">Nom et prénom *<input name="name" required maxLength={120} autoComplete="name" className={input} /></label>
        <label className="block text-sm font-semibold text-ink">Téléphone<input name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="0X XX XX XX XX" className={input} /></label>
        <label className="block text-sm font-semibold text-ink">E-mail<input name="email" type="email" maxLength={160} autoComplete="email" className={input} /></label>
        {kind === 'devis' ? (
          <label className="block text-sm font-semibold text-ink">Type de travaux
            <select name="workType" className={input} defaultValue="">
              <option value="">— Choisir —</option>
              {site.services.map((s) => <option key={s.slug}>{s.title}</option>)}
              <option>Autre</option>
            </select>
          </label>
        ) : <label className="block text-sm font-semibold text-ink">Objet<input name="workType" maxLength={120} className={input} /></label>}
      </div>
      {kind === 'devis' && <label className="block text-sm font-semibold text-ink">Adresse / commune du chantier<input name="address" maxLength={200} className={input} /></label>}
      <label className="block text-sm font-semibold text-ink">{kind === 'devis' ? 'Décrivez votre projet *' : 'Votre message *'}
        <textarea name="message" required rows={5} maxLength={4000} className={input} placeholder={kind === 'devis' ? 'Surface, nombre de pièces, travaux souhaités, délais…' : ''} />
      </label>
      {/* piège à robots : invisible pour les visiteurs */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      {state === 'error' && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={state === 'sending'} className="flex items-center gap-2 rounded-md bg-flash px-6 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-60">
          {state === 'sending' ? 'Envoi…' : kind === 'devis' ? 'Envoyer ma demande de devis' : 'Envoyer le message'} <Icon name="arrow" size={18} />
        </button>
        <a href={waHref()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-[#128C7E] hover:underline"><Icon name="whatsapp" size={18} /> ou écrivez-nous sur WhatsApp</a>
      </div>
      <p className="text-xs text-ink/50">* champs obligatoires. Vos coordonnées servent uniquement à répondre à votre demande.</p>
    </form>
  )
}
