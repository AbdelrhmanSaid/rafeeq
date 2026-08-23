import { useRouteError } from 'react-router-dom'

import Page from '@/layout/Page'
import ErrorState from '@/shared/ui/ErrorState'
import NotFoundView from '@/app/views/NotFoundView'
import { isNotFoundError } from '@/app/router/loaders'
import { usePageMeta } from '@/shared/hooks/usePageMeta'

const ERROR_META = {
  title: 'حدث خطأ',
  description: 'حدث خطأ غير متوقع أثناء تحميل الصفحة.',
  keywords: ['خطأ'],
}

// Renders inside the app shell for loader/render errors. A 404 thrown by a
// param-validating loader shows the regular not-found page.
export default function RouteErrorView() {
  const error = useRouteError()
  const notFound = isNotFoundError(error)

  usePageMeta(notFound ? null : ERROR_META)

  if (notFound) return <NotFoundView />

  if (import.meta.env.DEV) console.error(error)

  return (
    <Page>
      <ErrorState code={500} message="حدث خطأ غير متوقع، برجاء المحاولة في وقت لاحق." />
    </Page>
  )
}
