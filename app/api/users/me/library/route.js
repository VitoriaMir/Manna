// API Route para biblioteca de manhwas do usuário
import { getSession } from '@auth0/nextjs-auth0';

// Simulação de banco de dados em memória para biblioteca de manhwas
const userLibraries = new Map();

// Dados de exemplo de manhwas para popular a biblioteca
const sampleManhwas = [
    {
        id: 'solo-leveling',
        title: 'Solo Leveling',
        cover: '/placeholder-manhwa-cover.jpg',
        author: 'Chu-Gong',
        genres: ['Ação', 'Fantasia', 'Sobrenatural'],
        description: 'Em um mundo onde portais para dimensões monstruosas se abriram...',
        totalChapters: 200,
        rating: 4.9,
        year: 2018,
        status: 'Completo'
    },
    {
        id: 'tower-of-god',
        title: 'Tower of God',
        cover: '/placeholder-manhwa-cover.jpg',
        author: 'SIU',
        genres: ['Aventura', 'Drama', 'Fantasia'],
        description: 'Siga a jornada de Bam enquanto ele escala a misteriosa Torre...',
        totalChapters: 600,
        rating: 4.7,
        year: 2010,
        status: 'Em andamento'
    },
    {
        id: 'beginning-after-end',
        title: 'The Beginning After The End',
        cover: '/placeholder-manhwa-cover.jpg',
        author: 'TurtleMe',
        genres: ['Fantasia', 'Ação', 'Reencarnação'],
        description: 'Um rei poderoso renasce em um mundo de magia e aventuras...',
        totalChapters: 180,
        rating: 4.8,
        year: 2018,
        status: 'Em andamento'
    },
    {
        id: 'noblesse',
        title: 'Noblesse',
        cover: '/placeholder-manhwa-cover.jpg',
        author: 'Son Je-Ho',
        genres: ['Ação', 'Sobrenatural', 'Escola'],
        description: 'Cadis Etrama di Raizel acorda após 820 anos de sono...',
        totalChapters: 544,
        rating: 4.6,
        year: 2007,
        status: 'Completo'
    }
];

// Status de leitura possíveis
const ReadingStatus = {
    READING: 'reading',
    COMPLETED: 'completed',
    PLAN_TO_READ: 'plan_to_read',
    ON_HOLD: 'on_hold',
    DROPPED: 'dropped'
};

// Inicializar dados da biblioteca do usuário
function initializeUserLibrary(userId) {
    if (!userLibraries.has(userId)) {
        // Criar biblioteca inicial com alguns manhwas de exemplo
        const library = {
            manhwas: [
                {
                    ...sampleManhwas[0],
                    userStatus: ReadingStatus.COMPLETED,
                    currentChapter: 200,
                    rating: 5,
                    startedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    addedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
                    isFavorite: true,
                    notes: 'Incrível! Uma das melhores histórias que já li.'
                },
                {
                    ...sampleManhwas[1],
                    userStatus: ReadingStatus.READING,
                    currentChapter: 250,
                    startedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                    addedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
                    isFavorite: true,
                    notes: 'Enredo complexo mas muito interessante.'
                },
                {
                    ...sampleManhwas[2],
                    userStatus: ReadingStatus.READING,
                    currentChapter: 120,
                    startedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                    addedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                    isFavorite: false
                },
                {
                    ...sampleManhwas[3],
                    userStatus: ReadingStatus.PLAN_TO_READ,
                    currentChapter: 0,
                    addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    isFavorite: false,
                    notes: 'Recomendado por amigos.'
                }
            ],
            stats: {
                totalManhwas: 4,
                reading: 2,
                completed: 1,
                planToRead: 1,
                onHold: 0,
                dropped: 0,
                favorites: 2,
                totalChaptersRead: 570
            }
        };

        userLibraries.set(userId, library);
    }
}

