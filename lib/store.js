'use client'

import { useSyncExternalStore } from 'react'
import { buildSeed, SEED_VERSION } from './seed'

// Estado global do app, persistido no localStorage.
// É a "base de dados" do Manna no modo estático (GitHub Pages).

const STORAGE_KEY = 'manna:state'

// Snapshot usado na renderização estática (build) e na hidratação:
// sempre o catálogo inicial, sem usuário logado.
const serverSnapshot = buildSeed(Date.UTC(2026, 8, 30))

let state = null
const listeners = new Set()

function load() {
  if (typeof window === 'undefined') return serverSnapshot
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.version === SEED_VERSION) return parsed
    }
  } catch {
    // localStorage indisponível ou corrompido: começa do zero.
  }
  const fresh = buildSeed()
  persist(fresh)
  return fresh
}

function persist(next) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return true
  } catch (error) {
    console.warn('[manna] não foi possível salvar o estado', error)
    return false
  }
}

export function getState() {
  if (state === null) state = load()
  return state
}

/** Aplica um updater imutável: setState(s => ({ ...s, foo })) */
export function setState(updater) {
  const prev = getState()
  const next = typeof updater === 'function' ? updater(prev) : updater
  if (next === prev) return prev
  state = next
  persist(next)
  listeners.forEach((l) => l())
  return next
}

export function resetState() {
  state = buildSeed()
  persist(state)
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

if (typeof window !== 'undefined') {
  // Mantém várias abas sincronizadas.
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return
    try {
      state = JSON.parse(event.newValue)
      listeners.forEach((l) => l())
    } catch {
      /* ignora */
    }
  })
}

/** Retorna o estado inteiro (referência estável). Derive dados com useMemo. */
export function useAppState() {
  return useSyncExternalStore(subscribe, getState, () => serverSnapshot)
}

/** true depois da hidratação — útil para evitar piscar conteúdo dependente de sessão. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
