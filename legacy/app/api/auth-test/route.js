import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Test route to verify authentication setup
        return NextResponse.json({
            success: true,
            message: "Authentication test route working",
            auth0_config: {
                issuer: process.env.AUTH0_ISSUER_BASE_URL ? "✅ Configured" : "❌ Missing",
                client_id: process.env.AUTH0_CLIENT_ID ? "✅ Configured" : "❌ Missing",
                base_url: process.env.AUTH0_BASE_URL ? "✅ Configured" : "❌ Missing",
                secret: process.env.AUTH0_SECRET ? "✅ Configured" : "❌ Missing"
            },
            login_url: `${process.env.AUTH0_BASE_URL}/api/auth/login`,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}