import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'
import Sebha from '@/features/sebha/components/Sebha'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import styles from './SebhaView.module.scss'

export default function SebhaView() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <Page className={`${styles.page} ${isMobile ? 'full-height' : ''}`}>
      <Heading
        className="mb-4"
        title="السبحة الإلكترونية"
        subtitle="السبحة الإلكترونية هي تطبيق يساعدك على ذكر الله في أي وقت ومكان."
        share
      />

      <Sebha />
    </Page>
  )
}
