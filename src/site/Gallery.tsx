import { useEffect, useState } from 'react'
import { Icon } from '../components/icons'
import { photoSrc, usePublic, type PublicRealisation } from './usePublic'

/** Grille des réalisations publiées + visionneuse photo */
export default function Gallery({ limit }: { limit?: number }) {
  const { realisations } = usePublic()
  const [view, setView] = useState<{ r: PublicRealisation; i: number } | null>(null)

  useEffect(() => {
    if (!view) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setView(null)
      if (e.key === 'ArrowRight') setView((v) => v && { ...v, i: (v.i + 1) % v.r.photos.length })
      if (e.key === 'ArrowLeft') setView((v) => v && { ...v, i: (v.i - 1 + v.r.photos.length) % v.r.photos.length })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view])

  if (realisations === null) return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-panel" />)}</div>
  const list = limit ? realisations.slice(0, limit) : realisations
  if (!list.length) return (
    <div className="rounded-lg border border-dashed border-line bg-panel/50 p-10 text-center text-ink/60">
      <Icon name="image" size={32} className="mx-auto mb-3 text-ink/40" />
      Les photos de nos chantiers seront bientôt publiées ici.
    </div>
  )

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <button key={r.id} type="button" onClick={() => setView({ r, i: 0 })} className="group overflow-hidden rounded-lg border border-line bg-white text-left shadow-sm transition hover:shadow-lg">
            <div className="relative aspect-[4/3] overflow-hidden bg-panel">
              <img src={photoSrc(r.photos[0])} alt={r.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              {r.photos.length > 1 && <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white"><Icon name="image" size={12} /> {r.photos.length}</span>}
            </div>
            <div className="p-4">
              <p className="text-lg font-bold leading-snug text-ink">{r.title}</p>
              {r.city && <p className="mt-1 flex items-center gap-1 text-sm text-ink/60"><Icon name="pin" size={13} /> {r.city}</p>}
              {r.description && <p className="mt-2 line-clamp-2 text-sm text-ink/70">{r.description}</p>}
            </div>
          </button>
        ))}
      </div>

      {view && (
        <div role="dialog" aria-modal="true" aria-label={view.r.title} className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4" onClick={() => setView(null)}>
          <div className="flex items-center justify-between gap-4 text-white">
            <p className="font-semibold">{view.r.title}{view.r.city ? ` — ${view.r.city}` : ''} <span className="text-white/60">({view.i + 1}/{view.r.photos.length})</span></p>
            <button type="button" aria-label="Fermer" className="rounded p-2 hover:bg-white/10" onClick={() => setView(null)}><Icon name="x" size={26} /></button>
          </div>
          <div className="relative flex flex-1 items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={photoSrc(view.r.photos[view.i])} alt={view.r.title} className="max-h-[80vh] max-w-full rounded object-contain" />
            {view.r.photos.length > 1 && (<>
              <button type="button" aria-label="Photo précédente" className="absolute left-0 rounded-full bg-white/15 p-3 text-white hover:bg-white/25" onClick={() => setView({ ...view, i: (view.i - 1 + view.r.photos.length) % view.r.photos.length })}><Icon name="back" size={24} /></button>
              <button type="button" aria-label="Photo suivante" className="absolute right-0 rounded-full bg-white/15 p-3 text-white hover:bg-white/25" onClick={() => setView({ ...view, i: (view.i + 1) % view.r.photos.length })}><Icon name="next" size={24} /></button>
            </>)}
          </div>
          {view.r.description && <p className="mx-auto max-w-3xl pt-3 text-center text-sm text-white/80" onClick={(e) => e.stopPropagation()}>{view.r.description}</p>}
        </div>
      )}
    </>
  )
}
