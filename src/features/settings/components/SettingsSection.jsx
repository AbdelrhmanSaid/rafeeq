import { Children } from 'react'
import { useSettingsBare } from './settingsBareContext'
import styles from './SettingsSection.module.scss'

// A settings card: icon, title, description, an optional action in the header,
// and the setting's own controls as children.
export default function SettingsSection({ title = '', description = '', icon: Icon = null, actions, children }) {
  const bare = useSettingsBare()

  // Header-only cards (a switch in the header and nothing else) drop the body
  // wrapper entirely instead of leaving a gap.
  const hasBody = Children.toArray(children).length > 0

  if (bare) return <div>{children}</div>

  return (
    <section className="card h-100">
      <div className="card-body">
        {(title || actions) && (
          <header className={`${styles.header} ${hasBody ? '' : styles.flush}`}>
            <div className={styles.heading}>
              {Icon && (
                <span className={styles.icon}>
                  <Icon size={18} />
                </span>
              )}
              <div>
                <h6 className={styles.title}>{title}</h6>
                {description && <p className={styles.description}>{description}</p>}
              </div>
            </div>

            {actions && <div className={styles.actions}>{actions}</div>}
          </header>
        )}

        {hasBody && <div>{children}</div>}
      </div>
    </section>
  )
}
