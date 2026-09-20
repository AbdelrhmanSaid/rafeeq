import { watch } from 'vue'
import { useMeta } from '@/shared/utils/head'

export function usePageMeta(source) {
  watch(
    source,
    (meta) => {
      if (meta) useMeta(meta)
    },
    { immediate: true },
  )
}
