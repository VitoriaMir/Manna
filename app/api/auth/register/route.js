import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Simple in-memory user store (in production, use a real database)
const users = new Map();

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function POST(request) {
    try {
        const { email, password, username, firstName, lastName } = await request.json();

        // Validate input
        if (!email || !password || !username || !firstName || !lastName) {
            return NextResponse.json(
                { message: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        // Check if user already exists
        if (users.has(email)) {
            return NextResponse.json(
                { message: 'Email já está em uso' },
                { status: 400 }
            );
        }

        // Check username uniqueness
        for (const [, userData] of users) {
            if (userData.username === username) {
                return NextResponse.json(
                    { message: 'Nome de usuário já está em uso' },
                    { status: 400 }
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = {
            id: Date.now().toString(),
            email,
            username,
            firstName,
            lastName,
            password: hashedPassword,
            roles: ['reader'], // Default role
            createdAt: new Date().toISOString(),
            avatar: null,
            isActive: true
        };

        // Store user
        users.set(email, newUser);

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({
            message: 'Conta criada com sucesso',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}