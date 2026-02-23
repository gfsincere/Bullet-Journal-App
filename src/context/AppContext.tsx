import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { PageConfig, PlacedTemplate, GridMetrics } from '../types'
import { DEFAULT_PAGE_CONFIG, STORAGE_KEY } from '../constants'
import { computeGridMetrics } from '../utils/grid'

interface AppState {
  pageConfig: PageConfig
  placedTemplates: PlacedTemplate[]
  gridMetrics: GridMetrics
}

interface AppContextValue extends AppState {
  setPageConfig: (config: PageConfig) => void
  setPlacedTemplates: (templates: PlacedTemplate[] | ((prev: PlacedTemplate[]) => PlacedTemplate[])) => void
  addPlacedTemplate: (template: Omit<PlacedTemplate, 'id' | 'zIndex'>) => void
  removePlacedTemplate: (id: string) => void
  loadFromStorage: () => void
  saveToStorage: () => void
  canvasRef: React.RefObject<HTMLDivElement | null>
}

const AppContext = createContext<AppContextValue | null>(null)

function migratePageConfig(raw: Record<string, unknown>): PageConfig {
  const c = raw as Record<string, number>
  if ('dotsWide' in c && 'dotsTall' in c && typeof c.dotsWide === 'number' && typeof c.dotsTall === 'number') {
    return {
      preset: (raw.preset as PageConfig['preset']) ?? 'A5',
      widthMm: Number(c.widthMm) || 148,
      heightMm: Number(c.heightMm) || 210,
      dotsWide: Math.max(1, Math.floor(c.dotsWide)),
      dotsTall: Math.max(1, Math.floor(c.dotsTall)),
    }
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

function loadStored(): { pageConfig: PageConfig; placedTemplates: PlacedTemplate[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { pageConfig?: Record<string, unknown>; placedTemplates?: PlacedTemplate[] }
    if (data?.pageConfig && Array.isArray(data?.placedTemplates))
      return {
        pageConfig: migratePageConfig(data.pageConfig),
        placedTemplates: data.placedTemplates,
      }
  } catch {
    // ignore
  }
  return null
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const stored = loadStored()
  const [pageConfig, setPageConfigState] = useState<PageConfig>(
    stored?.pageConfig ?? DEFAULT_PAGE_CONFIG
  )
  const [placedTemplates, setPlacedTemplates] = useState<PlacedTemplate[]>(
    stored?.placedTemplates ?? []
  )

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
            id: `placed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            zIndex: maxZ + 1,
          },
        ]
      })
    },
    []
  )

  const removePlacedTemplate = useCallback((id: string) => {
    setPlacedTemplates((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pageConfig, placedTemplates })
      )
    } catch {
      // ignore
    }
  }, [pageConfig, placedTemplates])

  const loadFromStorage = useCallback(() => {
    const data = loadStored()
    if (data) {
      setPageConfigState(data.pageConfig)
      setPlacedTemplates(data.placedTemplates)
    }
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      pageConfig,
      placedTemplates,
      gridMetrics,
      setPageConfig,
      setPlacedTemplates,
      addPlacedTemplate,
      removePlacedTemplate,
      loadFromStorage,
      saveToStorage,
      canvasRef,
    }),
    [
      pageConfig,
      placedTemplates,
      gridMetrics,
      setPageConfig,
      addPlacedTemplate,
      removePlacedTemplate,
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
