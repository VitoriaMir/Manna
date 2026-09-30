// API para upload de imagem de fundo do perfil
import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { getUserFromRequest } from '@/lib/auth-utils';
import { userProfiles } from '@/lib/user-data-store';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('=== BACKGROUND UPLOAD API CALLED ===');
        console.log('Background - User:', !!user);
        console.log('Background - Full user object:', JSON.stringify(user, null, 2));

        const userId = user.sub || user.id || user.email || 'anonymous';
        console.log('Background - User authenticated:', !!user);

        // Parse form data
        console.log('Background - Getting form data...');
        const formData = await request.formData();
        const file = formData.get('background');

        if (!file) {
            console.log('Background - No file provided');
            return Response.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
        }

        console.log('Background - File received:', file.name);
        console.log('Background - File type:', file.type);
        console.log('Background - File size:', file.size);

        // Validate file type
        if (!file.type.startsWith('image/')) {
            console.log('Background - Invalid file type');
            return Response.json({ error: 'Apenas arquivos de imagem são permitidos' }, { status: 400 });
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            console.log('Background - File too large');
            return Response.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 });
        }

        console.log('Background - Validations passed, creating upload directory...');

        // Create upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'backgrounds');
        console.log('Background - Upload directory:', uploadDir);

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }
        console.log('Background - Directory created/verified');

        // Generate unique filename
        const safeUserId = String(userId).replace(/[|@]/g, '_');
        console.log('Background - User ID for filename:', userId);
        console.log('Background - User ID:', userId);
        console.log('Background - Safe User ID:', safeUserId);

        const timestamp = Date.now();
        const fileExtension = path.extname(file.name) || '.jpg';
        const fileName = `${safeUserId}_${timestamp}${fileExtension}`;
        console.log('Background - Generated filename:', fileName);

        const filePath = path.join(uploadDir, fileName);
        console.log('Background - Full file path:', filePath);

        // Convert file to buffer and save
        console.log('Background - Converting file to buffer...');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log('Background - Buffer created, size:', buffer.length);

        console.log('Background - Writing file to disk...');
        await writeFile(filePath, buffer);
        console.log('Background - File written successfully');

        // Update user profile with new background URL
        const imageUrl = `/uploads/backgrounds/${fileName}`;

        // Get current profile
        const currentProfile = userProfiles.get(userId);
        if (currentProfile) {
            const updatedProfile = {
                ...currentProfile,
                backgroundImage: imageUrl
            };
            userProfiles.set(userId, updatedProfile);
            console.log('Background - Profile updated with new background:', imageUrl);
        }

        const result = {
            userId: safeUserId,
            fileName: fileName,
            fileSize: file.size,
            imageUrl: imageUrl,
            profileUpdated: true,
            profileData: userProfiles.get(userId)
        };

        console.log('Background upload completed:', result);
        return Response.json(result);

    } catch (error) {
        console.error('Background Upload API Error:', error);
        return Response.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}