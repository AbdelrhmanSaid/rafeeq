import Page from '@/layout/Page'
import LoadingState from '@/shared/ui/LoadingState'
import ErrorState from '@/shared/ui/ErrorState'
import OfflineState from '@/shared/ui/OfflineState'
import { useOnline } from '@/shared/hooks/useOnline'

// Renders the loading / offline / error states around an async page, so views
// only have to describe their happy path.
export default function AsyncContent({
  pending = false,
  error = null,
  loadingMessage,
  errorMessage = 'حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق.',
  children,
}) {
  const online = useOnline()

  if (pending) {
    return (
      <Page>
        <LoadingState message={loadingMessage} />
      </Page>
    )
  }

  if (error) {
    return <Page>{online ? <ErrorState code={500} message={errorMessage} /> : <OfflineState />}</Page>
  }

  return children
}
