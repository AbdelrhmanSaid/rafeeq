import Page from '@/layout/Page'
import ErrorState from '@/shared/ui/ErrorState'

export default function NotFoundView() {
  return (
    <Page>
      <ErrorState code={404} message="الصفحة التي تبحث عنها غير موجودة." />
    </Page>
  )
}
