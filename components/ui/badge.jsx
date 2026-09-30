import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors [&_svg]:size-3', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      outline: 'text-foreground',
      glass: 'border-white/15 bg-black/55 text-white backdrop-blur-md',
      success: 'border-transparent bg-success/15 text-success',
      warning: 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400',
      destructive: 'border-transparent bg-destructive/15 text-destructive',
      muted: 'border-transparent bg-muted text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
})

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
