import { IconShare3 } from '@tabler/icons-react'
import { toast } from 'sonner'

export default function Heading({ title, subtitle, size = 1, share = false, className = '' }) {
  const Tag = `h${size}`

  const sharePage = async () => {
    const data = { title, text: title, url: window.location.href }

    if (navigator.share) {
      try {
        await navigator.share(data)
      } catch {
        // User cancelled
      }
      return
    }

    try {
      await navigator.clipboard.writeText(data.url)
      toast.success('تم نسخ الرابط')
    } catch {
      toast.error('حدث خطأ أثناء نسخ الرابط')
    }
  }

  return (
    <div className={className}>
      <Tag>
        {title}
        {share && (
          <button
            className="btn btn-flat p-0 bg-transparent"
            type="button"
            title="مشاركة الصفحة"
            aria-label="مشاركة الصفحة"
            onClick={sharePage}
          >
            <IconShare3 size="18" />
          </button>
        )}
      </Tag>

      {subtitle && <p className="lead">{subtitle}</p>}
    </div>
  )
}
