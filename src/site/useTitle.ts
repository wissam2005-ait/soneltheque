import { useEffect } from 'react'
import { site } from './content'

export function useTitle(page?: string) {
  useEffect(() => { document.title = page ? `${page} — ${site.name}` : `${site.name} — Électricien à Béjaïa et Alger` }, [page])
}
