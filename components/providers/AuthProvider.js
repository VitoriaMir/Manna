'use client'

import { UserProvider } from '@auth0/nextjs-auth0/client'

export function AuthProvider({ children }) {
  return <UserProvider>{children}</UserProvider>
}