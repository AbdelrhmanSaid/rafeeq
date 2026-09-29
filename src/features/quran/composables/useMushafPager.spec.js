import { effectScope, nextTick, ref } from 'vue'
import { useMushafPager } from './useMushafPager'

function createContainer({ width = 300, heights = [500, 200, 350], dir = 'rtl' } = {}) {
  const el = document.createElement('div')
  el.dir = dir
  el.style.direction = dir
  Object.defineProperty(el, 'clientWidth', { value: width })
  el.scrollTo = vi.fn()
  el.scrollIntoView = vi.fn()

  for (const height of heights) {
    const page = document.createElement('div')
    Object.defineProperty(page, 'offsetHeight', { value: height })
    el.appendChild(page)
  }

  document.body.appendChild(el)
  return el
}

async function setup(options) {
  const el = createContainer(options)
  const container = ref(el)
  const enabled = ref(true)
  const scope = effectScope()
  const pager = scope.run(() => useMushafPager(container, { enabled, pages: ref([]) }))
  await nextTick()
  return { el, enabled, pager, scope }
}

describe('useMushafPager', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('sizes the container to the first page', async () => {
    const { el, scope } = await setup()
    expect(el.style.height).toBe('500px')
    scope.stop()
  })

  it('tracks the settled page and resizes to it', async () => {
    const { el, pager, scope } = await setup()

    el.scrollLeft = -300
    el.dispatchEvent(new Event('scroll'))
    vi.advanceTimersByTime(200)

    expect(pager.activeIndex.value).toBe(1)
    expect(el.style.height).toBe('200px')
    scope.stop()
  })

  it('scrolls toward negative offsets in RTL', async () => {
    const { el, pager, scope } = await setup()
    pager.goToPage(2)
    expect(el.scrollTo).toHaveBeenCalledWith({ left: -600, behavior: 'smooth' })
    scope.stop()
  })

  it('steps pages immediately so repeated steps advance further', async () => {
    const { el, pager, scope } = await setup()

    pager.next()
    pager.next()

    expect(pager.activeIndex.value).toBe(2)
    expect(el.style.height).toBe('350px')
    expect(el.scrollTo).toHaveBeenLastCalledWith({ left: -600, behavior: 'smooth' })
    scope.stop()
  })

  it('stays within the first and last page', async () => {
    const { el, pager, scope } = await setup()

    pager.prev()
    pager.goToPage(3)

    expect(pager.activeIndex.value).toBe(0)
    expect(el.scrollTo).not.toHaveBeenCalled()
    scope.stop()
  })

  it('releases the height when disabled', async () => {
    const { el, enabled, scope } = await setup()
    enabled.value = false
    await nextTick()
    expect(el.style.height).toBe('')
    scope.stop()
  })
})
