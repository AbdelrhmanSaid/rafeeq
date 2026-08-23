import { Link, NavLink } from 'react-router-dom'
import {
  IconHome,
  IconBook,
  IconSparkles,
  IconRadio,
  IconDotsCircleHorizontal,
  IconBrandTelegram,
} from '@tabler/icons-react'

import Logo from '@/shared/ui/Logo'
import { ROUTES } from '@/app/router/routes'
import { useRadioStore } from '@/features/radio/store'
import { useActiveNav } from '@/layout/useActiveNav'
import styles from './Navbar.module.scss'

// A nav link stays highlighted on its section's detail routes, so `forceActive`
// overrides React Router's exact-path matching where a group is involved.
const navLinkClass =
  (forceActive = false) =>
  ({ isActive }) =>
    `nav-link ${styles.navLink} ${isActive || forceActive ? styles.active : ''}`

export default function Navbar({ className = '' }) {
  const isPlaying = useRadioStore((state) => state.isPlaying)
  const { isQuranActive, isAzkarActive, isRadioActive } = useActiveNav()

  return (
    <nav className={`navbar navbar-expand-lg sticky-top bg-body border-bottom py-3 ${styles.navbar} ${className}`}>
      <div className="container">
        <Link to={ROUTES.home} className="navbar-brand">
          <Logo />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="menu">
          <ul className="navbar-nav ms-lg-3 me-lg-auto mt-3 mt-lg-0 mb-2 mb-lg-0 gap-2">
            <li className="nav-item">
              <NavLink to={ROUTES.home} className={navLinkClass()}>
                <IconHome className="me-2" size="1.25rem" />
                <span>الرئيسية</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to={ROUTES.quran} className={navLinkClass(isQuranActive)}>
                <IconBook className="me-2" size="1.25rem" />
                <span>القرآن الكريم</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to={ROUTES.azkar} className={navLinkClass(isAzkarActive)}>
                <IconSparkles className="me-2" size="1.25rem" />
                <span>الأذكار</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to={ROUTES.radio} className={navLinkClass(isRadioActive)}>
                <IconRadio className="me-2" size="1.25rem" />
                <span>الإذاعة</span>
                {isPlaying && <span className={`ms-2 ${styles.radioStatus}`}></span>}
              </NavLink>
            </li>

            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle ${styles.navLink}`}
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <IconDotsCircleHorizontal className="me-2" size="1.25rem" />
                <span>المزيد</span>
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to={ROUTES.zakat}>
                    حاسبة الزكاة
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to={ROUTES.sebha}>
                    السبحة الإلكترونية
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to={ROUTES.settings}>
                    الإعدادات
                  </Link>
                </li>
              </ul>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto gap-2">
            <li className="nav-item">
              <a
                href="https://telegram.me/rafeeqme"
                target="_blank"
                rel="noreferrer"
                className={`nav-link ${styles.navLink}`}
              >
                <IconBrandTelegram className="me-2" size="1.25rem" />
                <span>قناة التليجرام</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