export async function GET(request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.sub;
        
        // Inicializar biblioteca se não existir
        initializeUserLibrary(userId);
        
        const library = userLibraries.get(userId);
        
        // Parâmetros de query para filtros
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const favorites = searchParams.get('favorites') === 'true';
        const genre = searchParams.get('genre');
        const search = searchParams.get('search')?.toLowerCase();

        let filteredManhwas = library.manhwas;

        // Aplicar filtros
        if (status) {
            filteredManhwas = filteredManhwas.filter(m => m.userStatus === status);
        }

        if (favorites) {
            filteredManhwas = filteredManhwas.filter(m => m.isFavorite);
        }

        if (genre) {
            filteredManhwas = filteredManhwas.filter(m => 
                m.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
            );
        }

        if (search) {
            filteredManhwas = filteredManhwas.filter(m => 
                m.title.toLowerCase().includes(search) ||
                m.author.toLowerCase().includes(search)
            );
        }

        return Response.json({
            manhwas: filteredManhwas,
            stats: library.stats,
            totalResults: filteredManhwas.length
        });

    } catch (error) {
        console.error('Library API Error:', error);
        return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.sub;
        const data = await request.json();
        
        // Inicializar biblioteca se não existir
        initializeUserLibrary(userId);
        
        const library = userLibraries.get(userId);
        const { manhwaId, action, ...updateData } = data;

        switch (action) {
            case 'add':
                // Adicionar manhwa à biblioteca
                const manhwaToAdd = sampleManhwas.find(m => m.id === manhwaId);
                if (!manhwaToAdd) {
                    return Response.json({ error: 'Manhwa not found' }, { status: 404 });
                }

                // Verificar se já existe na biblioteca
                const existsIndex = library.manhwas.findIndex(m => m.id === manhwaId);
                if (existsIndex !== -1) {
                    return Response.json({ error: 'Manhwa already in library' }, { status: 409 });
                }

                const newManhwa = {
                    ...manhwaToAdd,
                    userStatus: updateData.status || ReadingStatus.PLAN_TO_READ,
                    currentChapter: updateData.currentChapter || 0,
                    addedAt: new Date().toISOString(),
                    isFavorite: false,
                    notes: updateData.notes || ''
                };

                if (updateData.status === ReadingStatus.READING) {
                    newManhwa.startedAt = new Date().toISOString();
                } else if (updateData.status === ReadingStatus.COMPLETED) {
                    newManhwa.startedAt = new Date().toISOString();
                    newManhwa.completedAt = new Date().toISOString();
                    newManhwa.currentChapter = manhwaToAdd.totalChapters;
                }

                library.manhwas.push(newManhwa);
                break;

            case 'update':
                // Atualizar manhwa existente
                const updateIndex = library.manhwas.findIndex(m => m.id === manhwaId);
                if (updateIndex === -1) {
                    return Response.json({ error: 'Manhwa not found in library' }, { status: 404 });
                }

                const existingManhwa = library.manhwas[updateIndex];
                
                // Atualizar campos
                Object.keys(updateData).forEach(key => {
                    if (key !== 'action' && updateData[key] !== undefined) {
                        existingManhwa[key] = updateData[key];
                    }
                });

                // Lógica especial para mudança de status
                if (updateData.userStatus) {
                    if (updateData.userStatus === ReadingStatus.READING && !existingManhwa.startedAt) {
                        existingManhwa.startedAt = new Date().toISOString();
                    } else if (updateData.userStatus === ReadingStatus.COMPLETED) {
                        if (!existingManhwa.startedAt) {
                            existingManhwa.startedAt = new Date().toISOString();
                        }
                        existingManhwa.completedAt = new Date().toISOString();
                        existingManhwa.currentChapter = existingManhwa.totalChapters;
                    }
                }

                library.manhwas[updateIndex] = existingManhwa;
                break;

            case 'remove':
                // Remover manhwa da biblioteca
                const removeIndex = library.manhwas.findIndex(m => m.id === manhwaId);
                if (removeIndex === -1) {
                    return Response.json({ error: 'Manhwa not found in library' }, { status: 404 });
                }

                library.manhwas.splice(removeIndex, 1);
                break;

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Recalcular estatísticas
        library.stats = {
            totalManhwas: library.manhwas.length,
            reading: library.manhwas.filter(m => m.userStatus === ReadingStatus.READING).length,
            completed: library.manhwas.filter(m => m.userStatus === ReadingStatus.COMPLETED).length,
            planToRead: library.manhwas.filter(m => m.userStatus === ReadingStatus.PLAN_TO_READ).length,
            onHold: library.manhwas.filter(m => m.userStatus === ReadingStatus.ON_HOLD).length,
            dropped: library.manhwas.filter(m => m.userStatus === ReadingStatus.DROPPED).length,
            favorites: library.manhwas.filter(m => m.isFavorite).length,
            totalChaptersRead: library.manhwas.reduce((sum, m) => sum + (m.currentChapter || 0), 0)
        };

        userLibraries.set(userId, library);

        return Response.json({ success: true, library });

    } catch (error) {
        console.error('Library Update API Error:', error);
        return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// Exportar constantes para uso em outros lugares
export { ReadingStatus };