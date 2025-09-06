// API Route para perfil do usuário
import { getSession } from '@auth0/nextjs-auth0';

// Simulação de banco de dados em memória (substitua por DB real)
const userProfiles = new Map();
const userActivities = new Map();
const userAchievements = new Map();

// Dados iniciais mockados por usuário
function initializeUserData(userId, user) {
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
      }
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
}

export async function GET(request) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const userId = user.sub;

    // Inicializar dados do usuário se não existir
    initializeUserData(userId, user);

    const profile = userProfiles.get(userId);
    const activities = userActivities.get(userId);
    const achievements = userAchievements.get(userId);

    // Calcular estatísticas dinâmicas
    const monthlyGoalPercent = Math.round((profile.monthlyRead / profile.monthlyGoal) * 100);
    
    // Construir resposta completa
    const profileData = {
      name: user.name,
      email: user.email,
      avatarUrl: user.picture,
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
    const session = await getSession();
    
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const updates = await request.json();

    // Validar dados de entrada
    const allowedUpdates = ['monthlyGoal', 'preferences'];
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
