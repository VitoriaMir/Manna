'use client'

import { ThemeProvider, useTheme } from 'next-themes'
import { Toaster } from 'sonner'

function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  return <Toaster theme={resolvedTheme === 'light' ? 'light' : 'dark'} position="top-center" richColors closeButton />
}

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
      <ThemedToaster />
    </ThemeProvider>
  )
}
