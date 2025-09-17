import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { CustomAuthProvider } from '@/components/providers/CustomAuthProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Manna - Leia, publique e descubra manhwas',
    description: 'Plataforma de leitura e publicação de manhwas com experiência de leitura contínua',
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={inter.className}>
                <CustomAuthProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                    </ThemeProvider>
                </CustomAuthProvider>
            </body>
        </html>
    )
}