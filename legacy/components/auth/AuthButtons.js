'use client'

import { useUser, useAuth } from '@/components/providers/CustomAuthProvider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, BookOpen, Upload } from 'lucide-react'

export function LoginButton({ onLoginClick = () => console.warn('onLoginClick not provided') }) {
  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick()
    }
  }

  return (
    <Button onClick={handleLogin}>
      Entrar
    </Button>
  )
}

export function LogoutButton() {
  const { logout } = useAuth()

  return (
    <Button variant="ghost" onClick={logout}>
      Sair
    </Button>
  )
}

export function UserMenu({ user, onNavigate = () => console.warn('onNavigate not provided') }) {
  const userRoles = user?.roles || []
  const isCreator = userRoles.includes('creator')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center space-x-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            {userRoles.length > 0 && (
              <p className="text-xs text-purple-600">{userRoles.join(', ')}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onNavigate && onNavigate('profile')}>
          <User className="mr-2 h-4 w-4" />
          Perfil
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onNavigate && onNavigate('library')}>
          <BookOpen className="mr-2 h-4 w-4" />
          Minha Biblioteca
        </DropdownMenuItem>

        {isCreator && (
          <DropdownMenuItem onClick={() => onNavigate && onNavigate('creator-dashboard')}>
            <Upload className="mr-2 h-4 w-4" />
            Creator Studio
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AuthStatus({ onNavigate = () => console.warn('onNavigate not provided') }) {
  const { user, error, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    )
  }

  if (error) {
    console.error('Auth error:', error)
    return <LoginButton onLoginClick={() => onNavigate && onNavigate('auth')} />
  }

  return (
    <div className="flex items-center space-x-2">
      {user ? (
        <UserMenu user={user} onNavigate={onNavigate} />
      ) : (
        <LoginButton onLoginClick={() => onNavigate && onNavigate('auth')} />
      )}
    </div>
  )
}