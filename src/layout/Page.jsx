import styles from './Page.module.scss'

export default function Page({ className = '', children }) {
  return <main className={`container ${styles.page} ${className}`}>{children}</main>
}
