import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  IconHome,
  IconBook,
  IconSparkles,
  IconRadio,
  IconDotsCircleHorizontal,
  IconBrandTelegram,
  IconX,
} from '@tabler/icons-react'

import { ROUTES } from '@/app/router/routes'
import { useRadioStore } from '@/features/radio/store'
import { useActiveNav } from '@/layout/useActiveNav'
import { usePresence } from '@/shared/hooks/usePresence'
import styles from './TabBar.module.scss'

const TAB_ITEM_CLASSES = 'd-flex flex-column align-items-center text-decoration-none text-secondary px-2 py-1 rounded'

const tabClass =
  (forceActive = false, extra = '') =>
  ({ isActive }) =>
    `${TAB_ITEM_CLASSES} ${styles.tabItem} ${isActive || forceActive ? styles.active : ''} ${extra}`

const menuItemClass = ({ isActive }) =>
  `d-flex align-items-center px-4 py-2 text-decoration-none text-body ${styles.menuItem} ${isActive ? styles.active : ''}`

const moreMenuLinks = [
  { to: ROUTES.qibla, label: 'اتجاه القبلة' },
  { to: ROUTES.zakat, label: 'حاسبة الزكاة' },
  { to: ROUTES.sebha, label: 'السبحة الإلكترونية' },
  { to: ROUTES.settings, label: 'الإعدادات' },
]

export default function TabBar({ className = '' }) {
  const isPlaying = useRadioStore((state) => state.isPlaying)
  const { isQuranActive, isAzkarActive, isRadioActive } = useActiveNav()

  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const { isMounted, isVisible } = usePresence(showMoreMenu)

  const closeMoreMenu = () => setShowMoreMenu(false)

  return (
    <div className={className}>
      {isMounted && (
        <div
          className={`position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-end ${styles.overlay} ${isVisible ? styles.visible : ''}`}
          onClick={closeMoreMenu}
        >
          <div
            className={`bg-body rounded-top-3 w-100 ${styles.menu}`}
            style={{ maxHeight: '70vh' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0">المزيد</h5>
              <button className="btn btn-sm" onClick={closeMoreMenu} aria-label="إغلاق">
                <IconX size="1.25rem" />
              </button>
            </div>

            <div className="py-3">
              {moreMenuLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={menuItemClass} onClick={closeMoreMenu}>
                  {link.label}
                </NavLink>
              ))}

              <hr className="my-3" />

              <a
                href="https://t.me/rafeeqme"
                target="_blank"
                rel="noreferrer"
                className={`d-flex align-items-center px-4 py-2 text-decoration-none text-body ${styles.menuItem}`}
                onClick={closeMoreMenu}
              >
                <IconBrandTelegram className="me-2" size="1.25rem" />
                قناة التليجرام
              </a>
            </div>
          </div>
        </div>
      )}

      <nav
        className={`position-fixed bottom-0 start-0 end-0 bg-body border-top d-flex justify-content-around py-2 ${styles.tabBar}`}
      >
        <NavLink to={ROUTES.home} className={tabClass()}>
          <IconHome size="1.5rem" />
          <span className="mt-1 small">الرئيسية</span>
        </NavLink>

        <NavLink to={ROUTES.quran} className={tabClass(isQuranActive)}>
          <IconBook size="1.5rem" />
          <span className="mt-1 small">القرآن</span>
        </NavLink>

        <NavLink to={ROUTES.azkar} className={tabClass(isAzkarActive)}>
          <IconSparkles size="1.5rem" />
          <span className="mt-1 small">الأذكار</span>
        </NavLink>

        <NavLink to={ROUTES.radio} className={tabClass(isRadioActive, 'position-relative')}>
          <IconRadio size="1.5rem" />
          <span className="mt-1 small">الإذاعة</span>
          {isPlaying && <span className={`position-absolute top-0 end-0 ${styles.radioStatus}`}></span>}
        </NavLink>

        <button
          className={`d-flex flex-column align-items-center text-secondary bg-transparent border-0 px-2 py-1 rounded ${styles.tabItem}`}
          onClick={() => setShowMoreMenu((open) => !open)}
        >
          <IconDotsCircleHorizontal size="1.5rem" />
          <span className="mt-1 small">المزيد</span>
        </button>
      </nav>
    </div>
  )
}
