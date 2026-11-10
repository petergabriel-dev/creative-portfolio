import type { Discipline } from '@/payload-types'

/** ChapterOpener surfaces (docs/design/components/ChapterOpener.md › Variants). */
export type OpenerTint = 'chapter' | 'photo' | 'film' | 'design' | 'writing'

const TINT_BY_OPTION: Record<Discipline['openerTint'], OpenerTint> = {
  warm: 'photo',
  plum: 'film',
  forest: 'design',
  clay: 'writing',
  default: 'chapter',
}

/** Maps a discipline's `openerTint` select value to the opener surface it names. */
export const openerTint = (value: Discipline['openerTint'] | null | undefined): OpenerTint =>
  (value && TINT_BY_OPTION[value]) || 'chapter'
