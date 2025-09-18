'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BibliotecaPage() {
    const router = useRouter()

    useEffect(() => {
        // Redireciona para a página principal com a biblioteca ativa
        router.push('/?view=library')
    }, [router])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
    )
}