import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

// MongoDB connection
let client;
let db;

async function connectToMongo() {
    if (!client) {
        client = new MongoClient(process.env.MONGO_URL);
        await client.connect();
        db = client.db(process.env.DB_NAME);
    }
    return db;
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function POST(request) {
    try {
        await connectToMongo();
        const { email, password } = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email e senha são obrigatórios' },
                { status: 400 }
            );
        }

        // Find user in database
        const user = await db.collection('users').findOne({ email });
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

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                roles: user.roles || [user.role || 'user'], // Incluir roles no JWT
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Update last login in database
        await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
        );

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        userWithoutPassword.id = user._id.toString();
        delete userWithoutPassword._id;

        // Garantir que o campo roles existe (compatibilidade com usuários antigos)
        if (!userWithoutPassword.roles && userWithoutPassword.role) {
            userWithoutPassword.roles = [userWithoutPassword.role];
        } else if (!userWithoutPassword.roles) {
            userWithoutPassword.roles = ['user'];
        }

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