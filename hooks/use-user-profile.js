'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/components/providers/CustomAuthProvider';

// Cache global para evitar múltiplas chamadas
let profileCache = null;
let isCurrentlyFetching = false;

export function useUserProfile() {
    const { user, isLoading: userLoading } = useUser();
    const [profileData, setProfileData] = useState(profileCache);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const hasFetchedRef = useRef(false);

    // Função para buscar dados do perfil
    const fetchProfile = useCallback(async () => {
        if (!user || userLoading || isCurrentlyFetching || hasFetchedRef.current) {
            return;
        }

        if (profileCache) {
            setProfileData(profileCache);
            setIsLoading(false);
            return;
        }

        try {
            isCurrentlyFetching = true;
            hasFetchedRef.current = true;
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('manna_auth_token');
            if (!token || token === 'null' || token === 'undefined') {
                console.log('No valid token available for profile request');
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/users/me/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            profileCache = data;
            setProfileData(data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
            isCurrentlyFetching = false;
        }
    }, [user, userLoading]);

    // Buscar dados quando necessário
    useEffect(() => {
        if (!userLoading && user && !profileCache && !hasFetchedRef.current) {
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
            profileCache = null;
            hasFetchedRef.current = false;
            isCurrentlyFetching = false;
            setIsLoading(true);
            fetchProfile();
        }
    }, [user, fetchProfile]);

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
