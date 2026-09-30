import { Suspense } from 'react'
import { ExploreView } from '@/components/explore/explore-view'

export const metadata = { title: 'Explorar' }

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreView />
    </Suspense>
  )
}
