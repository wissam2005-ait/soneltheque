import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, demandeStatus, remove, type Demande, type DemandeStatus } from '../lib/db'
import { createDoc } from '../lib/docs'
import { Badge, Empty, PageHeader, confirmDelete } from '../components/ui'
import { Icon } from '../components/icons'

const when = (iso: string) => new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })

/** Demandes de devis et messages reçus depuis le site public. */
export default function Demandes() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'open' | 'all'>('open')
  const [open, setOpen] = useState<string | null>(null)
  const list = useLiveQuery(() => db.demandes.orderBy('createdAt').reverse().toArray(), [])
  const shown = (list ?? []).filter((d) => filter === 'all' || d.status === 'nouvelle' || d.status === 'en_cours')

  async function toQuote(d: Demande) {
    // Le demandeur devient client (s'il n'existe pas déjà), puis un devis est préparé
    const existing = await db.clients.filter((c) => c.name.toLowerCase() === d.name.toLowerCase()).first()
    const clientId = existing?.id ?? await db.clients.add({ name: d.name, address: d.address, activity: '', rc: '', art: '', nif: '', phone: d.phone })
    await db.demandes.update(d.id, { status: 'en_cours' })
    navigate(`/documents/devis/${await createDoc('devis', { clientId, object: d.workType || 'Travaux d’électricité' })}`)
  }

  return (
    <>
      <PageHeader title="Demandes reçues" subtitle="Demandes de devis et messages envoyés depuis le site. Elles arrivent automatiquement quand vous êtes connecté au site." />
      <div className="mb-4 flex gap-2">
        {([['open', 'À traiter'], ['all', 'Toutes']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-full border px-3.5 py-1.5 text-sm ${filter === k ? 'border-ink bg-ink text-white' : 'border-line bg-white'}`}>{l}</button>
        ))}
      </div>
      {list && shown.length === 0 ? <Empty icon="inbox" title="Aucune demande à traiter" text="Les demandes de devis faites sur le site apparaîtront ici." /> : (
        <div className="space-y-3">
          {shown.map((d) => (
            <div key={d.id} className="card">
              <button className="flex w-full flex-wrap items-center gap-3 p-4 text-left" onClick={() => setOpen(open === d.id ? null : d.id)}>
                <Badge tone={demandeStatus[d.status][1]}>{demandeStatus[d.status][0]}</Badge>
                <span className="font-bold">{d.name}</span>
                <span className="text-sm text-ink/60">{d.kind === 'devis' ? `Devis${d.workType ? ` · ${d.workType}` : ''}` : 'Message'}</span>
                <span className="ml-auto text-sm text-ink/50">{when(d.createdAt)}</span>
              </button>
              {open === d.id && (
                <div className="grid gap-4 border-t border-line p-4 md:grid-cols-[1fr_260px]">
                  <div className="space-y-2 text-sm">
                    {d.phone && <p><strong>Téléphone :</strong> <a className="text-navy underline" href={`tel:${d.phone.replace(/[^\d+]/g, '')}`}>{d.phone}</a></p>}
                    {d.email && <p><strong>E-mail :</strong> <a className="text-navy underline" href={`mailto:${d.email}`}>{d.email}</a></p>}
                    {d.address && <p><strong>Adresse du chantier :</strong> {d.address}</p>}
                    <p className="whitespace-pre-wrap rounded-lg bg-panel p-3">{d.message}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block"><span className="label">État</span>
                      <select className="input" value={d.status} onChange={(e) => db.demandes.update(d.id, { status: e.target.value as DemandeStatus })}>
                        {Object.entries(demandeStatus).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                      </select></label>
                    <button className="btn-volt w-full" onClick={() => toQuote(d)}><Icon name="edit" size={16} /> Faire un devis</button>
                    <button className="btn-danger w-full" onClick={async () => { if (confirmDelete('cette demande')) await remove('demandes', [d.id]) }}><Icon name="trash" size={16} /> Supprimer</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
