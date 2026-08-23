import { Link } from 'react-router-dom'
import { IconSun, IconMoon, IconShield, IconDots } from '@tabler/icons-react'

import { ROUTES } from '@/app/router/routes'
import styles from './QuickAzkar.module.scss'

const AZKAR = [
  {
    slug: 'morning',
    name: 'أذكار الصباح',
    description: 'وقتها من بعد الفجر حتى ارتفاع الشمس',
    icon: IconSun,
  },
  {
    slug: 'evening',
    name: 'أذكار المساء',
    description: 'وقتها من بعد العصر حتى غروب الشمس',
    icon: IconMoon,
  },
  {
    slug: 'ruqya',
    name: 'الرقية الشرعية',
    description: 'حصن نفسك بصحيح الرقية الشرعية',
    icon: IconShield,
  },
]

const AzkarCard = ({ icon: Icon, name, description, to }) => (
  <div className="col">
    <div className="card h-100 position-relative">
      <div className="card-body d-flex align-items-center gap-3">
        <span className="icon-circle text-secondary">
          <Icon />
        </span>
        <div>
          <h3 className="card-title fs-5 mb-1">{name}</h3>
          <small className="text-body-secondary">{description}</small>
        </div>
      </div>
      <Link to={to} className="stretched-link" aria-label={name} />
    </div>
  </div>
)

export default function QuickAzkar({ className = '' }) {
  return (
    <div className={`row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3 ${styles.grid} ${className}`}>
      {AZKAR.map((item) => (
        <AzkarCard key={item.slug} {...item} to={ROUTES.azkarCategory(item.slug)} />
      ))}

      <AzkarCard icon={IconDots} name="المزيد" description="اضغط هنا لعرض كل الأذكار المتاحة" to={ROUTES.azkar} />
    </div>
  )
}
