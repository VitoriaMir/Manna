'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/components/providers/CustomAuthProvider';

// Cache global para evitar múltiplas chamadas + persistência no localStorage
let profileCache = null;
let isCurrentlyFetching = false;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 1000; // 30 segundos
const STORAGE_KEY = 'manna_profile_cache';

// Função para salvar cache no localStorage
const saveToStorage = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.log('Error saving profile to localStorage:', error);
    }
};

// Função para carregar cache do localStorage
const loadFromStorage = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const { data, timestamp } = JSON.parse(stored);
            if (Date.now() - timestamp < CACHE_DURATION) {
                profileCache = data;
                cacheTimestamp = timestamp;
                return data;
            }
        }
    } catch (error) {
        console.log('Error loading profile from localStorage:', error);
    }
    return null;
};

export function useUserProfile() {
    const { user, isLoading: userLoading, getAccessToken } = useUser();

    // Tentar carregar do localStorage primeiro
    const [profileData, setProfileData] = useState(() => {
        const stored = loadFromStorage();
        return stored || profileCache;
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const hasFetchedRef = useRef(false);

    // Função para buscar dados do perfil
    const fetchProfile = useCallback(async (force = false) => {
        console.log('fetchProfile called with force:', force);

        if (!user || !getAccessToken) {
            console.log('No user or getAccessToken, skipping fetch');
            return;
        }

        // Evitar múltiplas chamadas simultâneas
        if (isCurrentlyFetching && !force) {
            console.log('Already fetching, skipping...');
            return;
        }

        // Verificar cache apenas se não for force
        if (!force && profileCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            console.log('Using cached data');
            setProfileData(profileCache);
            setIsLoading(false);
            return;
        }

        isCurrentlyFetching = true;

        try {
            setIsLoading(true);
            const token = await getAccessToken();

            if (!token) {
                console.log('No token available');
                setIsLoading(false);
                isCurrentlyFetching = false;
                return;
            }

            const response = await fetch('/api/users/me/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': force ? 'no-cache' : 'default'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Profile data fetched successfully:', data);

                // Atualizar cache e estado com timestamp + localStorage
                profileCache = data;
                cacheTimestamp = Date.now();
                setProfileData(data);
                saveToStorage(data); // Salvar no localStorage
                hasFetchedRef.current = true;

                // Disparar evento para atualizar imagem se background mudou
                if (data.backgroundImage) {
                    window.dispatchEvent(new CustomEvent('background-updated', {
                        detail: { backgroundImage: data.backgroundImage }
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
            isCurrentlyFetching = false;
        }
    }, [user, getAccessToken]);    // Buscar dados quando necessário
    useEffect(() => {
        if (!userLoading && user && !hasFetchedRef.current) {
            fetchProfile();
        } else if (!userLoading && !user) {
            profileCache = null;
            setProfileData(null);
            setIsLoading(false);
            hasFetchedRef.current = false;
        }
    }, [userLoading, user, fetchProfile]);

    // Função para atualizar perfil
    const updateProfile = async (updates) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        setIsUpdating(true);
        try {
            const token = localStorage.getItem('manna_auth_token');
            if (!token || token === 'null' || token === 'undefined') {
                throw new Error('No valid authentication token available');
            }

            const response = await fetch('/api/users/me/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                const updatedData = { ...profileData, ...updates };
                profileCache = updatedData;
                setProfileData(updatedData);
            }

            return result;
        } catch (err) {
            console.error('Error updating profile:', err);
            throw err;
        } finally {
            setIsUpdating(false);
        }
    };

    // Função para adicionar atividade
    const addActivity = async (activityData) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await fetch('/api/users/me/profile/activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activityData),
            });

            const result = await response.json();
            if (result.success && profileData && profileData.recentActivity) {
                const updatedData = {
                    ...profileData,
                    recentActivity: [result.activity, ...(profileData.recentActivity || [])].slice(0, 10)
                };
                profileCache = updatedData;
                setProfileData(updatedData);
            }

            return result;
        } catch (err) {
            console.error('Error adding activity:', err);
            throw err;
        }
    };

    // Função para revalidar dados (preserva cache quando apropriado)
    const revalidate = useCallback((forceRefresh = false) => {
        if (user) {
            console.log('Revalidating profile data...', { forceRefresh });
            if (forceRefresh) {
                profileCache = null;
                hasFetchedRef.current = false;
                isCurrentlyFetching = false;
                setIsLoading(true);
            }
            fetchProfile(forceRefresh); // Só força refresh se explicitamente solicitado
        }
    }, [user, fetchProfile]);

    // Escutar eventos de atualização de avatar e background
    useEffect(() => {
        const handleAvatarUpdate = () => {
            console.log('Avatar update event received, revalidating...');
            // Usar setTimeout para evitar loops
            setTimeout(() => {
                profileCache = null;
                hasFetchedRef.current = false;
                isCurrentlyFetching = false;
                setIsLoading(true);
                fetchProfile(true);
            }, 100);
        };

        const handleBackgroundUpdate = (event) => {
            console.log('Background update event received:', event.detail);
            // Atualizar apenas o background sem recarregar tudo
            if (profileData && event.detail?.imageUrl) {
                const updatedData = { ...profileData, backgroundImage: event.detail.imageUrl };
                profileCache = updatedData;
                setProfileData(updatedData);
            }
        };

        window.addEventListener('avatar-updated', handleAvatarUpdate);
        window.addEventListener('background-updated', handleBackgroundUpdate);

        return () => {
            window.removeEventListener('avatar-updated', handleAvatarUpdate);
            window.removeEventListener('background-updated', handleBackgroundUpdate);
        };
    }, [profileData]); // Adicionar profileData como dependência

    // Funções de utilidade
    const getStatValue = (statKey, defaultValue = 0) => {
        return profileData?.stats?.[statKey] ?? defaultValue;
    };

    const hasAchievement = (achievementId) => {
        return profileData?.achievements?.some(ach => ach.id === achievementId) ?? false;
    };

    const getRecentActivitiesByType = (type, limit = 5) => {
        if (!profileData?.recentActivity) return [];
        return profileData.recentActivity.filter(activity => activity.type === type).slice(0, limit);
    };

    const isCreator = profileData?.roles?.includes('creator') ?? false;
    const isPremium = profileData?.roles?.includes('premium') ?? false;

    return {
        profileData,
        isLoading,
        error,
        isUpdating,
        updateProfile,
        addActivity,
        revalidate,
        getStatValue,
        hasAchievement,
        getRecentActivitiesByType,
        isCreator,
        isPremium,
    };
}
