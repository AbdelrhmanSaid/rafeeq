import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useDeviceCompass } from './useDeviceCompass'

// jsdom has no orientation events; each test sets up the browser it stands for.
window.DeviceOrientationEvent ??= class extends Event {}

const asAndroid = () => {
  window.ondeviceorientationabsolute = null
  delete window.DeviceOrientationEvent.requestPermission
}
const asBrowserWithoutAbsolute = () => {
  delete window.ondeviceorientationabsolute
  delete window.DeviceOrientationEvent.requestPermission
}
const asIos = () => {
  delete window.ondeviceorientationabsolute
  window.DeviceOrientationEvent.requestPermission = async () => 'granted'
}

// Recent Chrome, Android included, has the permission prompt as well as the absolute event.
const asChrome = (answer = 'granted') => {
  window.ondeviceorientationabsolute = null
  window.DeviceOrientationEvent.requestPermission = async () => answer
}

const settle = () => new Promise((resolve) => setTimeout(resolve))

let wrapper
const mountCompass = () => {
  let compass
  wrapper = mount(
    defineComponent({
      setup() {
        compass = useDeviceCompass()
        return () => null
      },
    }),
  )
  return compass
}

const fire = (type, fields) => {
  const event = new Event(type)
  for (const [key, value] of Object.entries(fields)) Object.defineProperty(event, key, { value })
  window.dispatchEvent(event)
}

afterEach(() => wrapper?.unmount())

describe('useDeviceCompass', () => {
  it('reads an absolute orientation as a heading', () => {
    asAndroid()
    const compass = mountCompass()
    fire('deviceorientationabsolute', { alpha: 90, beta: 0, gamma: 0, absolute: true })

    expect(compass.hasReading.value).toBe(true)
    expect(compass.heading.value).toBeCloseTo(270)
  })

  it('ignores a relative orientation, which is not measured from north', () => {
    asBrowserWithoutAbsolute()
    const compass = mountCompass()
    fire('deviceorientation', { alpha: 90, beta: 0, gamma: 0, absolute: false })

    expect(compass.hasReading.value).toBe(false)
  })

  it('reads an iOS compass heading once permission is granted', async () => {
    asIos()
    const compass = mountCompass()
    await compass.requestPermission()
    fire('deviceorientation', { webkitCompassHeading: 131, webkitCompassAccuracy: 10, beta: 60, gamma: 0 })

    expect(compass.heading.value).toBeCloseTo(131)
  })

  it('does not count an iOS reading that has no heading', async () => {
    asIos()
    const compass = mountCompass()
    await compass.requestPermission()
    fire('deviceorientation', { webkitCompassHeading: 0, webkitCompassAccuracy: -1, beta: 0, gamma: 0 })

    expect(compass.hasReading.value).toBe(false)
    expect(compass.accuracy.value).toBe(-1)
  })

  it('flags a phone held on its side', () => {
    asAndroid()
    const compass = mountCompass()
    fire('deviceorientationabsolute', { alpha: 0, beta: 0, gamma: 85, absolute: true })

    expect(compass.sideways.value).toBe(true)
  })
  it('reads the absolute orientation in Chrome, which also has the permission prompt', async () => {
    asChrome()
    const compass = mountCompass()
    await settle()
    fire('deviceorientationabsolute', { alpha: 90, beta: 0, gamma: 0, absolute: true })

    expect(compass.canRequestPermission.value).toBe(false)
    expect(compass.heading.value).toBeCloseTo(270)
  })

  it('waits for a tap without an error when the quiet request on opening is refused', async () => {
    asChrome('denied')
    const compass = mountCompass()
    await settle()

    expect(compass.canRequestPermission.value).toBe(true)
    expect(compass.error.value).toBe(null)
  })

  it('starts listening and drops the earlier refusal when a later tap is granted', async () => {
    asChrome('denied')
    const compass = mountCompass()
    await settle()
    await compass.requestPermission()
    expect(compass.error.value).not.toBe(null)

    window.DeviceOrientationEvent.requestPermission = async () => 'granted'
    await compass.requestPermission()
    expect(compass.error.value).toBe(null)
    fire('deviceorientationabsolute', { alpha: 90, beta: 0, gamma: 0, absolute: true })

    expect(compass.heading.value).toBeCloseTo(270)
  })
})
