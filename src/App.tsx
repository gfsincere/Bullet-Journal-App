import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider, useApp } from './context/AppContext'
import { NotebookConfig } from './components/NotebookConfig'
import { TemplateSidebar } from './components/TemplateSidebar'
import { DotGridCanvas } from './components/DotGridCanvas'
import type { TemplateDefinition } from './types'

function handleDragEnd(
  event: DragEndEvent,
  addPlacedTemplate: (t: { templateId: string; xDot: number; yDot: number; pageIndex?: number }) => void,
  canvasRef: React.RefObject<HTMLDivElement | null>,
  rightCanvasRef: React.RefObject<HTMLDivElement | null>,
  dotsWide: number,
  dotsTall: number
) {
  const { active, over } = event
  const overId = over?.id
  if (overId !== 'canvas' && overId !== 'canvas-left' && overId !== 'canvas-right') return
  const data = active.data.current
  if (!data || data.type !== 'template') return
  const template = data.template as TemplateDefinition
  if (!template) return

  const pageIndex = overId === 'canvas-right' ? 1 : 0
  const canvas = pageIndex === 1 ? rightCanvasRef.current : canvasRef.current
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

  addPlacedTemplate({ templateId: template.id, xDot, yDot, pageIndex })
}

function HeaderAuthWidget() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  if (loading) {
    return (
      <span className="text-sm text-slate-500 dark:text-slate-400">Loading…</span>
    )
  }
  if (!user) {
    return (
      <button
        type="button"
        onClick={() => signInWithGoogle()}
        className="rounded bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600 dark:bg-slate-200 dark:text-slate-800 dark:hover:bg-slate-300"
      >
        Login
      </button>
    )
  }
  return (
    <div className="flex items-center gap-2">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt=""
          referrerPolicy="no-referrer"
          className="h-8 w-8 shrink-0 rounded-full object-cover"
          title={user.email ?? undefined}
        />
      ) : (
        <span
          className="max-w-[180px] truncate text-sm text-slate-600 dark:text-slate-300"
          title={user.email ?? undefined}
        >
          {user.email ?? user.displayName ?? 'Signed in'}
        </span>
      )}
      <button
        type="button"
        onClick={() => signOut()}
        className="rounded bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
      >
        Sign out
      </button>
    </div>
  )
}

function BulletJournalApp() {
  const { user } = useAuth()
  const {
    addPlacedTemplate,
    canvasRef,
    rightCanvasRef,
    gridMetrics: { dotsWide, dotsTall },
    layoutMode,
    setLayoutMode,
    saveToStorage,
    loadFromStorage,
  } = useApp()
  const canSaveLoad = !!user

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const onDragEnd = (event: DragEndEvent) =>
    handleDragEnd(event, addPlacedTemplate, canvasRef, rightCanvasRef, dotsWide, dotsTall)

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-100 dark:bg-slate-900">
        <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Bullet Journal Planner
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-300">Layout:</span>
              <button
                type="button"
                onClick={() => setLayoutMode('one-page')}
                className={`rounded px-3 py-1.5 text-sm font-medium ${
                  layoutMode === 'one-page'
                    ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-800'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500'
                }`}
              >
                1 page
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('two-page')}
                className={`rounded px-3 py-1.5 text-sm font-medium ${
                  layoutMode === 'two-page'
                    ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-800'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500'
                }`}
              >
                2 pages
              </button>
              <button
                type="button"
                onClick={saveToStorage}
                disabled={!canSaveLoad}
                className={`rounded px-3 py-1.5 text-sm font-medium ${
                  canSaveLoad
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                }`}
              >
                Save layout
              </button>
              <button
                type="button"
                onClick={loadFromStorage}
                disabled={!canSaveLoad}
                className={`rounded px-3 py-1.5 text-sm font-medium ${
                  canSaveLoad
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                }`}
              >
                Load layout
              </button>
              <div className="ml-4 shrink-0 border-l border-slate-200 pl-4 dark:border-slate-600">
                <HeaderAuthWidget />
              </div>
            </div>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col p-4">
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
            <div className="min-h-0 min-w-0">
              <DotGridCanvas />
            </div>
            <aside className="flex min-h-0 flex-col gap-4 overflow-auto">
              <details className="group rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <summary className="cursor-pointer list-none select-none px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block transition-transform group-open:rotate-90">›</span>
                    Notebook
                  </span>
                </summary>
                <div className="border-t border-slate-200 px-4 pb-4 pt-2 dark:border-slate-600">
                  <NotebookConfig />
                </div>
              </details>
              <TemplateSidebar />
            </aside>
          </div>
        </main>
      </div>
    </DndContext>
  )
}

function AppContent() {
  const { loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">Loading…</p>
      </div>
    )
  }
  return (
    <AppProvider>
      <BulletJournalApp />
    </AppProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
