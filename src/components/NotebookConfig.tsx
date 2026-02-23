import { useApp } from '../context/AppContext'
import { PAGE_SIZES } from '../constants'
import type { PageSizePreset } from '../types'

function clampDots(value: number): number {
  const n = Math.round(Number(value)) || 1
  return Math.max(1, Math.min(500, n))
}

export function NotebookConfig() {
  const { pageConfig, setPageConfig, gridMetrics } = useApp()

  const handlePresetChange = (preset: PageSizePreset) => {
    if (preset === 'Custom') {
      setPageConfig({ ...pageConfig, preset: 'Custom' })
      return
    }
    const size = PAGE_SIZES[preset]
    if (size) {
      setPageConfig({
        ...pageConfig,
        preset,
        widthMm: size.widthMm,
        heightMm: size.heightMm,
      })
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Notebook
      </h2>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Paper size</label>
          <select
            value={pageConfig.preset}
            onChange={(e) => handlePresetChange(e.target.value as PageSizePreset)}
            className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            {(['A5', 'A4', 'B5', 'B4', 'Letter', 'Custom'] as const).map(
              (p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              )
            )}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-slate-500">
              Width (mm)
            </label>
            <input
              type="number"
              min={50}
              max={500}
              step={1}
              value={pageConfig.widthMm}
              onChange={(e) =>
                setPageConfig({
                  ...pageConfig,
                  widthMm: Math.max(50, Number(e.target.value) || pageConfig.widthMm),
                  preset: 'Custom',
                })
              }
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">
              Height (mm)
            </label>
            <input
              type="number"
              min={50}
              max={500}
              step={1}
              value={pageConfig.heightMm}
              onChange={(e) =>
                setPageConfig({
                  ...pageConfig,
                  heightMm: Math.max(50, Number(e.target.value) || pageConfig.heightMm),
                  preset: 'Custom',
                })
              }
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-slate-500">
              Dots wide
            </label>
            <input
              type="number"
              min={1}
              max={500}
              step={1}
              value={pageConfig.dotsWide}
              onChange={(e) =>
                setPageConfig({
                  ...pageConfig,
                  dotsWide: clampDots(Number(e.target.value)),
                })
              }
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">
              Dots tall
            </label>
            <input
              type="number"
              min={1}
              max={500}
              step={1}
              value={pageConfig.dotsTall}
              onChange={(e) =>
                setPageConfig({
                  ...pageConfig,
                  dotsTall: clampDots(Number(e.target.value)),
                })
              }
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        </div>
        <div className="space-y-1 rounded bg-slate-100 px-2 py-1.5 text-sm text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          <div>
            Grid: <strong>{gridMetrics.dotsWide}</strong> ×{' '}
            <strong>{gridMetrics.dotsTall}</strong> dots
          </div>
          <div className="text-xs">
            Dot spacing: <strong>{gridMetrics.spacingMm.toFixed(2)}</strong> mm
            &nbsp;· Margins: <strong>{gridMetrics.marginLeftMm.toFixed(1)}</strong> mm
          </div>
        </div>
      </div>
    </section>
  )
}
