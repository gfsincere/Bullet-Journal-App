import { useDraggable } from '@dnd-kit/core'
import { TEMPLATE_DEFINITIONS } from '../data/templates'
import type { TemplateDefinition } from '../types'
import { useApp } from '../context/AppContext'

function DraggableTemplateCard({ template }: { template: TemplateDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template-${template.id}`,
    data: { type: 'template', template },
  })
  const { addPlacedTemplate, gridMetrics } = useApp()

  const handleClick = () => {
    // Place at a default position for testing
    const xDot = Math.floor(Math.random() * Math.max(1, gridMetrics.dotsWide - template.widthDots))
    const yDot = Math.floor(Math.random() * Math.max(1, gridMetrics.dotsTall - template.heightDots))
    addPlacedTemplate({ templateId: template.id, xDot, yDot })
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onDoubleClick={handleClick}
      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition active:cursor-grabbing dark:border-slate-600 dark:bg-slate-800 ${
        isDragging ? 'opacity-60' : 'hover:border-slate-300 hover:shadow dark:hover:border-slate-500'
      }`}
    >
      <div className="font-medium text-slate-800 dark:text-slate-100">
        {template.name}
      </div>
      {template.description && (
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {template.description}
        </div>
      )}
      <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        {template.widthDots}×{template.heightDots} dots
      </div>
    </div>
  )
}

export function TemplateSidebar() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Templates
      </h2>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Drag onto the grid to add. Snaps to dots. Double-click to place at random position.
      </p>
      <div className="space-y-2">
        {TEMPLATE_DEFINITIONS.map((t) => (
          <DraggableTemplateCard key={t.id} template={t} />
        ))}
      </div>
    </section>
  )
}
