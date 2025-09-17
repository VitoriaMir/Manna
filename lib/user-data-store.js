// Shared data store para evitar Maps desincronizados entre APIs
export const userProfiles = new Map();
export const userActivities = new Map();
export const userAchievements = new Map();

// Função para inicializar dados do usuário
export function initializeUserData(userId, user) {
    if (!userProfiles.has(userId)) {
        userProfiles.set(userId, {
            userId,
            readCount: Math.floor(Math.random() * 50) + 1,
            favoritesCount: Math.floor(Math.random() * 20) + 1,
            inProgressCount: Math.floor(Math.random() * 10) + 1,
            readingStreakDays: Math.floor(Math.random() * 30) + 1,
            monthlyGoal: 20,
            monthlyRead: Math.floor(Math.random() * 20),
            joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            preferences: {
                theme: 'dark',
                notifications: true,
                privacy: 'public'
            },
            avatarUrl: null, // Placeholder para avatar
            backgroundImage: null // Usuário pode fazer upload personalizado
        });
    }

    if (!userActivities.has(userId)) {
        userActivities.set(userId, [
            {
                id: `${userId}_activity_1`,
                type: 'read',
                title: 'Leu "Solo Leveling" - Capítulo 25',
                manhwaTitle: 'Solo Leveling',
                chapter: 25,
                whenISO: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                meta: 'Ação, Fantasia'
            },
            {
                id: `${userId}_activity_2`,
                type: 'favorite',
                title: 'Adicionou "Tower of God" aos favoritos',
                manhwaTitle: 'Tower of God',
                whenISO: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                meta: 'Aventura, Mistério'
            },
            {
                id: `${userId}_activity_3`,
                type: 'start',
                title: 'Começou a ler "The Beginning After The End"',
                manhwaTitle: 'The Beginning After The End',
                whenISO: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                meta: 'Fantasia, Reencarnação'
            },
            {
                id: `${userId}_activity_4`,
                type: 'review',
                title: 'Avaliou "Noblesse" com 5 estrelas',
                manhwaTitle: 'Noblesse',
                rating: 5,
                whenISO: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                meta: 'Sobrenatural, Comédia'
            },
            {
                id: `${userId}_activity_5`,
                type: 'finish',
                title: 'Terminou de ler "God of High School"',
                manhwaTitle: 'God of High School',
                whenISO: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
                meta: 'Ação, Artes Marciais'
            }
        ]);
    }

    if (!userAchievements.has(userId)) {
        const profile = userProfiles.get(userId);
        const achievements = [];

        // Conquistas baseadas nas estatísticas do usuário
        if (profile.readCount >= 1) {
            achievements.push({
                id: 'first_read',
                label: 'Primeiro Manhwa',
                description: 'Leu seu primeiro manhwa',
                unlockedAt: profile.joinedDate,
                icon: '📚'
            });
        }

        if (profile.readCount >= 10) {
            achievements.push({
                id: 'reader_10',
                label: 'Leitor Dedicado',
                description: 'Leu 10 manhwas',
                unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                icon: '📖'
            });
        }

        if (profile.readingStreakDays >= 7) {
            achievements.push({
                id: 'streak_7',
                label: 'Constância',
                description: 'Leu por 7 dias seguidos',
                unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                icon: '🔥'
            });
        }

        if (profile.favoritesCount >= 5) {
            achievements.push({
                id: 'collector',
                label: 'Colecionador',
                description: 'Favoritou 5+ manhwas',
                unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                icon: '⭐'
            });
        }

        if (profile.readCount >= 25) {
            achievements.push({
                id: 'veteran',
                label: 'Veterano',
                description: 'Leu 25+ manhwas',
                unlockedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                icon: '🏆'
            });
        }

        userAchievements.set(userId, achievements);
    }

    return userProfiles.get(userId);
}