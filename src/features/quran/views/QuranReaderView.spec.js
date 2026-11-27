import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import QuranReaderView from '@/features/quran/views/QuranReaderView.vue'

vi.mock('@/features/quran/lib/mushafStorage', () => ({
  loadPage: vi.fn(() => new Promise(() => {})),
  keepPagesNear: vi.fn(),
}))

vi.mock('@/features/quran/composables/useMushafRecitation', () => ({
  useMushafRecitation: () => ({
    playing: ref(false),
    loading: ref(false),
    playingKey: ref(null),
    surah: ref(null),
    ayah: ref(null),
  }),
}))

const stubs = {
  MushafPage: { props: ['page'], template: '<div class="page-stub">{{ page }}</div>' },
  QuranPlayerPill: true,
  AyahActionSheet: true,
  TafseerSheet: true,
}

async function open(path) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/quran/page/:page(\\d+)', name: 'quran-page', component: QuranReaderView },
      { path: '/', component: { template: '<div />' } },
    ],
  })
  await router.push(path)
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(QuranReaderView, { global: { plugins: [router, pinia], stubs }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}

const press = (key) => window.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }))

describe('QuranReaderView', () => {
  let wrapper

  beforeEach(() => {
    vi.useFakeTimers()
    // jsdom has no font loading.
    Object.defineProperty(document, 'fonts', { value: { load: async () => [] }, configurable: true })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
  })

  it('turns a page for every arrow press, however quick', async () => {
    let router
    ;({ wrapper, router } = await open('/quran/page/100'))

    for (let i = 0; i < 4; i++) {
      press('ArrowLeft')
      vi.advanceTimersByTime(150)
    }
    vi.advanceTimersByTime(400)
    await flushPromises()

    expect(router.currentRoute.value.params.page).toBe('104')
  })

  it('corrects an address past either end to the page shown', async () => {
    let router
    ;({ wrapper, router } = await open('/quran/page/0'))
    expect(router.currentRoute.value.path).toBe('/quran/page/1')
    wrapper.unmount()
    ;({ wrapper, router } = await open('/quran/page/605'))
    expect(router.currentRoute.value.path).toBe('/quran/page/604')
  })

  it('is the main landmark, headed by the surah being read and the page', async () => {
    ;({ wrapper } = await open('/quran/page/293'))
    expect(wrapper.element.tagName).toBe('MAIN')
    expect(wrapper.find('h1').text()).toContain('الكهف')
    expect(wrapper.find('h1').text()).toContain('٢٩٣')
  })
})
