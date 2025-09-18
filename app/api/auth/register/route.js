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

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function POST(request) {
    try {
        await connectToMongo();
        const { email, password, username, firstName, lastName, role } = await request.json();

        // Validate input
        if (!email || !password || !username || !firstName || !lastName) {
            return NextResponse.json(
                { message: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'Email já está em uso' },
                { status: 400 }
            );
        }

        // Check username uniqueness
        const existingUsername = await db.collection('users').findOne({ username });
        if (existingUsername) {
            return NextResponse.json(
                { message: 'Nome de usuário já está em uso' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = {
            email,
            username,
            name: `${firstName} ${lastName}`,
            password: hashedPassword,
            role: role || 'user', // Usar role fornecido ou default 'user'
            roles: [role || 'user'], // Adicionar array de roles para compatibilidade
            createdAt: new Date(),
            avatar: null,
            backgroundImage: null, // Usuário pode fazer upload personalizado posteriormente
            preferences: {
                favoriteGenres: [],
                readingHistory: [],
                bookmarks: []
            }
        };

        // Store user in database
        const result = await db.collection('users').insertOne(newUser);

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: result.insertedId.toString(),
                email: newUser.email,
                role: newUser.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        userWithoutPassword.id = result.insertedId.toString();

        return NextResponse.json({
            message: 'Conta criada com sucesso',
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}