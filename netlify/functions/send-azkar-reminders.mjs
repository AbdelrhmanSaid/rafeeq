/**
 * Scheduled sender for daily azkar reminders.
 *
 * Runs every 15 minutes (UTC). On each tick it computes the current UTC
 * 15-minute bucket (e.g. "0230") and sends an immediate Web Push to every
 * subscriber whose `azkar_morning` / `azkar_evening` tag equals that bucket.
 *
 * The client (src/stores/notifications.js) stores each user's chosen local
 * reminder time converted to a UTC 15-minute bucket, so matching here needs
 * no timezone math and no database — OneSignal holds the tags.
 *
 * Required Netlify environment variables:
 *   ONESIGNAL_APP_ID        – your OneSignal app id
 *   ONESIGNAL_REST_API_KEY  – server-side REST API key (keep secret!)
 *   SITE_URL                – optional, defaults to https://rafeeq.me
 */

const ONESIGNAL_API = 'https://api.onesignal.com/notifications'

export const config = {
  schedule: '*/15 * * * *', // every 15 minutes, UTC
}

export default async function handler() {
  const appId = process.env.ONESIGNAL_APP_ID
  const apiKey = process.env.ONESIGNAL_REST_API_KEY
  const siteUrl = (process.env.SITE_URL || 'https://rafeeq.me').replace(/\/$/, '')

  if (!appId || !apiKey) {
    console.error('Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY env var')
    return new Response('Missing OneSignal configuration', { status: 500 })
  }

  const now = new Date()
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const mm = String(Math.floor(now.getUTCMinutes() / 15) * 15).padStart(2, '0')
  const bucket = `${hh}${mm}`

  const reminders = [
    {
      tag: 'azkar_morning',
      heading: '✨ أذكار الصباح ✨',
      content: 'حان وقت أذكار الصباح، اغتنم بركة الذكر في أول يومك.',
      url: `${siteUrl}/azkar/morning`,
    },
    {
      tag: 'azkar_evening',
      heading: '✨ أذكار المساء ✨',
      content: 'حان وقت أذكار المساء، اختم يومك بذكر الله.',
      url: `${siteUrl}/azkar/evening`,
    },
  ]

  const results = []
  for (const reminder of reminders) {
    const payload = {
      app_id: appId,
      target_channel: 'push',
      filters: [{ field: 'tag', key: reminder.tag, relation: '=', value: bucket }],
      headings: { en: reminder.heading, ar: reminder.heading },
      contents: { en: reminder.content, ar: reminder.content },
      url: reminder.url,
    }

    try {
      const res = await fetch(ONESIGNAL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      // A bucket with no matching subscribers returns a 4xx "no recipients" —
      // that is normal and not an error worth alarming on.
      results.push({
        tag: reminder.tag,
        status: res.status,
        id: json.id,
        recipients: json.recipients,
        errors: json.errors,
      })
    } catch (error) {
      results.push({ tag: reminder.tag, error: String(error) })
    }
  }

  console.log('azkar-reminders', JSON.stringify({ bucket, results }))
  return new Response(JSON.stringify({ bucket, results }), {
    headers: { 'content-type': 'application/json' },
  })
}
