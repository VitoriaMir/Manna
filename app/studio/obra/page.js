import { Suspense } from 'react'
import { SeriesEditor } from '@/components/studio/series-editor'

export const metadata = { title: 'Editar série' }

export default function SeriesEditorPage() {
  return (
    <Suspense>
      <SeriesEditor />
    </Suspense>
  )
}
