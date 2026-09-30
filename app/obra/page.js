import { Suspense } from 'react'
import { SeriesView } from '@/components/manhwa/series-view'

export const metadata = { title: 'Obra' }

export default function SeriesPage() {
  return (
    <Suspense>
      <SeriesView />
    </Suspense>
  )
}
