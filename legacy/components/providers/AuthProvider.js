'use client'

import { CustomAuthProvider } from './CustomAuthProvider'

export function AuthProvider({ children }) {
  return <CustomAuthProvider>{children}</CustomAuthProvider>
}