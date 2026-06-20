// Promisified one-shot geolocation lookup. Resolves with a GeolocationPosition,
// rejects with the native GeolocationPositionError (which carries `.code`).
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}
