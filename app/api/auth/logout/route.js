import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // In a real implementation, you would:
        // 1. Get the token from the request
        // 2. Add the token to a blacklist in your database
        // 3. Or just rely on token expiration since we're using JWT

        return NextResponse.json({
            message: 'Logout realizado com sucesso'
        });

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}