import { NextResponse } from 'next/server';
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

export async function POST(request) {
    try {
        await connectToMongo();
        
        // Atualizar todos os usuários para ter o campo roles
        const result = await db.collection('users').updateMany(
            { roles: { $exists: false } },
            [
                {
                    $set: {
                        roles: { $cond: [{ $ifNull: ["$role", false] }, ["$role"], ["user"]] }
                    }
                }
            ]
        );
        
        console.log(`Updated ${result.modifiedCount} users with roles field`);
        
        return NextResponse.json({
            message: `Updated ${result.modifiedCount} users`,
            success: true
        });
        
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}