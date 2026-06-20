import { watch } from 'vue'
import { useMeta } from '@/shared/utils/head'

// Applies page meta from a reactive source as soon as it resolves. `source` is
// a getter returning a meta object (title/description/keywords) or a falsy value.
export function usePageMeta(source) {
  watch(
    source,
    (meta) => {
      if (meta) useMeta(meta)
    },
    { immediate: true },
  )
}
