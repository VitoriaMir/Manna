import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// MongoDB connection
let client
let db

async function connectToMongo() {
    if (!client) {
        client = new MongoClient(process.env.MONGO_URL)
        await client.connect()
        db = client.db(process.env.DB_NAME)
    }
    return db
}

// Helper function to handle CORS
function handleCORS(response) {
    response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
    return handleCORS(new NextResponse(null, { status: 200 }))
}

// Sample manhwa data
const sampleManhwas = [
    {
        id: "manhwa-1",
        title: "Digital Dreams",
        author: "Artista Digital",
        description: "Uma jornada através de mundos digitais e realidade virtual onde os sonhos se tornam código.",
        cover: "https://images.unsplash.com/photo-1635399860495-2a2802a6df5e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHxwdXJwbGV8MTc1NjA5NDM5Mnww&ixlib=rb-4.1.0&q=85",
        genres: ["Ficção Científica", "Drama"],
        rating: 4.8,
        views: 125000,
        status: "Ongoing",
        chapters: [
            {
                id: "ch-1",
                title: "Capítulo 1: Conectando",
                pages: [
                    "https://images.unsplash.com/photo-1635399860495-2a2802a6df5e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHxwdXJwbGV8MTc1NjA5NDM5Mnww&ixlib=rb-4.1.0&q=85",
                    "https://images.unsplash.com/photo-1565194637906-8f45f3351a5d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb21pYyUyMGlsbHVzdHJhdGlvbnxlbnwwfHx8cHVycGxlfDE3NTYwOTQzNzh8MA&ixlib=rb-4.1.0&q=85",
                    "https://images.unsplash.com/photo-1560211653-def0966f4537?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxjb21pYyUyMGlsbHVzdHJhdGlvbnxlbnwwfHx8cHVycGxlfDE3NTYwOTQzNzh8MA&ixlib=rb-4.1.0&q=85"
                ]
            },
            {
                id: "ch-2",
                title: "Capítulo 2: O Despertar",
                pages: [
                    "https://images.unsplash.com/photo-1651249098063-b3a8855e2a5a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxhbmltZXxlbnwwfHx8cHVycGxlfDE3NTYwOTQzODR8MA&ixlib=rb-4.1.0&q=85",
                    "https://images.unsplash.com/photo-1617791160588-241658c0f566?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHxwdXJwbGV8MTc1NjA5NDM5Mnww&ixlib=rb-4.1.0&q=85",
                    "https://images.pexels.com/photos/7233189/pexels-photo-7233189.jpeg"
                ]
            }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "manhwa-2",
        title: "Asas da Liberdade",
        author: "Creator Dreams",
        description: "A história de um jovem que descobre seus poderes especiais em um mundo cheio de mistérios.",
        cover: "https://images.unsplash.com/photo-1617791160588-241658c0f566?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHxwdXJwbGV8MTc1NjA5NDM5Mnww&ixlib=rb-4.1.0&q=85",
        genres: ["Fantasia", "Aventura"],
        rating: 4.6,
        views: 98000,
        status: "Completed",
        chapters: [
            {
                id: "ch-1",
                title: "Capítulo 1: O Início",
                pages: [
                    "https://images.unsplash.com/photo-1617791160588-241658c0f566?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHxwdXJwbGV8MTc1NjA5NDM5Mnww&ixlib=rb-4.1.0&q=85",
                    "https://images.pexels.com/photos/7233189/pexels-photo-7233189.jpeg"
                ]
            }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    }
]

// Route handler function
async function handleRoute(request, { params }) {
    const { path = [] } = params
    const route = `/${path.join('/')}`
    const method = request.method

    try {
        const db = await connectToMongo()

        // Root endpoint
        if (route === '/' && method === 'GET') {
            return handleCORS(NextResponse.json({ message: "Manna API - Plataforma de Manhwa" }))
        }

        // Get all manhwas - GET /api/manhwas
        if (route === '/manhwas' && method === 'GET') {
            try {
                // Check if database connection is available
                if (!db) {
                    console.error('Database connection not available, returning sample data')
                    return handleCORS(NextResponse.json(sampleManhwas))
                }

                const manhwas = await db.collection('manhwas').find({}).toArray()

                // If no manhwas in database, seed with sample data
                if (manhwas.length === 0) {
                    await db.collection('manhwas').insertMany(sampleManhwas)
                    const cleanedManhwas = sampleManhwas.map(({ _id, ...rest }) => rest)
                    return handleCORS(NextResponse.json(cleanedManhwas))
                }

                // Remove MongoDB's _id field from response
                const cleanedManhwas = manhwas.map(({ _id, ...rest }) => rest)
                return handleCORS(NextResponse.json(cleanedManhwas))

            } catch (error) {
                console.error('Database error, returning sample data:', error)
                return handleCORS(NextResponse.json(sampleManhwas))
            }
        }

        // Advanced Search manhwas - GET /api/manhwas/search with multiple parameters
        if (route === '/manhwas/search' && method === 'GET') {
            const url = new URL(request.url)
            const searchTerm = url.searchParams.get('q')
            const genres = url.searchParams.get('genres') // comma-separated
            const status = url.searchParams.get('status')
            const minRating = url.searchParams.get('minRating')
            const maxRating = url.searchParams.get('maxRating')
            const sortBy = url.searchParams.get('sortBy') || 'views' // views, rating, title, createdAt
            const sortOrder = url.searchParams.get('sortOrder') || 'desc' // asc, desc

            try {
                let manhwas

                // Try database search first
                try {
                    let query = {}

                    // Build search query
                    if (searchTerm) {
                        query.$or = [
                            { title: { $regex: searchTerm, $options: 'i' } },
                            { author: { $regex: searchTerm, $options: 'i' } },
                            { description: { $regex: searchTerm, $options: 'i' } },
                            { genres: { $in: [new RegExp(searchTerm, 'i')] } }
                        ]
                    }

                    // Filter by genres
                    if (genres) {
                        const genreList = genres.split(',').map(g => g.trim())
                        query.genres = { $in: genreList }
                    }

                    // Filter by status
                    if (status) {
                        query.status = status
                    }

                    // Filter by rating range
                    if (minRating || maxRating) {
                        query.rating = {}
                        if (minRating) query.rating.$gte = parseFloat(minRating)
                        if (maxRating) query.rating.$lte = parseFloat(maxRating)
                    }

                    // Execute query with sorting
                    const sortObj = {}
                    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1

                    if (db) {
                        manhwas = await db.collection('manhwas')
                            .find(query)
                            .sort(sortObj)
                            .toArray()
                    } else {
                        throw new Error('Database not available')
                    }

                } catch (dbError) {
                    console.error('Database search error:', dbError)
                    manhwas = sampleManhwas
                }

                // Fallback to sample data filtering if database fails
                if (!manhwas || manhwas.length === 0) {
                    manhwas = [...sampleManhwas]

                    // Apply search term filter
                    if (searchTerm) {
                        manhwas = manhwas.filter(manhwa =>
                            manhwa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            manhwa.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            manhwa.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            manhwa.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                    }

                    // Apply genre filter
                    if (genres) {
                        const genreList = genres.split(',').map(g => g.trim().toLowerCase())
                        manhwas = manhwas.filter(manhwa =>
                            manhwa.genres.some(genre => genreList.includes(genre.toLowerCase()))
                        )
                    }

                    // Apply status filter
                    if (status) {
                        manhwas = manhwas.filter(manhwa => manhwa.status === status)
                    }

                    // Apply rating filter
                    if (minRating || maxRating) {
                        manhwas = manhwas.filter(manhwa => {
                            const rating = manhwa.rating || 0
                            const min = minRating ? parseFloat(minRating) : 0
                            const max = maxRating ? parseFloat(maxRating) : 5
                            return rating >= min && rating <= max
                        })
                    }

                    // Apply sorting
                    manhwas.sort((a, b) => {
                        let aVal = a[sortBy] || 0
                        let bVal = b[sortBy] || 0

                        if (sortBy === 'title' || sortBy === 'author') {
                            aVal = aVal.toLowerCase()
                            bVal = bVal.toLowerCase()
                            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
                        } else {
                            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
                        }
                    })
                }

                // Remove MongoDB's _id field from response
                const cleanedManhwas = manhwas.map(({ _id, ...rest }) => rest)
                return handleCORS(NextResponse.json({
                    results: cleanedManhwas,
                    total: cleanedManhwas.length,
                    query: {
                        searchTerm,
                        genres: genres ? genres.split(',') : [],
                        status,
                        minRating,
                        maxRating,
                        sortBy,
                        sortOrder
                    }
                }))

            } catch (error) {
                console.error('Search error:', error)
                return handleCORS(NextResponse.json(
                    { error: "Erro na busca" },
                    { status: 500 }
                ))
            }
        }

        // Get available genres - GET /api/manhwas/genres
        if (route === '/manhwas/genres' && method === 'GET') {
            try {
                let allGenres = []

                try {
                    // Try to get genres from database
                    if (db) {
                        const manhwas = await db.collection('manhwas').find({}).toArray()
                        manhwas.forEach(manhwa => {
                            if (manhwa.genres) {
                                allGenres.push(...manhwa.genres)
                            }
                        })
                    } else {
                        throw new Error('Database not available')
                    }
                } catch (dbError) {
                    console.error('Database genres error:', dbError)
                    // Fallback to sample data
                    sampleManhwas.forEach(manhwa => {
                        if (manhwa.genres) {
                            allGenres.push(...manhwa.genres)
                        }
                    })
                }

                // Remove duplicates and sort
                const uniqueGenres = [...new Set(allGenres)].sort()

                return handleCORS(NextResponse.json({
                    genres: uniqueGenres,
                    total: uniqueGenres.length
                }))

            } catch (error) {
                console.error('Genres error:', error)
                return handleCORS(NextResponse.json(
                    { error: "Erro ao buscar gêneros" },
                    { status: 500 }
                ))
            }
        }

        // Get specific manhwa - GET /api/manhwas/:id
        if (route.startsWith('/manhwas/') && method === 'GET') {
            const manhwaId = route.split('/')[2]

            try {
                const manhwa = await db.collection('manhwas').findOne({ id: manhwaId })

                if (!manhwa) {
                    // Fallback to sample data
                    const sampleManhwa = sampleManhwas.find(m => m.id === manhwaId)
                    if (sampleManhwa) {
                        return handleCORS(NextResponse.json(sampleManhwa))
                    }
                    return handleCORS(NextResponse.json(
                        { error: "Manhwa não encontrado" },
                        { status: 404 }
                    ))
                }

                // Remove MongoDB's _id field from response
                const { _id, ...cleanedManhwa } = manhwa
                return handleCORS(NextResponse.json(cleanedManhwa))

            } catch (error) {
                console.error('Database error:', error)
                // Fallback to sample data
                const sampleManhwa = sampleManhwas.find(m => m.id === manhwaId)
                if (sampleManhwa) {
                    return handleCORS(NextResponse.json(sampleManhwa))
                }
                return handleCORS(NextResponse.json(
                    { error: "Erro interno do servidor" },
                    { status: 500 }
                ))
            }
        }

        // Create new manhwa - POST /api/manhwas
        if (route === '/manhwas' && method === 'POST') {
            const body = await request.json()

            if (!body.title || !body.author) {
                return handleCORS(NextResponse.json(
                    { error: "Título e autor são obrigatórios" },
                    { status: 400 }
                ))
            }

            const newManhwa = {
                id: uuidv4(),
                title: body.title,
                author: body.author,
                description: body.description || '',
                cover: body.cover || '',
                genres: body.genres || [],
                rating: body.rating || 0,
                views: body.views || 0,
                status: body.status || 'Ongoing',
                chapters: body.chapters || [],
                createdAt: new Date(),
                updatedAt: new Date()
            }

            await db.collection('manhwas').insertOne(newManhwa)

            // Remove MongoDB's _id field from response
            const { _id, ...cleanedManhwa } = newManhwa
            return handleCORS(NextResponse.json(cleanedManhwa, { status: 201 }))
        }

        // Route not found
        return handleCORS(NextResponse.json(
            { error: `Rota ${route} não encontrada` },
            { status: 404 }
        ))

    } catch (error) {
        console.error('API Error:', error)
        return handleCORS(NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        ))
    }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute