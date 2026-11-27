// Back (the browser's button, Android's, or a swipe from the screen's edge) closes the open bottom sheet instead of
// leaving the screen. While sheets are open, one extra history entry sits over the screen's own, at the same address.
// Going back off it closes the top sheet, and the router never hears of it. Closing a sheet any other way takes the
// entry back off.
//
// The popstate listener must run before the router's, so this module is imported before the router is created.

const KEY = 'bottomSheet'

// The open sheets that close on back, oldest first.
const sheets = []
let router = null
// The entry this module put over the screen's, while it's there.
let token = null
// Going back off the entry ourselves, after a sheet closed some other way.
let goingBack = false
let pushAfterBack = false

const enabled = () => typeof window !== 'undefined' && window.self === window.top
const onOurEntry = () => token !== null && history.state?.[KEY] === token

function push() {
  token = Math.random().toString(36).slice(2)
  history.pushState({ ...history.state, [KEY]: token }, '')
}

// The address under the entry is the one from when the first sheet opened. The router may have changed the address
// since (a page turned while the tafsir was open), so the router's own address and state go back, without telling it.
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

  // Back off the entry: the top sheet closes and the screen stays.
  token = null
  event.stopImmediatePropagation()
  restoreAddress()
  sheets.at(-1)?.close()
  // Sheets still open under it get an entry of their own.
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

// Called as a sheet opens; returns what to call as it closes.
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
