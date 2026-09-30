'use client'

import { useEffect, useState } from 'react'
import { asset, uid } from './utils'

// Imagens enviadas pelos usuários (capas, páginas, avatares) ficam no IndexedDB.
// No estado guardamos só a referência "idb:<chave>".

const DB_NAME = 'manna-media'
const STORE = 'files'
const PREFIX = 'idb:'

let dbPromise = null
function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

async function tx(mode, fn) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const result = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(result?.result ?? result)
    t.onerror = () => reject(t.error)
  })
}

export const isStoredMedia = (src) => typeof src === 'string' && src.startsWith(PREFIX)

export async function putMedia(blob) {
  const key = uid('m')
  await tx('readwrite', (s) => s.put(blob, key))
  return PREFIX + key
}

export async function deleteMedia(ref) {
  if (!isStoredMedia(ref)) return
  urlCache.delete(ref)
  await tx('readwrite', (s) => s.delete(ref.slice(PREFIX.length)))
}

export async function clearMedia() {
  urlCache.clear()
  await tx('readwrite', (s) => s.clear())
}

const urlCache = new Map()
async function resolveMedia(ref) {
  if (urlCache.has(ref)) return urlCache.get(ref)
  const blob = await tx('readonly', (s) => s.get(ref.slice(PREFIX.length)))
  const url = blob ? URL.createObjectURL(blob) : null
  urlCache.set(ref, url)
  return url
}

/** Converte qualquer referência de imagem numa URL utilizável em <img>. */
export function useMediaSrc(src) {
  const stored = isStoredMedia(src)
  const [url, setUrl] = useState(() => (stored ? urlCache.get(src) ?? null : asset(src)))

  useEffect(() => {
    if (!stored) {
      setUrl(asset(src))
      return
    }
    let alive = true
    resolveMedia(src)
      .then((u) => alive && setUrl(u))
      .catch(() => alive && setUrl(null))
    return () => {
      alive = false
    }
  }, [src, stored])

  return url
}

/**
 * Redimensiona e comprime uma imagem no navegador antes de guardar.
 * Páginas de webtoon são altas, então limitamos só a largura.
 */
export async function compressImage(file, { maxWidth = 1000, quality = 0.85, type = 'image/webp' } = {}) {
  if (!file.type.startsWith('image/')) throw new Error('O arquivo precisa ser uma imagem.')
  if (file.size > 15 * 1024 * 1024) throw new Error('Imagem muito grande (máx. 15 MB).')

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality))
  return blob || file
}

export async function saveImage(file, options) {
  const blob = await compressImage(file, options)
  return putMedia(blob)
}
