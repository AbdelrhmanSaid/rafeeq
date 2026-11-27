const ARTWORK = [
  { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
  { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
]

function session() {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator ? navigator.mediaSession : null
}

export function setMediaMetadata({ title, artist = '', album = 'رفيق' } = {}) {
  const s = session()
  if (!s || typeof MediaMetadata === 'undefined') return
  s.metadata = new MediaMetadata({ title, artist, album, artwork: ARTWORK })
}

// Clear missing actions so handlers from another audio surface cannot leak.
const ACTIONS = ['play', 'pause', 'stop', 'seekbackward', 'seekforward', 'seekto', 'previoustrack', 'nexttrack']

export function setMediaHandlers(handlers = {}) {
  const s = session()
  if (!s) return
  for (const action of ACTIONS) {
    try {
      s.setActionHandler(action, handlers[action] || null)
    } catch {}
  }
}

export function setMediaPlaybackState(state) {
  const s = session()
  if (s) s.playbackState = state
}

export function clearMediaSession() {
  const s = session()
  if (!s) return
  s.metadata = null
  setMediaHandlers({})
  s.playbackState = 'none'
}
