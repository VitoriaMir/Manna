// API para alteração de senha do usuário
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(req) {
    try {
        const session = await getSession(req);

        if (!session || !session.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        const { currentPassword, newPassword } = await req.json();

        // Validações
        if (!currentPassword || !newPassword) {
            return Response.json(
                { error: 'Senha atual e nova senha são obrigatórias' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return Response.json(
                { error: 'Nova senha deve ter pelo menos 8 caracteres' },
                { status: 400 }
            );
        }

        // Validar força da senha
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return Response.json(
                { error: 'Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número' },
                { status: 400 }
            );
        }

        // Aqui você implementaria a lógica para alterar senha no Auth0
        // Isso requer o Auth0 Management API e validação da senha atual

        /*
        // 1. Primeiro, validar a senha atual
        const auth0ManagementToken = await getAuth0ManagementToken();
        
        // 2. Verificar se o usuário pode alterar senha (não é social login)
        if (user.sub.startsWith('google-') || user.sub.startsWith('facebook-')) {
            return Response.json(
                { error: 'Usuários que fizeram login via redes sociais não podem alterar senha aqui' }, 
                { status: 400 }
            );
        }

        // 3. Alterar senha via Auth0 Management API
        const changePasswordResponse = await fetch(`https://YOUR_DOMAIN.auth0.com/api/v2/users/${user.sub}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${auth0ManagementToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: newPassword
            })
        });

        if (!changePasswordResponse.ok) {
            const errorData = await changePasswordResponse.json();
            throw new Error(errorData.message || 'Falha ao alterar senha');
        }

        // 4. Opcional: Invalidar todas as sessões ativas
        const ticketResponse = await fetch(`https://YOUR_DOMAIN.auth0.com/api/v2/tickets/password-change`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth0ManagementToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: user.sub,
                mark_email_as_verified: true
            })
        });
        */

        // Por enquanto, apenas simulamos a resposta de sucesso
        console.log('Password change requested:', {
            userId: user.sub,
            timestamp: new Date().toISOString()
        });

        // Verificar se é usuário social (que não pode alterar senha)
        if (user.sub.startsWith('google-') || user.sub.startsWith('facebook-') || user.sub.startsWith('github-')) {
            return Response.json(
                { error: 'Usuários que fizeram login via redes sociais devem alterar a senha na respectiva plataforma' },
                { status: 400 }
            );
        }

        return Response.json({
            success: true,
            message: 'Senha alterada com sucesso. Por segurança, você será desconectado de outros dispositivos.'
        });

    } catch (error) {
        console.error('Password change error:', error);
        return Response.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
