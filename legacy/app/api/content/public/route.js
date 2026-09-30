import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

// MongoDB connection
let client
let db

async function connectToMongo() {
    if (!client) {
        client = new MongoClient(process.env.MONGO_URL)
        await client.connect()
        db = client.db(process.env.DB_NAME || 'manna_db')
    }
    return db
}

// CORS headers
function handleCORS(response) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    return response
}

// GET /api/content/public - Get published content (no authentication required)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit')) || 10
        const offset = parseInt(searchParams.get('offset')) || 0

        // Check if MongoDB is configured
        if (!process.env.MONGO_URL) {
            console.log('MongoDB not configured, returning mock data')
            // Return mock data for development
            return handleCORS(NextResponse.json({
                success: true,
                content: [{
                    _id: 'mock-id-1',
                    title: 'Exemplo de Série',
                    description: 'Uma série de exemplo para desenvolvimento',
                    author: 'Autor Exemplo',
                    type: 'series',
                    status: 'published',
                    cover: '/images/manhwas/default-cover.jpg',
                    genre: ['Romance', 'Drama'],
                    tags: ['exemplo'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }],
                total: 1,
                pagination: {
                    offset,
                    limit,
                    hasMore: false
                }
            }))
        }

        const db = await connectToMongo()

        console.log('Public API: Fetching published content...')

        // Query only published content
        const query = { status: 'published' }

        const content = await db.collection('content')
            .find(query)
            .sort({ updatedAt: -1 })
            .skip(offset)
            .limit(limit)
            .toArray()

        const total = await db.collection('content').countDocuments(query)

        console.log(`Public API: Found ${content.length} published items out of ${total} total`)

        return handleCORS(NextResponse.json({
            success: true,
            content,
            total,
            pagination: {
                offset,
                limit,
                hasMore: offset + content.length < total
            }
        }))

    } catch (error) {
        console.error('Public API error:', error)
        return handleCORS(NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch published content',
                details: error.message
            },
            { status: 500 }
        ))
    }
}

// OPTIONS handler for CORS
export async function OPTIONS(request) {
    return handleCORS(new NextResponse(null, { status: 200 }))
}