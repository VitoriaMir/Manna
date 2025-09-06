// API para atualizar configurações do perfil do usuário
import { getSession } from '@auth0/nextjs-auth0';

export async function PUT(req) {
    try {
        const session = await getSession(req);

        if (!session || !session.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        const body = await req.json();

        // Validar dados de entrada
        const allowedFields = ['name', 'nickname', 'bio', 'location', 'phone'];
        const updateData = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        // Validações específicas
        if (updateData.phone) {
            // Remover caracteres não numéricos para validação
            const phoneNumbers = updateData.phone.replace(/\D/g, '');
            if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
                return Response.json(
                    { error: 'Telefone deve ter 10 ou 11 dígitos' },
                    { status: 400 }
                );
            }
        }

        // Aqui você faria a atualização no Auth0 Management API
        // Por enquanto, vamos simular a atualização

        // Exemplo de como seria com Auth0 Management API:
        /*
        const auth0ManagementToken = await getAuth0ManagementToken();
        
        const updatePayload = {
            name: updateData.name,
            nickname: updateData.nickname,
            user_metadata: {
                bio: updateData.bio,
                location: updateData.location,
                phone_number: updateData.phone,
                updated_at: new Date().toISOString()
            }
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
            throw new Error('Falha ao atualizar perfil no Auth0');
        }
        */

        // Por enquanto, apenas simulamos a resposta de sucesso
        console.log('Profile update requested:', {
            userId: user.sub,
            updates: updateData
        });

        return Response.json({
            success: true,
            message: 'Perfil atualizado com sucesso',
            updatedFields: Object.keys(updateData)
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return Response.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
