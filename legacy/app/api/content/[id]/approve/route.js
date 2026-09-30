import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { getSession } from '@auth0/nextjs-auth0'

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

function handleCORS(response) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
}

// POST /api/content/[id]/approve - Approve content for publication
export async function POST(request, { params }) {
    try {
        const session = await getSession()
        if (!session?.user) {
            return handleCORS(NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            ))
        }

        const userRoles = session.user['https://manna-app.com/roles'] || []
        const isModerator = userRoles.includes('admin') || userRoles.includes('moderator')

        if (!isModerator) {
            return handleCORS(NextResponse.json(
                { error: 'Moderator role required' },
                { status: 403 }
            ))
        }

        const { id } = params
        const body = await request.json()
        const { action, reason, notes } = body // action: 'approve', 'reject', 'request_changes'

        if (!action || !['approve', 'reject', 'request_changes'].includes(action)) {
            return handleCORS(NextResponse.json(
                { error: 'Valid action required (approve, reject, request_changes)' },
                { status: 400 }
            ))
        }

        const db = await connectToMongo()

        try {
            // Find the content
            const content = await db.collection('content').findOne({ id })

            if (!content) {
                return handleCORS(NextResponse.json(
                    { error: 'Content not found' },
                    { status: 404 }
                ))
            }

            // Prepare moderation data
            const moderationAction = {
                action,
                moderatorId: session.user.sub,
                moderatorName: session.user.name,
                reason: reason || '',
                notes: notes || '',
                timestamp: new Date()
            }

            // Determine new status based on action
            let newStatus = content.status
            let publishedAt = content.publishedAt

            switch (action) {
                case 'approve':
                    if (content.status === 'review') {
                        newStatus = 'published'
                        publishedAt = publishedAt || new Date()
                    }
                    break
                case 'reject':
                    newStatus = 'draft'
                    publishedAt = null
                    break
                case 'request_changes':
                    newStatus = 'draft'
                    publishedAt = null
                    break
            }

            // Update content with moderation action
            const updateData = {
                status: newStatus,
                publishedAt,
                updatedAt: new Date(),
                $push: {
                    moderationHistory: moderationAction
                }
            }

            // If this is the first moderation action, initialize the array
            if (!content.moderationHistory) {
                updateData.moderationHistory = [moderationAction]
                delete updateData.$push
            }

            const result = await db.collection('content').updateOne(
                { id },
                content.moderationHistory ? { $set: updateData, $push: updateData.$push } : { $set: updateData }
            )

            if (result.matchedCount === 0) {
                return handleCORS(NextResponse.json(
                    { error: 'Failed to update content' },
                    { status: 500 }
                ))
            }

            // Create notification for content creator
            const notification = {
                id: `notif_${Date.now()}`,
                userId: content.creatorId,
                type: 'moderation',
                title: `Content ${action}d`,
                message: `Your content "${content.title}" has been ${action}d${reason ? `: ${reason}` : ''}`,
                data: {
                    contentId: content.id,
                    action,
                    moderatorName: session.user.name
                },
                read: false,
                createdAt: new Date()
            }

            try {
                await db.collection('notifications').insertOne(notification)
            } catch (notifError) {
                console.error('Failed to create notification:', notifError)
                // Don't fail the main operation if notification fails
            }

            return handleCORS(NextResponse.json({
                success: true,
                action,
                newStatus,
                message: `Content has been ${action}d successfully`
            }))

        } catch (dbError) {
            console.error('Database error:', dbError)
            return handleCORS(NextResponse.json(
                { error: 'Database operation failed' },
                { status: 500 }
            ))
        }

    } catch (error) {
        console.error('Moderation error:', error)
        return handleCORS(NextResponse.json(
            { error: 'Failed to process moderation action' },
            { status: 500 }
        ))
    }
}

export async function OPTIONS() {
    return handleCORS(new NextResponse(null, { status: 200 }))
}