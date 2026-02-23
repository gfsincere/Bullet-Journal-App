import type { TemplateDefinition } from '../types'

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: 'month-3x4',
    name: 'Month (3×4)',
    description: 'Calendar grid 3×4 dots',
    widthDots: 3,
    heightDots: 4,
    kind: 'monthly-calendar',
    config: { cols: 3, rows: 4 },
  },
  {
    id: 'month-2x5',
    name: 'Month (2×5)',
    description: 'Calendar grid 2×5 dots',
    widthDots: 2,
    heightDots: 5,
    kind: 'monthly-calendar',
    config: { cols: 2, rows: 5 },
  },
  {
    id: 'week',
    name: 'Weekly spread',
    description: '7-day week layout',
    widthDots: 7,
    heightDots: 4,
    kind: 'weekly',
  },
  {
    id: 'habit',
    name: 'Habit tracker',
    description: 'Simple habit grid',
    widthDots: 4,
    heightDots: 3,
    kind: 'habit-tracker',
  },
  {
    id: 'notes',
    name: 'Notes block',
    description: 'Blank area for notes',
    widthDots: 5,
    heightDots: 6,
    kind: 'notes',
  },
]
