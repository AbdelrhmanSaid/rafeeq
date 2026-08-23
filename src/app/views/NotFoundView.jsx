import Page from '@/layout/Page'
import ErrorState from '@/shared/ui/ErrorState'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { NOT_FOUND_META } from '@/app/views/notFoundMeta'

export default function NotFoundView() {
  // Set here (not only on the '*' route) so a 404 raised by a route loader
  // gets the same meta.
  usePageMeta(NOT_FOUND_META)

  return (
    <Page>
      <ErrorState code={404} message="الصفحة التي تبحث عنها غير موجودة." />
    </Page>
  )
}
