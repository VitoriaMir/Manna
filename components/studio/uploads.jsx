'use client'

import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MediaImage } from '@/components/ui/misc'
import { saveImage } from '@/lib/media'
import { cn } from '@/lib/utils'

function useDropzone(onFiles) {
  const [over, setOver] = useState(false)
  return {
    over,
    props: {
      onDragOver: (e) => {
        e.preventDefault()
        setOver(true)
      },
      onDragLeave: () => setOver(false),
      onDrop: (e) => {
        e.preventDefault()
        setOver(false)
        const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'))
        if (files.length) onFiles(files)
      },
    },
  }
}

export function CoverUpload({ value, onChange }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)

  const handle = async ([file]) => {
    if (!file) return
    setBusy(true)
    try {
      onChange(await saveImage(file, { maxWidth: 900, quality: 0.85 }))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }
  const drop = useDropzone(handle)

  return (
    <div
      {...drop.props}
      className={cn(
        'relative flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-muted/40 text-center transition',
        drop.over ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
      )}
      onClick={() => input.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
      aria-label="Enviar capa"
    >
      {value ? (
        <>
          <MediaImage src={value} alt="Capa" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-x-3 bottom-3 rounded-lg bg-black/70 px-3 py-2 text-xs font-medium text-white backdrop-blur">Clique ou arraste para trocar</span>
        </>
      ) : (
        <div className="space-y-2 p-6 text-muted-foreground">
          <ImagePlus className="mx-auto h-8 w-8" />
          <p className="text-sm font-medium text-foreground">Enviar capa</p>
          <p className="text-xs">Proporção 3:4 · JPG, PNG ou WebP</p>
        </div>
      )}
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => handle([...e.target.files])} />
    </div>
  )
}

export function PagesUpload({ pages, onChange }) {
  const input = useRef(null)
  const [progress, setProgress] = useState(null)

  const handle = async (files) => {
    // Ordena por nome para respeitar a numeração dos arquivos (01.jpg, 02.jpg…).
    const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    const refs = []
    setProgress({ done: 0, total: sorted.length })
    for (const file of sorted) {
      try {
        refs.push(await saveImage(file, { maxWidth: 1000, quality: 0.85 }))
      } catch (error) {
        toast.error(`${file.name}: ${error.message}`)
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }))
    }
    setProgress(null)
    onChange([...pages, ...refs])
    if (refs.length) toast.success(`${refs.length} ${refs.length === 1 ? 'página adicionada' : 'páginas adicionadas'}`)
  }
  const drop = useDropzone(handle)

  const move = (i, dir) => {
    const next = [...pages]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <div
        {...drop.props}
        onClick={() => input.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition',
          drop.over ? 'border-primary bg-primary/10' : 'bg-muted/40 hover:border-primary/50'
        )}
      >
        {progress ? (
          <>
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm font-medium">
              Otimizando {progress.done}/{progress.total}…
            </p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
          </>
        ) : (
          <>
            <UploadCloud className="h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-medium">Arraste as páginas ou clique para escolher</p>
            <p className="text-xs text-muted-foreground">Várias imagens de uma vez · ordenadas pelo nome do arquivo · otimizadas no navegador</p>
          </>
        )}
        <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handle([...e.target.files])} />
      </div>

      {pages.length > 0 && (
        <ol className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {pages.map((ref, i) => (
            <li key={ref} className="group relative overflow-hidden rounded-xl border bg-muted">
              <MediaImage src={ref} alt={`Página ${i + 1}`} className="aspect-[3/4] w-full object-cover object-top" />
              <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white">{i + 1}</span>
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-black/80 p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <Button type="button" size="icon-sm" variant="glass" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover para cima">
                  <ArrowUp />
                </Button>
                <Button type="button" size="icon-sm" variant="glass" onClick={() => move(i, 1)} disabled={i === pages.length - 1} aria-label="Mover para baixo">
                  <ArrowDown />
                </Button>
                <Button type="button" size="icon-sm" variant="glass" onClick={() => onChange(pages.filter((_, j) => j !== i))} aria-label="Remover página" className="hover:bg-red-500/60">
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
