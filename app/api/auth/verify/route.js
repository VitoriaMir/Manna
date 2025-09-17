import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Simple in-memory user store (same reference as other auth files)
const users = new Map();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Token de acesso não fornecido' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        try {
            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Find user
            const user = users.get(decoded.email);
            if (!user || !user.isActive) {
                return NextResponse.json(
                    { message: 'Usuário não encontrado ou inativo' },
                    { status: 401 }
                );
            }

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;

            return NextResponse.json({
                valid: true,
                user: userWithoutPassword
            });

        } catch (jwtError) {
            return NextResponse.json(
                { message: 'Token inválido' },
                { status: 401 }
            );
        }

    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}