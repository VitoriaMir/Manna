import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export function useManhwaLibrary() {
    const { user, isLoading: userLoading } = useUser();
    const [library, setLibrary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Função para buscar a biblioteca
    const fetchLibrary = async (filters = {}) => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            
            // Construir query params para filtros
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value.toString());
                }
            });

            const url = `/api/users/me/library${params.toString() ? `?${params.toString()}` : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setLibrary(data);
        } catch (err) {
            console.error('Error fetching library:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Função para adicionar manhwa à biblioteca
    const addManhwa = async (manhwaId, options = {}) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        setIsUpdating(true);
        try {
            const response = await fetch('/api/users/me/library', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'add',
                    manhwaId,
                    ...options
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Atualizar estado local
            if (result.success) {
                setLibrary(result.library);
            }

            return result;
        } catch (err) {
            console.error('Error adding manhwa:', err);
            throw err;
        } finally {
            setIsUpdating(false);
        }
    };

    // Função para atualizar manhwa na biblioteca
    const updateManhwa = async (manhwaId, updates) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        setIsUpdating(true);
        try {
            const response = await fetch('/api/users/me/library', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update',
                    manhwaId,
                    ...updates
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Atualizar estado local
            if (result.success) {
                setLibrary(result.library);
            }

            return result;
        } catch (err) {
            console.error('Error updating manhwa:', err);
            throw err;
        } finally {
            setIsUpdating(false);
        }
    };

    // Função para remover manhwa da biblioteca
    const removeManhwa = async (manhwaId) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        setIsUpdating(true);
        try {
            const response = await fetch('/api/users/me/library', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'remove',
                    manhwaId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Atualizar estado local
            if (result.success) {
                setLibrary(result.library);
            }

            return result;
        } catch (err) {
            console.error('Error removing manhwa:', err);
            throw err;
        } finally {
            setIsUpdating(false);
        }
    };

    // Função para revalidar dados
    const revalidate = (filters = {}) => {
        if (user) {
            setIsLoading(true);
            fetchLibrary(filters);
        }
    };

    // Buscar dados quando o usuário estiver disponível
    useEffect(() => {
        if (!userLoading && user) {
            fetchLibrary();
        } else if (!userLoading && !user) {
            setIsLoading(false);
            setLibrary(null);
        }
    }, [user, userLoading]);

    // Funções de utilidade
    const getManhwasByStatus = (status) => {
        return library?.manhwas?.filter(manhwa => manhwa.userStatus === status) || [];
    };

    const getFavoriteManhwas = () => {
        return library?.manhwas?.filter(manhwa => manhwa.isFavorite) || [];
    };

    const getManhwaById = (id) => {
        return library?.manhwas?.find(manhwa => manhwa.id === id);
    };

    const getProgressPercentage = (manhwa) => {
        if (!manhwa.totalChapters || manhwa.totalChapters === 0) return 0;
        return Math.round((manhwa.currentChapter / manhwa.totalChapters) * 100);
    };

    const getGenreStats = () => {
        if (!library?.manhwas) return {};
        
        const genreCount = {};
        library.manhwas.forEach(manhwa => {
            manhwa.genres.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
        });
        
        return genreCount;
    };

    return {
        // Estados
        library,
        isLoading: userLoading || isLoading,
        isUpdating,
        error,

        // Dados do usuário Auth0
        user,

        // Ações principais
        addManhwa,
        updateManhwa,
        removeManhwa,
        revalidate,
        fetchLibrary,

        // Utilitários de consulta
        getManhwasByStatus,
        getFavoriteManhwas,
        getManhwaById,
        getProgressPercentage,
        getGenreStats,
    };
}

// Hook específico para estatísticas da biblioteca
export function useLibraryStats() {
    const { library, isLoading } = useManhwaLibrary();

    return {
        isLoading,
        stats: library?.stats || {},
        totalManhwas: library?.stats?.totalManhwas || 0,
        reading: library?.stats?.reading || 0,
        completed: library?.stats?.completed || 0,
        planToRead: library?.stats?.planToRead || 0,
        onHold: library?.stats?.onHold || 0,
        dropped: library?.stats?.dropped || 0,
        favorites: library?.stats?.favorites || 0,
        totalChaptersRead: library?.stats?.totalChaptersRead || 0,
    };
}

// Constantes de status de leitura para consistência
export const ReadingStatus = {
    READING: 'reading',
    COMPLETED: 'completed',
    PLAN_TO_READ: 'plan_to_read',
    ON_HOLD: 'on_hold',
    DROPPED: 'dropped'
};

// Labels amigáveis para status
export const StatusLabels = {
    [ReadingStatus.READING]: 'Lendo',
    [ReadingStatus.COMPLETED]: 'Concluído',
    [ReadingStatus.PLAN_TO_READ]: 'Pretendo Ler',
    [ReadingStatus.ON_HOLD]: 'Em Pausa',
    [ReadingStatus.DROPPED]: 'Abandonado'
};

// Cores para status (para uso em badges/indicadores)
export const StatusColors = {
    [ReadingStatus.READING]: 'blue',
    [ReadingStatus.COMPLETED]: 'green',
    [ReadingStatus.PLAN_TO_READ]: 'gray',
    [ReadingStatus.ON_HOLD]: 'yellow',
    [ReadingStatus.DROPPED]: 'red'
};