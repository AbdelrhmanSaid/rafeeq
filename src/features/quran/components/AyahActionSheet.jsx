import { IconPlayerPlay, IconBook2, IconCopy, IconShare3, IconBookmark, IconBookmarkOff } from '@tabler/icons-react'
import { toast } from 'sonner'

import BottomSheet from '@/shared/ui/BottomSheet'
import { toArabicNumerals } from '@/shared/utils/arabic'

// Actions for a single ayah: recite it, read its tafseer, bookmark, copy, share.
export default function AyahActionSheet({
  show = false,
  ayah = null,
  surahName = '',
  online = true,
  bookmarked = false,
  onRecite,
  onTafseer,
  onBookmark,
  onClose,
}) {
  const title = ayah ? `${surahName} ${toArabicNumerals(ayah.numberInSurah)}` : ''
  const shareText = ayah ? `${ayah.text}\n[${title}]` : ''

  const runAndClose = (action) => () => {
    action?.()
    onClose?.()
  }

  const copy = () => {
    const text = shareText
    onClose?.()

    toast.promise(() => navigator.clipboard.writeText(text), {
      loading: 'جاري النسخ...',
      success: 'تم نسخ الآية بنجاح',
      error: 'حدث خطأ أثناء نسخ الآية',
    })
  }

  const share = () => {
    const text = shareText
    onClose?.()

    const canShare = !!navigator.share
    toast.promise(() => (canShare ? navigator.share({ title: 'رفيق', text }) : navigator.clipboard.writeText(text)), {
      loading: 'جاري المشاركة...',
      success: canShare ? 'تم مشاركة الآية بنجاح' : 'تعذرت المشاركة، تم نسخ الآية بدلاً من ذلك',
      error: 'حدث خطأ أثناء مشاركة الآية',
    })
  }

  const BookmarkIcon = bookmarked ? IconBookmarkOff : IconBookmark

  return (
    <BottomSheet show={show} title={title} onClose={onClose}>
      <ul className="list-unstyled m-0 py-2">
        {online && (
          <li>
            <button className="bottom-sheet-item" onClick={runAndClose(onRecite)}>
              <IconPlayerPlay size="20" />
              <span>تلاوة</span>
            </button>
          </li>
        )}
        <li>
          <button className="bottom-sheet-item" onClick={runAndClose(onTafseer)}>
            <IconBook2 size="20" />
            <span>تفسير</span>
          </button>
        </li>
        <li>
          <button className="bottom-sheet-item" onClick={runAndClose(onBookmark)}>
            <BookmarkIcon size="20" />
            <span>{bookmarked ? 'إزالة الإشارة المرجعية' : 'تعيين كإشارة مرجعية'}</span>
          </button>
        </li>
        <li>
          <hr className="my-2" />
        </li>
        <li>
          <button className="bottom-sheet-item" onClick={copy}>
            <IconCopy size="20" />
            <span>نسخ</span>
          </button>
        </li>
        <li>
          <button className="bottom-sheet-item" onClick={share}>
            <IconShare3 size="20" />
            <span>مشاركة</span>
          </button>
        </li>
      </ul>
    </BottomSheet>
  )
}
