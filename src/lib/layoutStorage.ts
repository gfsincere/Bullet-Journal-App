import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { LayoutMode, PageConfig, PlacedTemplate } from '../types'

export interface LayoutPayload {
  pageConfig: PageConfig
  placedTemplates: PlacedTemplate[]
  layoutMode: LayoutMode
}

export async function getLayout(userId: string): Promise<LayoutPayload | null> {
  const ref = doc(db, 'layouts', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  if (!data?.pageConfig || !Array.isArray(data?.placedTemplates)) return null
  return {
    pageConfig: data.pageConfig as PageConfig,
    placedTemplates: data.placedTemplates as PlacedTemplate[],
    layoutMode: data.layoutMode === 'two-page' ? 'two-page' : 'one-page',
  }
}

export async function setLayout(
  userId: string,
  payload: LayoutPayload
): Promise<void> {
  const ref = doc(db, 'layouts', userId)
  await setDoc(ref, {
    ...payload,
    updatedAt: new Date().toISOString(),
  })
}
