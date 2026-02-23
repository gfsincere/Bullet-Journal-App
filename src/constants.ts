import type { PageConfig } from './types'

/** Standard page sizes (width × height in mm) */
export const PAGE_SIZES: Record<string, { widthMm: number; heightMm: number }> = {
  A5: { widthMm: 148, heightMm: 210 },
  A4: { widthMm: 210, heightMm: 297 },
  B5: { widthMm: 176, heightMm: 250 },
  B4: { widthMm: 250, heightMm: 353 },
  Letter: { widthMm: 216, heightMm: 279 },
}

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  preset: 'A5',
  widthMm: PAGE_SIZES.A5.widthMm,
  heightMm: PAGE_SIZES.A5.heightMm,
  dotsWide: 29,
  dotsTall: 42,
}

export const STORAGE_KEY = 'bullet-journal-layout'
