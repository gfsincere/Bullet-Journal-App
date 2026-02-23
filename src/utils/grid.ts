import type { PageConfig, GridMetrics } from '../types'

/**
 * Derive dot spacing and margins from paper size and grid size.
 * Spacing is chosen so the grid fits; margins center the grid on the page.
 */
export function computeGridMetrics(config: PageConfig): GridMetrics {
  const { widthMm, heightMm, dotsWide, dotsTall } = config
  const wide = Math.max(1, Math.floor(dotsWide))
  const tall = Math.max(1, Math.floor(dotsTall))

  const spacingMm = Math.min(widthMm / wide, heightMm / tall)
  const contentWidthMm = wide * spacingMm
  const contentHeightMm = tall * spacingMm
  const marginLeftMm = (widthMm - contentWidthMm) / 2
  const marginRightMm = marginLeftMm
  const marginTopMm = (heightMm - contentHeightMm) / 2
  const marginBottomMm = marginTopMm

  return {
    dotsWide: wide,
    dotsTall: tall,
    spacingMm,
    contentWidthMm,
    contentHeightMm,
    marginLeftMm,
    marginRightMm,
    marginTopMm,
    marginBottomMm,
  }
}

/** Snap value to nearest step (for drag position in dot units) */
export function snapToGrid(value: number, step: number): number {
  return Math.round(value / step) * step
}
