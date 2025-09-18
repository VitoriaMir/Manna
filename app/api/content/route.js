import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { getSession } from '@auth0/nextjs-auth0'
import jwt from 'jsonwebtoken'

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

// Helper function to check authentication from multiple sources
async function getAuthenticatedUser(request) {
    // First try Auth0 session
    try {
        const session = await getSession(request)
        if (session?.user) {
            return {
                user: {
                    sub: session.user.sub,
                    email: session.user.email,
                    name: session.user.name,
                    roles: session.user['https://manna-app.com/roles'] || []
                },
                source: 'auth0'
            }
        }
    } catch (error) {
        console.log('Auth0 session check failed:', error.message)
    }

    // Then try JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
            console.log('JWT decoded successfully:', {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                roles: decoded.roles
            })

            // Garantir que roles seja um array, mesmo se não estiver no token
            const roles = decoded.roles || (decoded.role ? [decoded.role] : [])

            return {
                user: {
                    sub: decoded.userId || decoded.sub,
                    email: decoded.email,
                    name: decoded.name,
                    role: decoded.role, // Adicionar role único também
                    roles: roles // Usar roles corrigido
                },
                source: 'jwt'
            }
        } catch (error) {
            console.log('JWT verification failed:', error.message)
        }
    }

    return null
}

// Helper function for CORS
function handleCORS(response) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
}

// Content status enum
const ContentStatus = {
    DRAFT: 'draft',
    REVIEW: 'review',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
}

// GET /api/content - Get all content with filtering
export async function GET(request) {
    try {
        const authResult = await getAuthenticatedUser(request)
        if (!authResult?.user) {
            return handleCORS(NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            ))
        }

        const { user } = authResult
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const creatorId = searchParams.get('creatorId')
        const manhwaId = searchParams.get('manhwaId')

        // Check if MongoDB is configured
        if (!process.env.MONGO_URL) {
            console.log('MongoDB not configured, returning mock data')
            // Return mock data for development
            return handleCORS(NextResponse.json({
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
                    creatorId: user.sub,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }],
                total: 1
            }))
        }

        const db = await connectToMongo()

        // Build query
        let query = {}

        // Filter by status
        if (status) {
            query.status = status
        }

        // Filter by creator (if not admin, only show own content)
        const userRoles = user.roles || []
        const isAdmin = userRoles.includes('admin')

        if (!isAdmin) {
            query.creatorId = user.sub
        } else if (creatorId) {
            query.creatorId = creatorId
        }

        // Filter by manhwa
        if (manhwaId) {
            query.manhwaId = manhwaId
        }

        try {
            const content = await db.collection('content').find(query)
                .sort({ updatedAt: -1 })
                .toArray()

            const cleanedContent = content.map(({ _id, ...rest }) => rest)

            return handleCORS(NextResponse.json({
                content: cleanedContent,
                total: cleanedContent.length
            }))

        } catch (dbError) {
            console.error('Database error:', dbError)
            return handleCORS(NextResponse.json({
                content: [],
                total: 0
            }))
        }

    } catch (error) {
        console.error('Content fetch error:', error)
        return handleCORS(NextResponse.json(
            { error: 'Failed to fetch content' },
            { status: 500 }
        ))
    }
}

// POST /api/content - Create new content
export async function POST(request) {
    try {
        const authResult = await getAuthenticatedUser(request)
        if (!authResult?.user) {
            return handleCORS(NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            ))
        }

        const { user } = authResult
        const userRoles = user.roles || []
        const userRole = user.role // Role único também

        console.log('Auth check - User ID:', user.sub)
        console.log('Auth check - User roles array:', userRoles)
        console.log('Auth check - User role single:', userRole)

        // Verificar se tem role creator (em array ou como role única)
        const hasCreatorRole = userRoles.includes('creator') || userRole === 'creator'

        console.log('Auth check - Has creator role:', hasCreatorRole)

        if (!hasCreatorRole) {
            console.log('Access denied - User roles:', userRoles, 'User role:', userRole)
            return handleCORS(NextResponse.json(
                { error: 'Creator role required', userRole, userRoles },
                { status: 403 }
            ))
        }

        const body = await request.json()
        const { type, manhwaId, chapterId, title, description, author, pages, metadata, coverImage } = body

        // Validate required fields
        if (!type || !title) {
            return handleCORS(NextResponse.json(
                { error: 'Type and title are required' },
                { status: 400 }
            ))
        }

        const db = await connectToMongo()

        const newContent = {
            id: uuidv4(),
            type, // 'manhwa', 'chapter', 'page'
            title,
            description: description || '',
            author: author || 'Autor Desconhecido',
            manhwaId: manhwaId || null,
            chapterId: chapterId || null,
            pages: pages || [],
            metadata: metadata || {},
            coverImage: coverImage || null, // Add cover image field
            status: ContentStatus.DRAFT,
            creatorId: user.sub,
            creatorName: user.name,
            createdAt: new Date(),
            updatedAt: new Date(),
            publishedAt: null,
            version: 1,
            tags: metadata?.tags || [],
            genre: metadata?.genre || [],
            rating: 0,
            views: 0,
            likes: 0,
            comments: []
        }

        try {
            await db.collection('content').insertOne(newContent)

            const { _id, ...cleanedContent } = newContent
            return handleCORS(NextResponse.json(cleanedContent, { status: 201 }))

        } catch (dbError) {
            console.error('Database insert error:', dbError)
            return handleCORS(NextResponse.json(
                { error: 'Failed to create content' },
                { status: 500 }
            ))
        }

    } catch (error) {
        console.error('Content creation error:', error)
        return handleCORS(NextResponse.json(
            { error: 'Failed to create content' },
            { status: 500 }
        ))
    }
}

