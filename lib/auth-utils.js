import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

export async function verifyToken(request) {
    try {
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (!token || token === 'null' || token === 'undefined') {
            return null
        }

        const decoded = jwt.verify(token, JWT_SECRET)
        return decoded
    } catch (error) {
        console.error('Token verification error:', error)
        return null
    }
}

export function getUserFromRequest(request) {
    return verifyToken(request)
}