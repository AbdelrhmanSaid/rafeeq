import { IconWifiOff } from '@tabler/icons-react'

export default function OfflineState({ message = 'لا يوجد اتصال بالإنترنت' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center gap-4">
      <IconWifiOff size="2.5rem" className="text-muted" />
      <p className="lead">{message}</p>
    </div>
  )
}