// PUT /api/content - Update content
export async function PUT(request) {
    try {
        const authResult = await getAuthenticatedUser(request)
        if (!authResult?.user) {
            return handleCORS(NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            ))
        }

        const { user } = authResult

        const body = await request.json()
        const { id, title, description, author, pages, metadata, status, coverImage } = body

        if (!id) {
            return handleCORS(NextResponse.json(
                { error: 'Content ID is required' },
                { status: 400 }
            ))
        }

        const db = await connectToMongo()

        try {
            // Check if content exists and user has permission
            const existingContent = await db.collection('content').findOne({ id })

            if (!existingContent) {
                return handleCORS(NextResponse.json(
                    { error: 'Content not found' },
                    { status: 404 }
                ))
            }

            // Check permissions
            const userRoles = user.roles || []
            const isAdmin = userRoles.includes('admin')
            const isOwner = existingContent.creatorId === user.sub

            if (!isAdmin && !isOwner) {
                return handleCORS(NextResponse.json(
                    { error: 'Permission denied' },
                    { status: 403 }
                ))
            }

            // Prepare update
            const updateData = {
                updatedAt: new Date(),
                version: existingContent.version + 1
            }

            if (title) updateData.title = title
            if (description !== undefined) updateData.description = description
            if (author !== undefined) updateData.author = author
            if (pages) updateData.pages = pages
            if (coverImage !== undefined) updateData.coverImage = coverImage
            if (metadata) {
                updateData.metadata = { ...existingContent.metadata, ...metadata }
                updateData.tags = metadata.tags || existingContent.tags || []
                updateData.genre = metadata.genre || existingContent.genre || []
            }
            if (status && Object.values(ContentStatus).includes(status)) {
                updateData.status = status
                if (status === ContentStatus.PUBLISHED && !existingContent.publishedAt) {
                    updateData.publishedAt = new Date()
                }
            }

            // Update content
            const result = await db.collection('content').updateOne(
                { id },
                { $set: updateData }
            )

            if (result.matchedCount === 0) {
                return handleCORS(NextResponse.json(
                    { error: 'Content not found' },
                    { status: 404 }
                ))
            }

            // Fetch updated content
            const updatedContent = await db.collection('content').findOne({ id })
            const { _id, ...cleanedContent } = updatedContent

            return handleCORS(NextResponse.json(cleanedContent))

        } catch (dbError) {
            console.error('Database update error:', dbError)
            return handleCORS(NextResponse.json(
                { error: 'Failed to update content' },
                { status: 500 }
            ))
        }

    } catch (error) {
        console.error('Content update error:', error)
        return handleCORS(NextResponse.json(
            { error: 'Failed to update content' },
            { status: 500 }
        ))
    }
}

// DELETE /api/content - Delete content
export async function DELETE(request) {
    try {
        const authResult = await getAuthenticatedUser(request)
        if (!authResult?.user) {
            return handleCORS(NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            ))
        }

        const { user } = authResult

        const { searchParams } = new URL(request.url)
        const contentId = searchParams.get('id')

        if (!contentId) {
            return handleCORS(NextResponse.json(
                { error: 'Content ID is required' },
                { status: 400 }
            ))
        }

        const db = await connectToMongo()

        try {
            // Check if content exists and user has permission
            const existingContent = await db.collection('content').findOne({ id: contentId })

            if (!existingContent) {
                return handleCORS(NextResponse.json(
                    { error: 'Content not found' },
                    { status: 404 }
                ))
            }

            const userRoles = user.roles || []
            const isAdmin = userRoles.includes('admin')
            const isOwner = existingContent.creatorId === user.sub

            if (!isAdmin && !isOwner) {
                return handleCORS(NextResponse.json(
                    { error: 'Permission denied' },
                    { status: 403 }
                ))
            }

            // Delete content
            await db.collection('content').deleteOne({ id: contentId })

            return handleCORS(NextResponse.json({
                success: true,
                message: 'Content deleted successfully'
            }))

        } catch (dbError) {
            console.error('Database delete error:', dbError)
            return handleCORS(NextResponse.json(
                { error: 'Failed to delete content' },
                { status: 500 }
            ))
        }

    } catch (error) {
        console.error('Content deletion error:', error)
        return handleCORS(NextResponse.json(
            { error: 'Failed to delete content' },
            { status: 500 }
        ))
    }
}

export async function OPTIONS() {
    return handleCORS(new NextResponse(null, { status: 200 }))
}