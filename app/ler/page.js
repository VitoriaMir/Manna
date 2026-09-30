import { Suspense } from 'react'
import { ReaderView } from '@/components/reader/reader-view'

export const metadata = { title: 'Leitor' }

export default function ReaderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950" />}>
      <ReaderView />
    </Suspense>
  )
}
