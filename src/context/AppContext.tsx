import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { LayoutMode, PageConfig, PlacedTemplate, GridMetrics, RotationDegrees } from '../types'
import { DEFAULT_PAGE_CONFIG, STORAGE_KEY } from '../constants'
import { computeGridMetrics } from '../utils/grid'
import { useAuth } from './AuthContext'
import { getLayout, setLayout } from '../lib/layoutStorage'

interface AppState {
  pageConfig: PageConfig
  placedTemplates: PlacedTemplate[]
  gridMetrics: GridMetrics
  layoutMode: LayoutMode
}

interface AppContextValue extends AppState {
  setPageConfig: (config: PageConfig) => void
  setPlacedTemplates: (templates: PlacedTemplate[] | ((prev: PlacedTemplate[]) => PlacedTemplate[])) => void
  addPlacedTemplate: (template: Omit<PlacedTemplate, 'id' | 'zIndex'>) => void
  removePlacedTemplate: (id: string) => void
  setPlacedTemplateRotation: (id: string, rotation: RotationDegrees) => void
  setLayoutMode: (mode: LayoutMode) => void
  loadFromStorage: () => void
  saveToStorage: () => void
  canvasRef: React.RefObject<HTMLDivElement | null>
  rightCanvasRef: React.RefObject<HTMLDivElement | null>
}

const AppContext = createContext<AppContextValue | null>(null)

function migratePageConfig(raw: Record<string, unknown>): PageConfig {
  const c = raw as Record<string, number>
  if ('dotsWide' in c && 'dotsTall' in c && typeof c.dotsWide === 'number' && typeof c.dotsTall === 'number') {
    const base: PageConfig = {
      preset: (raw.preset as PageConfig['preset']) ?? 'A5',
      widthMm: Number(c.widthMm) || 148,
      heightMm: Number(c.heightMm) || 210,
      dotsWide: Math.max(1, Math.floor(c.dotsWide)),
      dotsTall: Math.max(1, Math.floor(c.dotsTall)),
    }
    if (c.marginLeftMm != null && c.marginRightMm != null && c.marginTopMm != null && c.marginBottomMm != null) {
      base.marginLeftMm = Math.max(0, Number(c.marginLeftMm))
      base.marginRightMm = Math.max(0, Number(c.marginRightMm))
      base.marginTopMm = Math.max(0, Number(c.marginTopMm))
      base.marginBottomMm = Math.max(0, Number(c.marginBottomMm))
    }
    return base
  }
  if ('dotSpacingMm' in c && c.dotSpacingMm) {
    const w = Number(c.widthMm) || 148
    const h = Number(c.heightMm) || 210
    const ml = Number(c.marginLeftMm) ?? 10
    const mr = Number(c.marginRightMm) ?? 10
    const mt = Number(c.marginTopMm) ?? 10
    const mb = Number(c.marginBottomMm) ?? 10
    const spacing = Number(c.dotSpacingMm) || 5
    const dotsWide = Math.max(1, Math.floor((w - ml - mr) / spacing))
    const dotsTall = Math.max(1, Math.floor((h - mt - mb) / spacing))
    return {
      preset: (raw.preset as PageConfig['preset']) ?? 'A5',
      widthMm: w,
      heightMm: h,
      dotsWide,
      dotsTall,
    }
  }
  return {
    preset: 'A5',
    widthMm: 148,
    heightMm: 210,
    dotsWide: 29,
    dotsTall: 42,
  }
}

function migratePlacedTemplate(p: PlacedTemplate): PlacedTemplate {
  let out: PlacedTemplate = { ...p }
  const rot = p.rotation
  if (rot !== 0 && rot !== 90 && rot !== 180 && rot !== 270) out = { ...out, rotation: 0 }
  if (p.pageIndex !== 0 && p.pageIndex !== 1) out = { ...out, pageIndex: 0 }
  return out
}

