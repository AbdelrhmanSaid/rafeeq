import { useCallback, useEffect, useState } from 'react'
import { IconLocationFilled, IconDeviceMobile } from '@tabler/icons-react'

import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'
import LoadingState from '@/shared/ui/LoadingState'
import ErrorState from '@/shared/ui/ErrorState'
import OfflineState from '@/shared/ui/OfflineState'
import QiblaCompass from '@/features/qibla/components/QiblaCompass'
import { useDeviceCompass } from '@/features/qibla/hooks/useDeviceCompass'
import { getCurrentPosition } from '@/shared/lib/geolocation'
import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { useJsonFetch } from '@/shared/hooks/useJsonFetch'
import { useOnline } from '@/shared/hooks/useOnline'
import { API } from '@/shared/constants/api'
import styles from './QiblaView.module.scss'

function locationErrorMessage(error) {
  if (!navigator.geolocation) return 'الموقع الجغرافي غير مدعوم في هذا المتصفح'
  if (error?.code === 1) return 'تم رفض إذن الوصول للموقع'
  if (error?.code === 2) return 'الموقع غير متاح حالياً'
  return 'فشل في تحديد الموقع'
}

export default function QiblaView() {
  const online = useOnline()
  const isMobile = useIsMobile()

  // Location state (fresh from navigator, not stored)
  const [coords, setCoords] = useState(null)
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState(null)

  const requestLocation = useCallback(async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const position = await getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
      setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude })
    } catch (error) {
      setLocationError(locationErrorMessage(error))
    } finally {
      setLocationLoading(false)
    }
  }, [])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  const endpoint = coords ? `${API.aladhan}/qibla/${coords.latitude}/${coords.longitude}` : null
  const { data, error, pending: isFetching } = useJsonFetch(endpoint)

  const direction = data?.data?.direction
  const qiblaDirection = typeof direction === 'number' ? direction : null

  const { heading, hasSupport, error: compassError, canRequestPermission, requestPermission } = useDeviceCompass()

  const renderState = () => {
    if (!isMobile) {
      return (
        <div className={`${styles.card} text-center`}>
          <IconDeviceMobile size="3rem" className="text-muted mb-3" />
          <p className="h5 mb-2">هذه الميزة متاحة فقط على الهاتف</p>
          <p className="text-muted mb-0">افتح التطبيق من هاتفك لاستخدام البوصلة</p>
        </div>
      )
    }

    if (!online) {
      return (
        <div className={styles.card}>
          <OfflineState />
        </div>
      )
    }

    if (locationLoading) {
      return (
        <div className={styles.card}>
          <LoadingState message="جاري تحديد موقعك..." />
        </div>
      )
    }

    if (locationError) {
      return (
        <div className={`${styles.card} ${styles.clickable} text-center`} onClick={requestLocation}>
          <IconLocationFilled size="3rem" className="text-danger mb-3" />
          <p className="mb-2">{locationError}</p>
          <p className="text-muted small mb-0">إضغط للمحاولة مرة أخرى</p>
        </div>
      )
    }

    if (isFetching) {
      return (
        <div className={styles.card}>
          <LoadingState message="جاري تحديد اتجاه القبلة..." />
        </div>
      )
    }

    if (error) {
      return (
        <div className={styles.card}>
          <ErrorState code={500} message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
        </div>
      )
    }

    if (qiblaDirection === null) return null

    return (
      <QiblaCompass
        qiblaDirection={qiblaDirection}
        heading={heading}
        hasCompassSupport={hasSupport}
        compassError={compassError}
        canRequestPermission={canRequestPermission}
        onRequestPermission={requestPermission}
      />
    )
  }

  return (
    <Page>
      <Heading className="mb-4" title="اتجاه القبلة" subtitle="حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية." />

      {renderState()}
    </Page>
  )
}
