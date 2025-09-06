import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export function useUserProfile() {
  const { user, isLoading: userLoading } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Função para buscar dados do perfil
  const fetchProfile = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/users/me/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar perfil
  const updateProfile = async (updates) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/users/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Atualizar estado local
      if (result.success) {
        setProfileData(prev => ({
          ...prev,
          ...updates
        }));
      }

      return result;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para adicionar nova atividade
  const addActivity = async (activityData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('/api/users/me/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Atualizar atividades no estado local
      if (result.success) {
        setProfileData(prev => ({
          ...prev,
          recentActivity: [result.activity, ...prev.recentActivity].slice(0, 10)
        }));
      }

      return result;
    } catch (err) {
      console.error('Error adding activity:', err);
      throw err;
    }
  };

  // Função para revalidar dados
  const revalidate = () => {
    if (user) {
      setIsLoading(true);
      fetchProfile();
    }
  };

  // Buscar dados quando o usuário estiver disponível
  useEffect(() => {
    if (!userLoading && user) {
      fetchProfile();
    } else if (!userLoading && !user) {
      setIsLoading(false);
      setProfileData(null);
    }
  }, [user, userLoading]);

  // Funções de utilidade para manipular dados
  const getStatValue = (statKey, defaultValue = 0) => {
    return profileData?.stats?.[statKey] ?? defaultValue;
  };

  const hasAchievement = (achievementId) => {
    return profileData?.achievements?.some(ach => ach.id === achievementId) ?? false;
  };

  const getRecentActivitiesByType = (type) => {
    return profileData?.recentActivity?.filter(activity => activity.type === type) ?? [];
  };

  const isCreator = () => {
    return profileData?.roles?.includes('creator') ?? false;
  };

  const isPremium = () => {
    return profileData?.roles?.includes('premium') ?? false;
  };

  return {
    // Estados
    profileData,
    isLoading: userLoading || isLoading,
    isUpdating,
    error,
    
    // Dados do usuário Auth0
    user,
    
    // Ações
    updateProfile,
    addActivity,
    revalidate,
    
    // Utilitários
    getStatValue,
    hasAchievement,
    getRecentActivitiesByType,
    isCreator,
    isPremium,
  };
}

// Hook específico para estatísticas
export function useUserStats() {
  const { profileData, isLoading, getStatValue } = useUserProfile();
  
  return {
    isLoading,
    readCount: getStatValue('readCount'),
    favoritesCount: getStatValue('favoritesCount'),
    inProgressCount: getStatValue('inProgressCount'),
    readingStreakDays: getStatValue('readingStreakDays'),
    monthlyGoalPercent: getStatValue('monthlyGoalPercent'),
    monthlyGoal: getStatValue('monthlyGoal'),
    monthlyRead: getStatValue('monthlyRead'),
  };
}

// Hook específico para atividades
export function useUserActivity() {
  const { profileData, isLoading, addActivity, getRecentActivitiesByType } = useUserProfile();
  
  return {
    isLoading,
    recentActivity: profileData?.recentActivity ?? [],
    addActivity,
    getRecentActivitiesByType,
  };
}

// Hook específico para conquistas
export function useUserAchievements() {
  const { profileData, isLoading, hasAchievement } = useUserProfile();
  
  return {
    isLoading,
    achievements: profileData?.achievements ?? [],
    hasAchievement,
  };
}
