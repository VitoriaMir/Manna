import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

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

export async function GET(request) {
    try {
        await connectToMongo();
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

            // Find user in database
            const user = await db.collection('users').findOne({
                _id: new ObjectId(decoded.userId)
            });

            if (!user) {
                return NextResponse.json(
                    { message: 'Usuário não encontrado' },
                    { status: 401 }
                );
            }

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