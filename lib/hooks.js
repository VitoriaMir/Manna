'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAppState, useHydrated } from './store'
import { currentUser } from './api'

export function useCurrentUser() {
  const state = useAppState()
  return useMemo(() => currentUser(state), [state])
}

/** Executa uma ação da API mostrando erros como toast. Retorna [run, pending]. */
export function useAction(action, { success } = {}) {
  const [pending, setPending] = useState(false)
  const run = useCallback(
    async (...args) => {
      setPending(true)
      try {
        const result = await action(...args)
        if (success) toast.success(typeof success === 'function' ? success(result) : success)
        return result === undefined ? true : result
      } catch (error) {
        toast.error(error?.message || 'Algo deu errado.')
        return false
      } finally {
        setPending(false)
      }
    },
    [action, success]
  )
  return [run, pending]
}

export function useDebounced(value, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export { useAppState, useHydrated }