function loadStored(): {
  pageConfig: PageConfig
  placedTemplates: PlacedTemplate[]
  layoutMode: LayoutMode
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as {
      pageConfig?: Record<string, unknown>
      placedTemplates?: PlacedTemplate[]
      layoutMode?: LayoutMode
    }
    if (data?.pageConfig && Array.isArray(data?.placedTemplates))
      return {
        pageConfig: migratePageConfig(data.pageConfig),
        placedTemplates: data.placedTemplates.map(migratePlacedTemplate),
        layoutMode: data.layoutMode === 'two-page' ? 'two-page' : 'one-page',
      }
  } catch {
    // ignore
  }
  return null
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const userId = user?.uid ?? null
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const rightCanvasRef = useRef<HTMLDivElement | null>(null)
  const [pageConfig, setPageConfigState] = useState<PageConfig>(DEFAULT_PAGE_CONFIG)
  const [placedTemplates, setPlacedTemplates] = useState<PlacedTemplate[]>([])
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>('one-page')

  useEffect(() => {
    if (!userId) return
    getLayout(userId).then((data) => {
      if (data) {
        setPageConfigState(migratePageConfig(data.pageConfig as unknown as Record<string, unknown>))
        setPlacedTemplates(data.placedTemplates.map(migratePlacedTemplate))
        setLayoutModeState(data.layoutMode === 'two-page' ? 'two-page' : 'one-page')
      } else {
        const local = loadStored()
        if (local) {
          setPageConfigState(local.pageConfig)
          setPlacedTemplates(local.placedTemplates)
          setLayoutModeState(local.layoutMode)
        }
      }
    })
  }, [userId])

  const gridMetrics = useMemo(
    () => computeGridMetrics(pageConfig),
    [pageConfig]
  )

  const setPageConfig = useCallback((config: PageConfig) => {
    setPageConfigState(config)
  }, [])

  const addPlacedTemplate = useCallback(
    (template: Omit<PlacedTemplate, 'id' | 'zIndex'>) => {
      setPlacedTemplates((prev) => {
        const maxZ = prev.reduce((m, p) => Math.max(m, p.zIndex), 0)
        return [
          ...prev,
          {
            ...template,
            rotation: template.rotation ?? 0,
            pageIndex: template.pageIndex ?? 0,
            id: `placed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            zIndex: maxZ + 1,
          },
        ]
      })
    },
    []
  )

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    setLayoutModeState(mode)
  }, [])

  const removePlacedTemplate = useCallback((id: string) => {
    setPlacedTemplates((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setPlacedTemplateRotation = useCallback((id: string, rotation: RotationDegrees) => {
    setPlacedTemplates((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation } : p))
    )
  }, [])

  const saveToStorage = useCallback(async () => {
    if (!userId) return
    try {
      await setLayout(userId, { pageConfig, placedTemplates, layoutMode })
    } catch {
      // ignore
    }
  }, [userId, pageConfig, placedTemplates, layoutMode])

  const loadFromStorage = useCallback(async () => {
    if (!userId) return
    try {
      const data = await getLayout(userId)
      if (data) {
        setPageConfigState(migratePageConfig(data.pageConfig as unknown as Record<string, unknown>))
        setPlacedTemplates(data.placedTemplates.map(migratePlacedTemplate))
        setLayoutModeState(data.layoutMode === 'two-page' ? 'two-page' : 'one-page')
      }
    } catch {
      // ignore
    }
  }, [userId])

  const value = useMemo<AppContextValue>(
    () => ({
      pageConfig,
      placedTemplates,
      gridMetrics,
      layoutMode,
      setPageConfig,
      setPlacedTemplates,
      addPlacedTemplate,
      removePlacedTemplate,
      setPlacedTemplateRotation,
      setLayoutMode,
      loadFromStorage,
      saveToStorage,
      canvasRef,
      rightCanvasRef,
    }),
    [
      pageConfig,
      placedTemplates,
      gridMetrics,
      layoutMode,
      setPageConfig,
      addPlacedTemplate,
      removePlacedTemplate,
      setPlacedTemplateRotation,
      setLayoutMode,
      loadFromStorage,
      saveToStorage,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
