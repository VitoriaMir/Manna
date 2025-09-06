// API para alteração de email do usuário
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(req) {
    try {
        const session = await getSession(req);

        if (!session || !session.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        const { newEmail, password } = await req.json();

        // Validações
        if (!newEmail || !password) {
            return Response.json(
                { error: 'Novo email e senha são obrigatórios' },
                { status: 400 }
            );
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return Response.json(
                { error: 'Formato de email inválido' },
                { status: 400 }
            );
        }

        // Verificar se o novo email é diferente do atual
        if (newEmail.toLowerCase() === user.email?.toLowerCase()) {
            return Response.json(
                { error: 'O novo email deve ser diferente do atual' },
                { status: 400 }
            );
        }

        // Verificar se é usuário social (que não pode alterar email aqui)
        if (user.sub.startsWith('google-') || user.sub.startsWith('facebook-') || user.sub.startsWith('github-')) {
            return Response.json(
                { error: 'Usuários que fizeram login via redes sociais devem alterar o email na respectiva plataforma' },
                { status: 400 }
            );
        }

        // Aqui você implementaria a lógica para alterar email no Auth0
        /*
        const auth0ManagementToken = await getAuth0ManagementToken();

        // 1. Verificar se o email já está em uso
        const existingUserResponse = await fetch(
            `https://YOUR_DOMAIN.auth0.com/api/v2/users-by-email?email=${encodeURIComponent(newEmail)}`,
            {
                headers: {
                    'Authorization': `Bearer ${auth0ManagementToken}`
                }
            }
        );

        if (existingUserResponse.ok) {
            const existingUsers = await existingUserResponse.json();
            if (existingUsers.length > 0) {
                return Response.json(
                    { error: 'Este email já está sendo usado por outra conta' }, 
                    { status: 400 }
                );
            }
        }

        // 2. Atualizar email no Auth0
        const updateResponse = await fetch(`https://YOUR_DOMAIN.auth0.com/api/v2/users/${user.sub}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${auth0ManagementToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: newEmail,
                email_verified: false // Requer nova verificação
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Falha ao atualizar email');
        }

        // 3. Enviar email de verificação
        const verificationResponse = await fetch(`https://YOUR_DOMAIN.auth0.com/api/v2/jobs/verification-email`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth0ManagementToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: user.sub
            })
        });

        if (!verificationResponse.ok) {
            console.error('Failed to send verification email');
        }
        */

        // Por enquanto, apenas simulamos a resposta
        console.log('Email change requested:', {
            userId: user.sub,
            currentEmail: user.email,
            newEmail: newEmail,
            timestamp: new Date().toISOString()
        });

        return Response.json({
            success: true,
            message: 'Solicitação de alteração de email enviada. Verifique seu novo email para confirmar a alteração.',
            details: {
                oldEmail: user.email,
                newEmail: newEmail,
                requiresVerification: true
            }
        });

    } catch (error) {
        console.error('Email change error:', error);
        return Response.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
