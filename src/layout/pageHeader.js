import { onBeforeUnmount, onMounted, reactive, toValue, watchEffect } from 'vue'

export const pageHeader = reactive({
  owner: null,
  title: '',
  share: false,
  el: null,
})

let nextOwner = 0

export function usePageHeader({ title, share, el }) {
  const owner = ++nextOwner
  let stop = null

  onMounted(() => {
    pageHeader.owner = owner
    stop = watchEffect(() => {
      if (pageHeader.owner !== owner) return
      pageHeader.title = toValue(title)
      pageHeader.share = toValue(share)
      pageHeader.el = toValue(el)
    })
  })

  onBeforeUnmount(() => {
    stop?.()
    // The next page may have registered first; leave its header alone.
    if (pageHeader.owner !== owner) return
    pageHeader.owner = null
    pageHeader.title = ''
    pageHeader.share = false
    pageHeader.el = null
  })
}
