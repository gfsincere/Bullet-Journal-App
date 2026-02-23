export type PageSizePreset = 'A5' | 'A4' | 'B5' | 'B4' | 'Letter' | 'Custom'

export interface PageConfig {
  preset: PageSizePreset
  widthMm: number
  heightMm: number
  /** Grid size: dots across and down (whole numbers). Spacing and margins are derived from these. */
  dotsWide: number
  dotsTall: number
}

export type TemplateKind = 'monthly-calendar' | 'weekly' | 'habit-tracker' | 'notes' | 'custom'

export interface TemplateDefinition {
  id: string
  name: string
  description?: string
  widthDots: number
  heightDots: number
  kind: TemplateKind
  /** e.g. { cols: 3, rows: 4 } for 3×4 month grid */
  config?: Record<string, number>
}

export interface PlacedTemplate {
  id: string
  templateId: string
  xDot: number
  yDot: number
  zIndex: number
}

export interface GridMetrics {
  dotsWide: number
  dotsTall: number
  /** Derived from page size and grid size */
  spacingMm: number
  contentWidthMm: number
  contentHeightMm: number
  marginLeftMm: number
  marginRightMm: number
  marginTopMm: number
  marginBottomMm: number
}
