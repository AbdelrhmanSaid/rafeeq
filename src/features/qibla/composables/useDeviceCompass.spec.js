import { afterEach, describe, expect, it, vi } from 'vitest'
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

// One relative (gyroscope) and one absolute (compass) reading, as Chrome sends them side by side.
const readBoth = (compassAlpha, gyroAlpha) => {
  fire('deviceorientation', { alpha: gyroAlpha, beta: 0, gamma: 0, absolute: false })
  fire('deviceorientationabsolute', { alpha: compassAlpha, beta: 0, gamma: 0, absolute: true })
}

afterEach(() => {
  wrapper?.unmount()
  vi.useRealTimers()
})

describe('useDeviceCompass', () => {
  it('reads an absolute orientation as a heading', () => {
    asAndroid()
    const compass = mountCompass()
    fire('deviceorientationabsolute', { alpha: 90, beta: 0, gamma: 0, absolute: true })

    expect(compass.hasReading.value).toBe(true)
    expect(compass.heading.value).toBeCloseTo(270)
  })

  it('remembers a reading after the readings stop, so the screen can say the compass paused', () => {
    vi.useFakeTimers()
    asAndroid()
    const compass = mountCompass()
    expect(compass.hadReading.value).toBe(false)

    fire('deviceorientationabsolute', { alpha: 90, beta: 0, gamma: 0, absolute: true })
    vi.advanceTimersByTime(2500)

    expect(compass.hasReading.value).toBe(false)
    expect(compass.hadReading.value).toBe(true)
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

  it('keeps the last heading when an iPhone is stood up, where its heading flips', async () => {
    asIos()
    const compass = mountCompass()
    await compass.requestPermission()
    fire('deviceorientation', { webkitCompassHeading: 131, webkitCompassAccuracy: 10, alpha: 0, beta: 30, gamma: 0 })
    fire('deviceorientation', { webkitCompassHeading: 311, webkitCompassAccuracy: 10, alpha: 0, beta: 85, gamma: 0 })

    expect(compass.upright.value).toBe(true)
    expect(compass.heading.value).toBeCloseTo(131)
    expect(compass.hasReading.value).toBe(true)
  })

  it('flags an iPhone stood up from the start, before any heading counts', async () => {
    asIos()
    const compass = mountCompass()
    await compass.requestPermission()
    fire('deviceorientation', { webkitCompassHeading: 311, webkitCompassAccuracy: 10, alpha: 0, beta: 85, gamma: 0 })

    expect(compass.upright.value).toBe(true)
    expect(compass.hasReading.value).toBe(false)
  })

  it('settles on the last reading even when no more arrive', () => {
    vi.useFakeTimers()
    asAndroid()
    const compass = mountCompass()
    fire('deviceorientationabsolute', { alpha: 0, beta: 0, gamma: 0, absolute: true })
    fire('deviceorientationabsolute', { alpha: 270, beta: 0, gamma: 0, absolute: true })
    expect(compass.heading.value).toBeCloseTo(0)

    vi.advanceTimersByTime(900)

    expect(compass.heading.value).toBeCloseTo(90)
  })

  it('keeps the heading live while a still phone sends nothing but motion at rest', () => {
    vi.useFakeTimers()
    asAndroid()
    const compass = mountCompass()
    fire('deviceorientationabsolute', { alpha: 90, beta: 0, gamma: 0, absolute: true })

    for (let i = 0; i < 6; i++) {
      vi.advanceTimersByTime(500)
      fire('devicemotion', { rotationRate: { alpha: 0.2, beta: 0.1, gamma: 0 } })
    }

    expect(compass.hasReading.value).toBe(true)
  })

  it('lets the heading go stale when the phone turns but no reading follows', () => {
    vi.useFakeTimers()
    asAndroid()
    const compass = mountCompass()
    fire('deviceorientationabsolute', { alpha: 90, beta: 0, gamma: 0, absolute: true })

    for (let i = 0; i < 6; i++) {
      vi.advanceTimersByTime(500)
      fire('devicemotion', { rotationRate: { alpha: 0, beta: 0, gamma: 60 } })
    }

    expect(compass.hasReading.value).toBe(false)
  })

  it('flags a compass that moves while the gyroscope says the phone is still', () => {
    vi.useFakeTimers()
    asAndroid()
    const compass = mountCompass()

    readBoth(0, 200)
    vi.advanceTimersByTime(1100)
    readBoth(0, 200)
    expect(compass.disturbed.value).toBe(false)

    vi.advanceTimersByTime(300)
    readBoth(330, 200)

    expect(compass.disturbed.value).toBe(true)
  })

  it('does not flag a compass that only trails the gyroscope through a slow turn', () => {
    vi.useFakeTimers()
    asAndroid()
    const compass = mountCompass()
    const step = (compassAlpha, gyroAlpha) => {
      readBoth(compassAlpha, gyroAlpha)
      vi.advanceTimersByTime(20)
    }

    for (let i = 0; i < 60; i++) step(0, 0)
    // A 90° turn at 45° a second, the compass 25° behind, then a second for it to catch up.
    for (let turn = 0; turn <= 90; turn += 0.9) step(Math.max(0, turn - 25), turn)
    for (let i = 0; i < 50; i++) step(Math.min(90, 65 + i * 0.5), 90)
    for (let i = 0; i < 150; i++) step(90, 90)

    expect(compass.disturbed.value).toBe(false)
    expect(compass.drifted.value).toBeLessThan(1)
  })

  it('stops flagging interference once there has been nothing new to compare for a while', () => {
    vi.useFakeTimers()
    asAndroid()
    const compass = mountCompass()

    readBoth(0, 200)
    vi.advanceTimersByTime(1100)
    readBoth(0, 200)
    vi.advanceTimersByTime(300)
    readBoth(330, 200)
    expect(compass.disturbed.value).toBe(true)

    for (let i = 0; i < 14; i++) {
      vi.advanceTimersByTime(500)
      fire('devicemotion', { rotationRate: { alpha: 0, beta: 0, gamma: 0 } })
    }

    expect(compass.disturbed.value).toBe(false)
  })

  it('does not flag a compass that turns together with the gyroscope', () => {
    vi.useFakeTimers()
    asAndroid()
    const compass = mountCompass()

    for (const turn of [0, 0, 0, 0, 0, 40, 40, 40, 40, 40, 40, 120, 120, 120, 120, 120, 120]) {
      readBoth(turn, 200 + turn)
      vi.advanceTimersByTime(300)
    }

    expect(compass.disturbed.value).toBe(false)
    expect(compass.drifted.value).toBeCloseTo(0)
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
