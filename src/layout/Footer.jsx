import { ROUTES } from '@/app/router/routes'
import styles from './Footer.module.scss'

const resources = [
  { title: 'مواقيت الصلاة', link: 'https://aladhan.com/prayer-times-api' },
  { title: 'قاعدة بيانات الأذكار', link: 'https://github.com/osamayy/azkar-db' },
  { title: 'إذاعات القرآن الكريم', link: 'https://api.mp3quran.net/radios/radio_arabic.json' },
]

const support = [
  { title: 'المساهمة في التطوير', link: 'https://github.com/AbdelrhmanSaid/rafeeq' },
  { title: 'الإبلاغ عن مشكلة', link: 'https://github.com/AbdelrhmanSaid/rafeeq/issues' },
  { title: 'دعم المطور', link: 'https://buymeacoffee.com/abdelrhmansaid' },
  { title: 'سياسة الخصوصية', link: ROUTES.privacy },
]

const LinkList = ({ title, items }) => (
  <>
    <p className="h5">{title}</p>
    <ul className="list-unstyled text-small">
      {items.map((item) => (
        <li key={item.link}>
          <a href={item.link} className={styles.link} target="_blank" rel="noreferrer">
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  </>
)

export default function Footer({ className = '' }) {
  return (
    <footer className={`py-5 border-top ${className}`}>
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <p className="text-muted text-center text-md-start mb-0">
              تطبيق رفيق، تطبيق إسلامي مفتوح المصدر، لا توجد حقوق على المواد المستخدمة داخل الموقع، يمكنك استخدامها أو
              إعادة نشرها دون الرجوع إلينا مطلقًا، ولكن لا تنسانا من صالح دعائك.
            </p>
          </div>

          <div className="col-md-3 offset-md-1">
            <LinkList title="المواد المستخدمة" items={resources} />
          </div>

          <div className="col-md-3">
            <LinkList title="الدعم والمساهمة" items={support} />
          </div>
        </div>
      </div>
    </footer>
  )
}
