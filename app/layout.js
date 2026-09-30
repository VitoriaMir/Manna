import { Inter, Fraunces } from 'next/font/google'
import { Providers } from '@/components/providers'
import { asset } from '@/lib/utils'
import './globals.css'

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const display = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap', axes: ['SOFT', 'opsz'] })

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://vitoriamir.github.io'),
  title: {
    default: 'Manna — Leia, publique e descubra manhwas',
    template: '%s · Manna',
  },
  description:
    'Plataforma de leitura e publicação de manhwas: leitor vertical estilo webtoon, biblioteca pessoal, Creator Studio para autores e fluxo de moderação.',
  applicationName: 'Manna',
  keywords: ['manhwa', 'webtoon', 'leitura', 'quadrinhos', 'creator studio', 'next.js'],
  icons: {
    icon: [{ url: asset('/favicon.svg'), type: 'image/svg+xml' }, { url: asset('/images/logo-192.png'), sizes: '192x192' }],
    apple: asset('/images/logo-192.png'),
  },
  manifest: asset('/site.webmanifest'),
  openGraph: {
    title: 'Manna — Leia, publique e descubra manhwas',
    description: 'Leitor vertical, biblioteca, Creator Studio e moderação em uma só plataforma.',
    images: [asset('/images/logo-512.png')],
    locale: 'pt_BR',
    type: 'website',
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#120d0a' },
    { media: '(prefers-color-scheme: light)', color: '#faf6f0' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
