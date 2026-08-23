import { IconMoodEmpty } from '@tabler/icons-react'

export default function EmptyState({ message = 'لا توجد نتائج مطابقة لعملية البحث' }) {
  return (
    <div className="py-5 text-center">
      <IconMoodEmpty size="2.5rem" />
      <p className="mt-2">{message}</p>
    </div>
  )
}
