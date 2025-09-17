'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/components/providers/CustomAuthProvider';

// Cache global para evitar múltiplas chamadas
let profileCache = null;
let isCurrentlyFetching = false;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 1000; // 30 segundos

export function useUserProfile() {
    const { user, isLoading: userLoading, getAccessToken } = useUser();
    const [profileData, setProfileData] = useState(profileCache);
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
        if (!force && profileCache) {
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

                // Atualizar cache e estado
                profileCache = data;
                setProfileData(data);
                hasFetchedRef.current = true;
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

    // Função para revalidar dados
    const revalidate = useCallback(() => {
        if (user) {
            console.log('Force revalidating profile data...');
            profileCache = null;
            hasFetchedRef.current = false;
            isCurrentlyFetching = false;
            setIsLoading(true);
            fetchProfile(true); // Força refresh
        }
    }, [user, fetchProfile]);

    // Escutar apenas evento de atualização de avatar (sem focus)
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

        window.addEventListener('avatar-updated', handleAvatarUpdate);

        return () => {
            window.removeEventListener('avatar-updated', handleAvatarUpdate);
        };
    }, []); // Sem dependências para evitar loops

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
