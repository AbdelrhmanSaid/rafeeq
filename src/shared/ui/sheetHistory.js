// While sheets are open one extra history entry sits over the screen's, so Back closes the top sheet.
// The popstate listener must run before the router's, so this module is imported before the router is created.

const KEY = 'bottomSheet'

const sheets = []
let router = null
let token = null
let goingBack = false
let pushAfterBack = false

const enabled = () => typeof window !== 'undefined' && window.self === window.top
const onOurEntry = () => token !== null && history.state?.[KEY] === token

function push() {
  token = Math.random().toString(36).slice(2)
  history.pushState({ ...history.state, [KEY]: token }, '')
}

// The router may have changed the address since the first sheet opened, so restore its address and state silently.
function restoreAddress() {
  if (!router) return
  const { state, location: path } = router.options.history
  const clean = { ...state }
  delete clean[KEY]
  history.replaceState(clean, '', router.options.history.createHref(path))
}

function onPopState(event) {
  if (goingBack) {
    goingBack = false
    event.stopImmediatePropagation()
    restoreAddress()
    if (pushAfterBack && sheets.length) push()
    pushAfterBack = false
    return
  }

  if (token === null || onOurEntry()) return

  token = null
  event.stopImmediatePropagation()
  restoreAddress()
  sheets.at(-1)?.close()
  setTimeout(() => {
    if (sheets.length && token === null) push()
  })
}

if (enabled()) window.addEventListener('popstate', onPopState, { capture: true })

export function installSheetHistory(appRouter) {
  router = appRouter
}

function release() {
  if (sheets.length || token === null) return
  const ours = onOurEntry()
  token = null
  if (!ours) return
  goingBack = true
  history.back()
}

export function trackSheet(close) {
  if (!enabled()) return () => {}

  const sheet = { close }
  sheets.push(sheet)
  if (goingBack) pushAfterBack = true
  else if (token === null) push()

  return () => {
    const index = sheets.indexOf(sheet)
    if (index === -1) return
    sheets.splice(index, 1)
    // Later, so a sheet that closes as another opens (the ayah menu handing over to the tafsir) keeps the entry.
    setTimeout(release)
  }
}
