import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, remove, type Realisation } from '../lib/db'
import { photoUrl, uploadPhoto } from '../lib/photos'
import { dateFr, todayIso } from '../lib/format'
import { Badge, Empty, Field, Modal, PageHeader, confirmDelete } from '../components/ui'
import { Icon } from '../components/icons'

/** Réalisations affichées sur le site public (photos de chantiers). */
export default function RealisationsAdmin() {
  const list = useLiveQuery(() => db.realisations.orderBy('date').reverse().toArray(), [])
  const [edit, setEdit] = useState<Realisation | null>(null)
  return (
    <>
      <PageHeader title="Réalisations" subtitle="Vos chantiers en photos, affichés sur le site public. Une réalisation apparaît sur le site quand elle est publiée."
        actions={<button className="btn-volt" onClick={() => setEdit({ title: '', city: '', date: todayIso(), description: '', photos: [], published: true })}><Icon name="plus" size={16} /> Nouvelle réalisation</button>} />
      {list && list.length === 0 ? <Empty icon="image" title="Aucune réalisation" text="Ajoutez vos plus beaux chantiers avec quelques photos : ils rassurent les nouveaux clients." /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list?.map((r) => (
            <div key={r.id} className="card overflow-hidden">
              {r.photos[0] ? <img src={photoUrl(r.photos[0])} alt="" className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-panel text-ink/40"><Icon name="image" size={30} /></div>}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2"><p className="text-lg font-bold leading-tight">{r.title}</p>{r.published ? <Badge tone="green">Sur le site</Badge> : <Badge>Masquée</Badge>}</div>
                <p className="text-sm text-ink/60">{[r.city, dateFr(r.date)].filter(Boolean).join(' · ')} · {r.photos.length} photo{r.photos.length > 1 ? 's' : ''}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-ghost" onClick={() => setEdit(r)}><Icon name="edit" size={15} /> Modifier</button>
                  <button className="btn-ghost" onClick={() => db.realisations.update(r.id!, { published: !r.published })}>{r.published ? 'Masquer' : 'Publier'}</button>
                  <button className="btn-danger" onClick={async () => { if (confirmDelete(`« ${r.title} »`)) await remove('realisations', [r.id!]) }}><Icon name="trash" size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!edit} title={edit?.id ? 'Modifier la réalisation' : 'Nouvelle réalisation'} onClose={() => setEdit(null)} wide>
        {edit && <RealisationForm r={edit} onDone={() => setEdit(null)} />}
      </Modal>
    </>
  )
}

function RealisationForm({ r, onDone }: { r: Realisation; onDone: () => void }) {
  const [v, setV] = useState<Realisation>(r)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function addPhotos(files: FileList | null) {
    if (!files?.length) return
    setError(''); setBusy(true)
    try {
      const ids: string[] = []
      for (const f of Array.from(files).slice(0, 8 - v.photos.length)) ids.push(await uploadPhoto(f))
      setV((x) => ({ ...x, photos: [...x.photos, ...ids] }))
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={async (e) => { e.preventDefault(); if (!v.photos.length) { setError('Ajoutez au moins une photo.'); return } await db.realisations.put({ ...v, title: v.title.trim() }); onDone() }}>
      <Field label="Titre *" className="sm:col-span-2"><input className="input" required value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder="ex. Rénovation électrique d'une villa" /></Field>
      <Field label="Ville"><input className="input" value={v.city} onChange={(e) => setV({ ...v, city: e.target.value })} placeholder="Béjaïa" /></Field>
      <Field label="Date"><input className="input" type="date" value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} /></Field>
      <Field label="Description" className="sm:col-span-2"><textarea className="input" rows={3} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} /></Field>
      <div className="sm:col-span-2">
        <span className="label">Photos (1 à 8)</span>
        <div className="flex flex-wrap gap-2">
          {v.photos.map((p, i) => (
            <div key={p} className="relative">
              <img src={photoUrl(p)} alt="" className="h-20 w-28 rounded-md object-cover" />
              <button type="button" aria-label="Retirer" onClick={() => setV({ ...v, photos: v.photos.filter((_, k) => k !== i) })} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-white"><Icon name="x" size={14} /></button>
            </div>
          ))}
          {v.photos.length < 8 && (
            <label className={`grid h-20 w-28 cursor-pointer place-items-center rounded-md border-2 border-dashed border-line text-sm text-ink/60 hover:border-ink ${busy ? 'opacity-60' : ''}`}>
              {busy ? 'Envoi…' : <span className="flex flex-col items-center"><Icon name="plus" size={18} /> Ajouter</span>}
              <input type="file" accept="image/*" multiple className="hidden" disabled={busy} onChange={(e) => { void addPhotos(e.target.files); e.target.value = '' }} />
            </label>
          )}
        </div>
        <p className="mt-1 text-xs text-ink/55">Les photos sont réduites automatiquement et envoyées sur le site (internet nécessaire).</p>
      </div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" className="size-4 accent-ink" checked={v.published} onChange={(e) => setV({ ...v, published: e.target.checked })} /> Afficher sur le site</label>
      {error && <p className="rounded-md bg-[#fbe7e6] p-3 text-sm text-[#8e1f19] sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2"><button className="btn-primary" disabled={busy}>Enregistrer</button></div>
    </form>
  )
}
