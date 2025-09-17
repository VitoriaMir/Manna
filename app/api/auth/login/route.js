import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Simple in-memory user store (same as register)
const users = new Map();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Add a demo user for testing
if (users.size === 0) {
    const demoPassword = bcrypt.hashSync('123456789', 12);
    users.set('demo@manna.com', {
        id: 'demo-user',
        email: 'demo@manna.com',
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
        password: demoPassword,
        roles: ['reader', 'creator'],
        createdAt: new Date().toISOString(),
        avatar: null,
        isActive: true
    });
}

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email e senha são obrigatórios' },
                { status: 400 }
            );
        }

        // Find user
        const user = users.get(email);
        if (!user) {
            return NextResponse.json(
                { message: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json(
                { message: 'Conta desativada' },
                { status: 403 }
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                roles: user.roles
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Update last login
        user.lastLogin = new Date().toISOString();

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            message: 'Login realizado com sucesso',
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}