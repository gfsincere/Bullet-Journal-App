import { useDraggable } from '@dnd-kit/core'
import { TEMPLATE_DEFINITIONS } from '../data/templates'
import type { TemplateDefinition } from '../types'

function DraggableTemplateCard({ template }: { template: TemplateDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template-${template.id}`,
    data: { type: 'template', template },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
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
        Drag onto the grid to add. Snaps to dots.
      </p>
      <div className="space-y-2">
        {TEMPLATE_DEFINITIONS.map((t) => (
          <DraggableTemplateCard key={t.id} template={t} />
        ))}
      </div>
    </section>
  )
}
