import { toast } from 'vue-sonner'

export async function sharePage(title) {
  const data = {
    title,
    text: title,
    url: window.location.href,
  }

  if (navigator.share) {
    try {
      await navigator.share(data)
    } catch {}
    return
  }

  try {
    await navigator.clipboard.writeText(data.url)
    toast.success('تم نسخ الرابط')
  } catch {
    toast.error('حدث خطأ أثناء نسخ الرابط')
  }
}
