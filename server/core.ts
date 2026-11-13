/**
 * Serveur de synchronisation Sonaltech (indépendant de l'hébergeur : testé localement, exécuté sur Netlify).
 *
 * Règles :
 * - Chaque enregistrement porte `updatedAt` (heure de l'appareil) : le plus récent gagne.
 * - Rien n'est jamais effacé sur le serveur : une suppression = `deleted: true` (restaurable).
 * - `_srv` = heure du serveur à la réception ; un appareil récupère ce qui a changé depuis sa dernière visite.
 * - Une copie complète des données est gardée chaque jour (historique).
 */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export const TABLES = ['clients', 'chantiers', 'articles', 'docs', 'employees', 'pointages', 'frais', 'settings', 'realisations', 'demandes'] as const
export type TableName = (typeof TABLES)[number]
export type Rec = { id: string | number; updatedAt: number; deleted?: boolean; _srv?: number; [k: string]: unknown }
type TableData = Record<string, Rec>

export interface Store {
  get(key: string): Promise<{ data: TableData; etag?: string } | null>
  /** Écrit seulement si la version n'a pas changé (etag) ; false = quelqu'un a écrit entre-temps. */
  setIfUnchanged(key: string, data: TableData, etag?: string): Promise<boolean>
  put(key: string, data: unknown): Promise<void>
}

const MAX_RECORDS_PER_PUSH = 5000

export function tokenFor(password: string) {
  return createHmac('sha256', password).update('sonaltech-gestion').digest('hex')
}
function sameText(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/* Mot de passe : APP_PASSWORD au départ, puis celui choisi dans l'application (enregistré haché dans la base). */
const PASSWORD_KEY = 'auth/password'
type StoredPassword = { salt: string; hash: string }
const hashPassword = (pw: string, salt: string) => scryptSync(pw, salt, 32).toString('hex')
async function storedPassword(store: Store): Promise<StoredPassword | null> {
  const cur = (await store.get(PASSWORD_KEY)) as { data?: unknown } | null
  const d = cur?.data as Partial<StoredPassword> | undefined
  return d && typeof d.salt === 'string' && typeof d.hash === 'string' ? { salt: d.salt, hash: d.hash } : null
}
async function passwordOk(store: Store, envPassword: string, candidate: string) {
  const st = await storedPassword(store)
  return st ? sameText(hashPassword(candidate, st.salt), st.hash) : sameText(candidate, envPassword)
}
/** Le jeton change quand le mot de passe change : les autres appareils doivent se reconnecter. */
async function currentToken(store: Store, envPassword: string) {
  const st = await storedPassword(store)
  return tokenFor(st ? st.hash : envPassword)
}

const json = (status: number, body: unknown) => new Response(status === 204 ? null : JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    // La version « fichier » (clé USB, origine null) peut aussi se synchroniser
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  },
})

/** Fusion d'une table : le plus récent gagne, rien n'est supprimé. Renvoie le nombre d'enregistrements modifiés. */
export function mergeInto(table: TableData, incoming: Rec[], now: number) {
  let changed = 0
  for (const r of incoming) {
    if (r == null || (typeof r.id !== 'string' && typeof r.id !== 'number') || typeof r.updatedAt !== 'number') continue
    const key = String(r.id)
    const cur = table[key]
    if (!cur || r.updatedAt > cur.updatedAt) {
      table[key] = { ...r, _srv: now }
      changed++
    }
  }
  return changed
}

const MAX_PHOTO_BYTES = 1_500_000
// eslint-disable-next-line no-control-regex
const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max)

/** Écriture d'enregistrements dans une table, protégée contre les écritures simultanées. */
async function upsert(store: Store, t: TableName, recs: Rec[]) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const cur = await store.get(`t/${t}`)
    const data: TableData = cur?.data ?? {}
    mergeInto(data, recs, Date.now())
    if (await store.setIfUnchanged(`t/${t}`, data, cur?.etag)) return true
  }
  return false
}

/** Site public : coordonnées et réalisations publiées (sans connexion). */
async function publicInfo(store: Store) {
  const settings = (await store.get('t/settings'))?.data ?? {}
  const company = (settings.company?.value ?? {}) as Record<string, string>
  const reals = Object.values((await store.get('t/realisations'))?.data ?? {})
    .filter((r) => !r.deleted && r.published && Array.isArray(r.photos) && (r.photos as unknown[]).length)
    .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))
    .map((r) => ({ id: r.id, title: r.title, city: r.city, date: r.date, description: r.description, photos: r.photos }))
  return {
    company: { name: company.name, phone: company.phone, email: company.email, address: company.address },
    realisations: reals,
  }
}

