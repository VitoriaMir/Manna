import { Suspense } from 'react'
import { AuthView } from '@/components/auth/auth-view'

export const metadata = { title: 'Entrar' }

export default function AuthPage() {
  return (
    <Suspense>
      <AuthView />
    </Suspense>
  )
}
