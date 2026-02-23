import type { PlacedTemplate } from '../types'
import { TEMPLATE_DEFINITIONS } from '../data/templates'
import { useApp } from '../context/AppContext'

interface PlacedBlockProps {
  placed: PlacedTemplate
  spacingPx: number
  dotsWide: number
  dotsTall: number
}

export function PlacedBlock({
  placed,
  spacingPx,
}: PlacedBlockProps) {
  const { removePlacedTemplate } = useApp()
  const def = TEMPLATE_DEFINITIONS.find((t) => t.id === placed.templateId)
  if (!def) return null

  const left = placed.xDot * spacingPx
  const top = placed.yDot * spacingPx
  const width = def.widthDots * spacingPx
  const height = def.heightDots * spacingPx

  return (
    <div
      className="absolute rounded border-2 border-amber-400/80 bg-amber-50/90 shadow-sm dark:border-amber-500/80 dark:bg-amber-950/50"
      style={{
        left,
        top,
        width,
        height,
        zIndex: placed.zIndex,
      }}
    >
      <div className="flex h-full flex-col p-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-xs font-medium text-amber-900 dark:text-amber-200">
            {def.name}
          </span>
          <button
            type="button"
            onClick={() => removePlacedTemplate(placed.id)}
            className="rounded px-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-200"
            aria-label="Remove"
          >
            ×
          </button>
        </div>
        <div className="mt-auto text-[10px] text-slate-500 dark:text-slate-400">
          {def.widthDots}×{def.heightDots}
        </div>
      </div>
    </div>
  )
}
