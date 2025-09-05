'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle } from 'lucide-react'

export function RoleGuard({ children, requiredRoles, fallback }) {
  const { user, error, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/api/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Auth error:', error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-600">Erro de Autenticação</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Ocorreu um erro ao verificar sua autenticação.
            </p>
            <Button asChild>
              <a href="/api/auth/login">Tentar Novamente</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para acessar esta página.
            </p>
            <Button asChild>
              <a href="/api/auth/login">Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Extract roles from user object
  const userRoles = user['https://manna-app.com/roles'] || []
  const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))

  if (!hasRequiredRole) {
    if (fallback) {
      return fallback
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <CardTitle>Permissão Negada</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-2">
              Você não tem permissão para acessar esta área.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Roles necessárias: {requiredRoles.join(', ')}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Suas roles: {userRoles.length > 0 ? userRoles.join(', ') : 'Nenhuma'}
            </p>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => window.history.back()}>
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}