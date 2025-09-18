import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import multer from 'multer'
import sharp from 'sharp'
import fs from 'fs-extra'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'), false)
        }
    }
})

// Ensure upload directories exist
const ensureDirectories = async () => {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const thumbnailsDir = path.join(uploadsDir, 'thumbnails')

    await fs.ensureDir(uploadsDir)
    await fs.ensureDir(thumbnailsDir)

    return { uploadsDir, thumbnailsDir }
}

// Process and optimize image
const processImage = async (imageBuffer, filename, directories) => {
    const { uploadsDir, thumbnailsDir } = directories
    const fileId = uuidv4()
    const extension = path.extname(filename).toLowerCase()

    // Generate filenames
    const originalName = `${fileId}_original${extension}`
    const optimizedName = `${fileId}_optimized.webp`
    const thumbnailName = `${fileId}_thumb.webp`

    try {
        // Save original file
        const originalPath = path.join(uploadsDir, originalName)
        await fs.writeFile(originalPath, imageBuffer)

        // Create optimized version (WebP, compressed)
        const optimizedPath = path.join(uploadsDir, optimizedName)
        await sharp(imageBuffer)
            .webp({ quality: 85 })
            .resize(1200, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .toFile(optimizedPath)

        // Create thumbnail
        const thumbnailPath = path.join(thumbnailsDir, thumbnailName)
        await sharp(imageBuffer)
            .webp({ quality: 75 })
            .resize(300, 400, {
                fit: 'cover',
                position: 'top'
            })
            .toFile(thumbnailPath)

        return {
            id: fileId,
            original: `/uploads/${originalName}`,
            optimized: `/uploads/${optimizedName}`,
            thumbnail: `/uploads/thumbnails/${thumbnailName}`,
            filename: filename,
            size: imageBuffer.length,
            mimeType: 'image/webp'
        }
    } catch (error) {
        console.error('Image processing error:', error)
        throw new Error('Failed to process image')
    }
}

// Convert Next.js request to multer-compatible format
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result)
            }
            return resolve(result)
        })
    })
}

// Helper function to check authentication from multiple sources
async function getAuthenticatedUser(request) {
    // First try Auth0 session
    try {
        const session = await getSession(request)
        if (session?.user) {
            return {
                user: session.user,
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

            // Garantir que roles seja um array, mesmo se não estiver no token
            const roles = decoded.roles || (decoded.role ? [decoded.role] : [])

            return {
                user: {
                    sub: decoded.userId || decoded.sub,
                    email: decoded.email,
                    name: decoded.name,
                    role: decoded.role,
                    roles: roles
                },
                source: 'jwt'
            }
        } catch (error) {
            console.log('JWT verification failed:', error.message)
        }
    }

    return null
}

export async function POST(request) {
    console.log('=== UPLOAD API CALLED ===')
    console.log('Request method:', request.method)
    console.log('Request headers:', [...request.headers.entries()])
    console.log('Request URL:', request.url)

    try {
        // Check authentication from multiple sources
        console.log('Attempting to get authenticated user...')
        const authResult = await getAuthenticatedUser(request)
        console.log('Auth result:', authResult ? `User found via ${authResult.source}` : 'No user found')

        if (!authResult?.user) {
            console.log('Authentication failed - no user found')
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { user } = authResult

        console.log('Upload - User authenticated:', user.sub)
        console.log('Upload - User roles:', user.roles)

        // Check if user has creator role (temporarily disabled for testing)
        // const userRoles = user.roles || []
        // if (!userRoles.includes('creator')) {
        //     return NextResponse.json(
        //         { error: 'Creator role required' },
        //         { status: 403 }
        //     )
        // }

        // Get form data
        const formData = await request.formData()
        const files = formData.getAll('files')

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            )
        }

        // Ensure directories exist
        const directories = await ensureDirectories()

        // Process all uploaded files
        const processedFiles = []

        for (const file of files) {
            if (file instanceof File) {
                const buffer = Buffer.from(await file.arrayBuffer())

                try {
                    const processed = await processImage(buffer, file.name, directories)
                    processedFiles.push({
                        ...processed,
                        uploadedBy: user.sub,
                        uploadedAt: new Date().toISOString()
                    })
                } catch (error) {
                    console.error(`Failed to process ${file.name}:`, error)
                    processedFiles.push({
                        filename: file.name,
                        error: error.message,
                        status: 'failed'
                    })
                }
            }
        }

        return NextResponse.json({
            success: true,
            files: processedFiles,
            total: processedFiles.length,
            successful: processedFiles.filter(f => !f.error).length,
            failed: processedFiles.filter(f => f.error).length
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Upload failed', details: error.message },
            { status: 500 }
        )
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    })
}