import { useDroppable } from '@dnd-kit/core'
import { useApp } from '../context/AppContext'
import { PlacedBlock } from './PlacedBlock'

const DOT_RADIUS = 1.2

export function DotGridCanvas() {
  const { gridMetrics, placedTemplates, canvasRef } = useApp()

  const { dotsWide, dotsTall } = gridMetrics
  const scale = 2
  const spacingPx = scale * 4
  const widthPx = dotsWide * spacingPx
  const heightPx = dotsTall * spacingPx

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
    data: { widthPx, heightPx, spacingPx, dotsWide, dotsTall },
  })

  return (
    <div
      ref={setNodeRef}
      className="relative overflow-auto rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800"
      style={{
        minHeight: 320,
        maxHeight: '70vh',
      }}
    >
      <div
        ref={canvasRef}
        className="relative mx-auto my-4"
        style={{
          width: widthPx,
          height: heightPx,
          background: isOver ? 'rgba(59, 130, 246, 0.08)' : undefined,
        }}
      >
        <svg
          width={widthPx}
          height={heightPx}
          className="absolute inset-0"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <pattern
              id="dot-pattern"
              width={spacingPx}
              height={spacingPx}
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx={spacingPx / 2}
                cy={spacingPx / 2}
                r={DOT_RADIUS}
                fill="rgba(0,0,0,0.2)"
                className="dark:fill-slate-500"
              />
            </pattern>
          </defs>
          <rect width={widthPx} height={heightPx} fill="url(#dot-pattern)" />
        </svg>
        {placedTemplates.map((placed) => (
          <PlacedBlock
            key={placed.id}
            placed={placed}
            spacingPx={spacingPx}
            dotsWide={dotsWide}
            dotsTall={dotsTall}
          />
        ))}
      </div>
    </div>
  )
}
