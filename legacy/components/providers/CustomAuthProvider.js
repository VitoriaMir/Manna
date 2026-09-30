'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create auth context
const AuthContext = createContext({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    login: async () => { },
    register: async () => { },
    logout: () => { },
    updateUser: () => { }
});

// Custom hook to use auth
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth provider component
export function CustomAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is authenticated on component mount and set up periodic checks
    useEffect(() => {
        checkAuthStatus();

        // Check auth status every 5 minutes to refresh session
        const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('manna_auth_token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            // Try to verify token with backend
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
            } else {
                // Se a verificação falhar, vamos tentar decodificar o token JWT localmente
                // para manter o usuário logado se o token ainda for válido
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const now = Date.now() / 1000;

                    // Se o token não expirou, manter o usuário logado
                    if (payload.exp && payload.exp > now) {
                        setUser({
                            id: payload.userId || payload.sub,
                            email: payload.email,
                            name: payload.name || payload.email?.split('@')[0]
                        });
                    } else {
                        // Token expirado, remover
                        localStorage.removeItem('manna_auth_token');
                    }
                } catch (decodeError) {
                    // Token malformado, remover
                    localStorage.removeItem('manna_auth_token');
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Em caso de erro de rede, não deslogar o usuário
            // Apenas continuar com o estado atual
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token
                localStorage.setItem('manna_auth_token', data.token);
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.message || 'Registration failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = () => {
        localStorage.removeItem('manna_auth_token');
        setUser(null);

        // Call logout endpoint to invalidate token on server
        fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('manna_auth_token')}`
            }
        }).catch(console.error);
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook for compatibility with existing Auth0 code
export const useUser = () => {
    const { user, isLoading } = useAuth();

    // Função para obter token de acesso
    const getAccessToken = () => {
        return Promise.resolve(localStorage.getItem('manna_auth_token'));
    };

    return {
        user: user ? {
            ...user,
            // Map custom auth user to Auth0-like structure for compatibility
            name: user.firstName ? `${user.firstName} ${user.lastName}` : user.username,
            picture: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.username)}&background=f59e0b&color=000`,
            email: user.email,
            'https://manna-app.com/roles': user.roles || ['reader']
        } : null,
        error: null,
        isLoading,
        getAccessToken
    };
};