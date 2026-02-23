import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { AppProvider, useApp } from './context/AppContext'
import { NotebookConfig } from './components/NotebookConfig'
import { TemplateSidebar } from './components/TemplateSidebar'
import { DotGridCanvas } from './components/DotGridCanvas'
import type { TemplateDefinition } from './types'

function handleDragEnd(
  event: DragEndEvent,
  addPlacedTemplate: (t: { templateId: string; xDot: number; yDot: number }) => void,
  canvasRef: React.RefObject<HTMLDivElement | null>,
  dotsWide: number,
  dotsTall: number
) {
  const { active, over } = event
  if (over?.id !== 'canvas') return
  const data = active.data.current
  if (!data || data.type !== 'template') return
  const template = data.template as TemplateDefinition
  if (!template) return

  const canvas = canvasRef.current
  if (!canvas) return

  const rect = active.rect.current.translated
  if (!rect) return

  const canvasRect = canvas.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const relX = centerX - canvasRect.left
  const relY = centerY - canvasRect.top
  const scaleX = dotsWide / canvasRect.width
  const scaleY = dotsTall / canvasRect.height
  let xDot = Math.floor(relX * scaleX)
  let yDot = Math.floor(relY * scaleY)
  xDot = Math.max(0, Math.min(xDot, dotsWide - template.widthDots))
  yDot = Math.max(0, Math.min(yDot, dotsTall - template.heightDots))

  addPlacedTemplate({ templateId: template.id, xDot, yDot })
}

function BulletJournalApp() {
  const {
    addPlacedTemplate,
    canvasRef,
    gridMetrics: { dotsWide, dotsTall },
    saveToStorage,
    loadFromStorage,
  } = useApp()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const onDragEnd = (event: DragEndEvent) =>
    handleDragEnd(event, addPlacedTemplate, canvasRef, dotsWide, dotsTall)

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <header className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Bullet Journal Planner
            </h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveToStorage}
                className="rounded bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
              >
                Save layout
              </button>
              <button
                type="button"
                onClick={loadFromStorage}
                className="rounded bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
              >
                Load layout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr_280px]">
            <aside className="space-y-4">
              <NotebookConfig />
            </aside>
            <div className="min-w-0">
              <DotGridCanvas />
            </div>
            <aside>
              <TemplateSidebar />
            </aside>
          </div>
        </main>
      </div>
    </DndContext>
  )
}

function App() {
  return (
    <AppProvider>
      <BulletJournalApp />
    </AppProvider>
  )
}

export default App
