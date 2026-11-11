import { getServer, getToken } from './sync'

/** Adresse publique d'une photo de réalisation. */
export const photoUrl = (id: string) => `${getServer()}/api/photo?id=${encodeURIComponent(id)}`

/** Réduit une photo (téléphone) à 1600 px de large au maximum, en JPEG : ~200 à 400 Ko. */
export async function compressPhoto(file: File): Promise<string> {
  const img = await createImageBitmap(file).catch(() => null)
  if (!img) throw new Error('Image illisible (JPEG, PNG ou WebP).')
  const scale = Math.min(1, 1600 / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.82).split(',')[1]
}

/** Envoie la photo sur le site et renvoie son identifiant. Nécessite internet et la connexion au site. */
export async function uploadPhoto(file: File): Promise<string> {
  const token = getToken()
  if (!token) throw new Error('Connectez-vous au site pour envoyer des photos.')
  if (!navigator.onLine) throw new Error('Internet est nécessaire pour envoyer des photos.')
  const data = await compressPhoto(file)
  const id = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  const res = await fetch(`${getServer()}/api/photo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id, mime: 'image/jpeg', data }),
  })
  if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? `Erreur ${res.status}`)
  return id
}
