// API para upload de avatar do usuário
import { getUserFromRequest } from '@/lib/auth-utils'
import { writeFile, mkdir } from 'fs/promises'
import { NextResponse } from 'next/server'
import path from 'path'
import { userProfiles, initializeUserData } from '@/lib/user-data-store'

export async function POST(req) {
    console.log('=== AVATAR UPLOAD API CALLED ===')

    try {
        const user = await getUserFromRequest(req)
        console.log('Avatar - User:', user ? 'exists' : 'null')
        console.log('Avatar - Full user object:', JSON.stringify(user, null, 2))

        if (!user) {
            console.log('Avatar - No user found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('Avatar - User authenticated:', user.sub || user.id)

        console.log('Avatar - Getting form data...')
        const formData = await req.formData()
        const file = formData.get('image')

        console.log('Avatar - File received:', file ? file.name : 'no file')
        console.log('Avatar - File type:', file ? file.type : 'N/A')
        console.log('Avatar - File size:', file ? file.size : 'N/A')

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: 'Nenhuma imagem foi enviada' },
                { status: 400 }
            )
        }

        // Validações
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.' },
                { status: 400 }
            )
        }

        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'Arquivo muito grande. Máximo 5MB.' },
                { status: 400 }
            )
        }

        console.log('Avatar - Validations passed, creating upload directory...')

        // Criar diretório de uploads se não existir
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
        console.log('Avatar - Upload directory:', uploadDir)

        try {
            await mkdir(uploadDir, { recursive: true })
            console.log('Avatar - Directory created/verified')
        } catch (error) {
            console.log('Avatar - Directory error (probably exists):', error.message)
        }

        // Gerar nome único para o arquivo
        const fileExtension = path.extname(file.name)
        const userId = user.sub || user.id || user.email || 'anonymous'
        console.log('Avatar - User ID for filename:', userId)
        const safeUserId = String(userId).replace(/[|@]/g, '_')
        const fileName = `${safeUserId}_${Date.now()}${fileExtension}`
        const filePath = path.join(uploadDir, fileName)

        console.log('Avatar - User ID:', userId)
        console.log('Avatar - Safe User ID:', safeUserId)
        console.log('Avatar - Generated filename:', fileName)
        console.log('Avatar - Full file path:', filePath)

        // Salvar arquivo
        console.log('Avatar - Converting file to buffer...')
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        console.log('Avatar - Buffer created, size:', buffer.length)

        console.log('Avatar - Writing file to disk...')
        await writeFile(filePath, buffer)
        console.log('Avatar - File written successfully')

        // URL pública da imagem
        const imageUrl = `/uploads/avatars/${fileName}`

        // Atualizar perfil do usuário com nova URL do avatar
        const currentProfile = userProfiles.get(userId) || initializeUserData(userId, user);

        const updatedProfile = {
            ...currentProfile,
            avatarUrl: imageUrl
        };

        userProfiles.set(userId, updatedProfile);

        console.log('Avatar upload completed:', {
            userId: safeUserId,
            fileName,
            fileSize: file.size,
            imageUrl,
            profileUpdated: true,
            profileData: updatedProfile
        })

        return NextResponse.json({
            success: true,
            message: 'Avatar atualizado com sucesso',
            imageUrl,
            avatarUrl: imageUrl, // Compatibilidade com ProfilePro
            fileName,
            profile: updatedProfile
        })

    } catch (error) {
        console.error('Avatar upload error - Full details:')
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        console.error('Error type:', error.constructor.name)

        return NextResponse.json(
            { error: 'Erro interno do servidor', details: error.message },
            { status: 500 }
        )
    }
}