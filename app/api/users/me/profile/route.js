// API Route para perfil do usuário
import jwt from 'jsonwebtoken';
import { getUserFromRequest } from '@/lib/auth-utils';
import { userProfiles, userActivities, userAchievements, initializeUserData } from '@/lib/user-data-store';
import { readdir } from 'fs/promises';
import path from 'path';

export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Profile API - Full user object:', JSON.stringify(user, null, 2));

        const userId = user.sub || user.id || user.email || 'anonymous';
        console.log('Profile API - User ID used:', userId);

        // Inicializar dados do usuário se não existir
        initializeUserData(userId, user);

        const profile = userProfiles.get(userId);
        const activities = userActivities.get(userId);
        const achievements = userAchievements.get(userId);

        console.log('Profile API - User ID:', userId);
        console.log('Profile API - Profile data:', profile);
        console.log('Profile API - Avatar URL from profile:', profile?.avatarUrl);

        // Verificar se existe avatar no sistema de arquivos se não houver no perfil
        let avatarUrl = profile?.avatarUrl || user.picture;

        if (!avatarUrl || avatarUrl === user.picture) {
            try {
                const avatarsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
                const files = await readdir(avatarsDir);
                const safeUserId = String(userId).replace(/[|@]/g, '_');
                const userAvatarFiles = files.filter(file => file.startsWith(safeUserId));

                if (userAvatarFiles.length > 0) {
                    // Usar o arquivo mais recente
                    const latestFile = userAvatarFiles.sort().pop();
                    avatarUrl = `/uploads/avatars/${latestFile}`;

                    // Atualizar o perfil com a URL encontrada
                    const updatedProfile = { ...profile, avatarUrl };
                    userProfiles.set(userId, updatedProfile);

                    console.log('Profile API - Restored avatar from filesystem:', avatarUrl);
                }
            } catch (error) {
                console.log('Profile API - Error checking avatar files:', error.message);
            }
        }

        console.log('Profile API - Final avatar URL:', avatarUrl);

        // Calcular estatísticas dinâmicas
        const monthlyGoalPercent = Math.round((profile.monthlyRead / profile.monthlyGoal) * 100);

        // Construir resposta completa
        const profileData = {
            name: user.name || user.email?.split('@')[0] || 'Usuário',
            email: user.email,
            avatarUrl: avatarUrl, // Usar a URL determinada acima
            backgroundImage: profile.backgroundImage, // Imagem de fundo (null se não definida)
            lastLoginISO: user.updated_at || new Date().toISOString(),
            joinedDate: profile.joinedDate,
            roles: user['https://manna-app.com/roles'] || ['reader'],
            stats: {
                readCount: profile.readCount,
                favoritesCount: profile.favoritesCount,
                inProgressCount: profile.inProgressCount,
                readingStreakDays: profile.readingStreakDays,
                monthlyGoalPercent: monthlyGoalPercent,
                monthlyGoal: profile.monthlyGoal,
                monthlyRead: profile.monthlyRead
            },
            achievements: achievements || [],
            recentActivity: activities?.slice(0, 10) || [], // Últimas 10 atividades
            preferences: profile.preferences
        };

        return Response.json(profileData);

    } catch (error) {
        console.error('Profile API Error:', error);
        return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.id;
        const updates = await request.json();

        // Validar dados de entrada
        const allowedUpdates = ['monthlyGoal', 'preferences', 'backgroundImage'];
        const filteredUpdates = {};

        for (const [key, value] of Object.entries(updates)) {
            if (allowedUpdates.includes(key)) {
                filteredUpdates[key] = value;
            }
        }

        if (Object.keys(filteredUpdates).length === 0) {
            return Response.json({ error: 'No valid updates provided' }, { status: 400 });
        }

        // Atualizar perfil do usuário
        const currentProfile = userProfiles.get(userId);
        if (currentProfile) {
            const updatedProfile = { ...currentProfile, ...filteredUpdates };
            userProfiles.set(userId, updatedProfile);
        }

        return Response.json({ success: true, updated: filteredUpdates });

    } catch (error) {
        console.error('Profile Update API Error:', error);
        return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// Endpoint para adicionar nova atividade
export async function POST(request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.sub;
        const activityData = await request.json();

        // Validar dados da atividade
        const requiredFields = ['type', 'title', 'manhwaTitle'];
        for (const field of requiredFields) {
            if (!activityData[field]) {
                return Response.json({ error: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        // Criar nova atividade
        const newActivity = {
            id: `${userId}_activity_${Date.now()}`,
            type: activityData.type,
            title: activityData.title,
            manhwaTitle: activityData.manhwaTitle,
            whenISO: new Date().toISOString(),
            meta: activityData.meta || '',
            ...activityData // Permite campos extras específicos do tipo
        };

        // Adicionar à lista de atividades do usuário
        const currentActivities = userActivities.get(userId) || [];
        currentActivities.unshift(newActivity); // Adiciona no início (mais recente)

        // Manter apenas as últimas 50 atividades
        if (currentActivities.length > 50) {
            currentActivities.splice(50);
        }

        userActivities.set(userId, currentActivities);

        // Atualizar estatísticas baseado no tipo de atividade
        const profile = userProfiles.get(userId);
        if (profile) {
            switch (activityData.type) {
                case 'read':
                    // Incrementar contadores de leitura pode ser feito aqui
                    break;
                case 'favorite':
                    profile.favoritesCount += 1;
                    break;
                case 'start':
                    profile.inProgressCount += 1;
                    break;
                case 'finish':
                    profile.readCount += 1;
                    profile.inProgressCount = Math.max(0, profile.inProgressCount - 1);
                    profile.monthlyRead += 1;
                    break;
            }
            userProfiles.set(userId, profile);
        }

        return Response.json({ success: true, activity: newActivity });

    } catch (error) {
        console.error('Activity Creation API Error:', error);
        return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
