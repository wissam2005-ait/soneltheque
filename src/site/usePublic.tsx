import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { site } from './content'

export interface PublicRealisation { id: string | number; title: string; city?: string; date?: string; description?: string; photos: string[] }
interface PublicData { company: { name: string; phone: string; email?: string; address: string }; realisations: PublicRealisation[] | null }

const fallback: PublicData = { company: { name: site.name, phone: site.phone, address: site.address }, realisations: null }
const Ctx = createContext<PublicData>(fallback)

/** Coordonnées (admin → Paramètres) et réalisations publiées, lues sur le site. */
export function PublicProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PublicData>(fallback)
  useEffect(() => {
    fetch('/api/public').then((r) => (r.ok ? r.json() : null)).then((d: { company?: Partial<PublicData['company']>; realisations?: PublicRealisation[] } | null) => {
      setData({
        company: { ...fallback.company, ...Object.fromEntries(Object.entries(d?.company ?? {}).filter(([, v]) => v)) } as PublicData['company'],
        realisations: d?.realisations ?? [],
      })
    }).catch(() => setData((x) => ({ ...x, realisations: [] })))
  }, [])
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>
}
export const usePublic = () => useContext(Ctx)
export const photoSrc = (id: string) => `/api/photo?id=${encodeURIComponent(id)}`