export async function handle(req: Request, store: Store, password: string | undefined): Promise<Response> {
  if (req.method === 'OPTIONS') return json(204, null)
  const url = new URL(req.url)
  const path = url.pathname

  // ---- Routes publiques (site client) ----
  if (path.endsWith('/api/public') && req.method === 'GET') {
    const r = json(200, await publicInfo(store))
    r.headers.set('Cache-Control', 'public, max-age=60')
    return r
  }
  if (path.endsWith('/api/photo') && req.method === 'GET') {
    const id = url.searchParams.get('id') ?? ''
    if (!/^[a-z0-9-]{8,80}$/i.test(id)) return json(404, { error: 'Introuvable.' })
    const p = (await store.get(`photo/${id}`))?.data as unknown as { mime?: string; data?: string } | undefined
    if (!p?.data) return json(404, { error: 'Introuvable.' })
    return new Response(Buffer.from(p.data, 'base64'), {
      status: 200,
      headers: { 'Content-Type': p.mime ?? 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable', 'Access-Control-Allow-Origin': '*' },
    })
  }
  if (path.endsWith('/api/demande') && req.method === 'POST') {
    const b = (await req.json().catch(() => null)) as Record<string, unknown> | null
    if (!b) return json(400, { error: 'Requête invalide.' })
    if (b.website) return json(200, { ok: true })   // champ piège : robot
    const name = clean(b.name, 120), phone = clean(b.phone, 40), email = clean(b.email, 160), message = clean(b.message, 4000)
    if (!name || !message || (!phone && !email)) return json(400, { error: 'Indiquez votre nom, un téléphone ou un e-mail, et votre message.' })
    const now = Date.now()
    const rec: Rec = {
      id: `d-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`, updatedAt: now, createdAt: new Date(now).toISOString(),
      kind: b.kind === 'contact' ? 'contact' : 'devis', status: 'nouvelle',
      name, phone, email, message, workType: clean(b.workType, 120), address: clean(b.address, 300),
    }
    if (!(await upsert(store, 'demandes', [rec]))) return json(409, { error: 'Serveur occupé, réessayez.' })
    return json(200, { ok: true })
  }

  if (!password) return json(503, { error: 'Synchronisation non configurée : définissez APP_PASSWORD.' })

  if (path.endsWith('/api/login') && req.method === 'POST') {
    const body = (await req.json().catch(() => ({}))) as { password?: string }
    if (!body.password || !(await passwordOk(store, password, body.password))) return json(401, { error: 'Mot de passe incorrect.' })
    return json(200, { token: await currentToken(store, password) })
  }

  const authed = sameText(req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '', await currentToken(store, password))

  if (path.endsWith('/api/password') && req.method === 'POST') {
    if (!authed) return json(401, { error: 'Session expirée : reconnectez-vous.' })
    const body = (await req.json().catch(() => ({}))) as { current?: string; next?: string }
    if (!body.current || !(await passwordOk(store, password, body.current))) return json(401, { error: 'Mot de passe actuel incorrect.' })
    if (typeof body.next !== 'string' || body.next.length < 8) return json(400, { error: 'Le nouveau mot de passe doit faire au moins 8 caractères.' })
    const salt = randomBytes(16).toString('hex')
    await store.put(PASSWORD_KEY, { salt, hash: hashPassword(body.next, salt) })
    return json(200, { token: await currentToken(store, password) })
  }

  // ---- Envoi d'une photo de réalisation (admin) ----
  if (path.endsWith('/api/photo') && req.method === 'POST') {
    if (!authed) return json(401, { error: 'Session expirée : reconnectez-vous.' })
    const b = (await req.json().catch(() => null)) as { id?: string; mime?: string; data?: string } | null
    if (!b?.id || !/^[a-z0-9-]{8,80}$/i.test(b.id) || !b.data) return json(400, { error: 'Photo invalide.' })
    if (!/^image\/(jpeg|png|webp)$/.test(b.mime ?? '')) return json(400, { error: 'Format accepté : JPEG, PNG ou WebP.' })
    if (b.data.length * 0.75 > MAX_PHOTO_BYTES) return json(413, { error: 'Photo trop lourde (1,5 Mo maximum).' })
    await store.put(`photo/${b.id}`, { mime: b.mime, data: b.data })
    return json(200, { ok: true })
  }

  if (path.endsWith('/api/sync') && req.method === 'POST') {
    if (!authed) return json(401, { error: 'Session expirée : reconnectez-vous.' })
    const body = (await req.json().catch(() => null)) as { since?: number; changes?: Partial<Record<TableName, Rec[]>> } | null
    if (!body) return json(400, { error: 'Requête invalide.' })
    const since = typeof body.since === 'number' ? body.since : 0
    const total = Object.values(body.changes ?? {}).reduce((s, l) => s + (l?.length ?? 0), 0)
    if (total > MAX_RECORDS_PER_PUSH) return json(413, { error: 'Trop de modifications en une fois.' })

    const now = Date.now()
    const out: Partial<Record<TableName, Rec[]>> = {}
    const snapshot: Partial<Record<TableName, TableData>> = {}
    for (const t of TABLES) {
      const incoming = (body.changes?.[t] ?? []) as Rec[]
      let data: TableData = {}
      for (let attempt = 0; attempt < 6; attempt++) {
        const cur = await store.get(`t/${t}`)
        data = cur?.data ?? {}
        if (!incoming.length) break
        if (!mergeInto(data, incoming, now)) break
        if (await store.setIfUnchanged(`t/${t}`, data, cur?.etag)) break
        if (attempt === 5) return json(409, { error: 'Serveur occupé, réessayez.' })
      }
      snapshot[t] = data
      out[t] = Object.values(data).filter((r) => (r._srv ?? 0) > since)
    }
    if (total > 0) await store.put(`backup/${new Date(now).toISOString().slice(0, 10)}`, snapshot)
    return json(200, { now, changes: out })
  }

  return json(404, { error: 'Introuvable.' })
}
