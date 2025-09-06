// API para upload de avatar do usuário
import { getSession } from '@auth0/nextjs-auth0';
import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(req) {
    try {
        const session = await getSession(req);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        const formData = await req.formData();
        const file = formData.get('image');

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: 'Nenhuma imagem foi enviada' },
                { status: 400 }
            );
        }

        // Validações
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.' },
                { status: 400 }
            );
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'Arquivo muito grande. Máximo 5MB.' },
                { status: 400 }
            );
        }

        // Criar diretório de uploads se não existir
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            // Diretório já existe
        }

        // Gerar nome único para o arquivo
        const fileExtension = path.extname(file.name);
        const fileName = `${user.sub.replace('|', '_')}_${Date.now()}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // Salvar arquivo
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // URL pública da imagem
        const imageUrl = `/uploads/avatars/${fileName}`;

        // Aqui você atualizaria o Auth0 com a nova imagem
        // Por enquanto, vamos simular

        /*
        const auth0ManagementToken = await getAuth0ManagementToken();
        
        const updatePayload = {
            picture: `${process.env.NEXTAUTH_URL}${imageUrl}`
        };

        const response = await fetch(`https://YOUR_DOMAIN.auth0.com/api/v2/users/${user.sub}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${auth0ManagementToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatePayload)
        });

        if (!response.ok) {
            throw new Error('Falha ao atualizar avatar no Auth0');
        }
        */

        console.log('Avatar upload completed:', {
            userId: user.sub,
            fileName,
            fileSize: file.size,
            imageUrl
        });

        return NextResponse.json({
            success: true,
            message: 'Avatar atualizado com sucesso',
            imageUrl,
            fileName
        });

    } catch (error) {
        console.error('Avatar upload error:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
