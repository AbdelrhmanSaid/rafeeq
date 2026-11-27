import { countLabel } from '@/shared/utils/countLabel'

const TIMES = { one: 'مرة واحدة', two: 'مرتين', few: 'مرات', many: 'مرة', other: 'مرة' }

export const repeatLabel = (repeat) => countLabel(repeat, TIMES)
