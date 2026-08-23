import styles from './ZakatCalculatorCard.module.scss'

// One calculator: the inputs (as children), its result, and the shariah
// conditions that apply to this kind of wealth.
export default function ZakatCalculatorCard({ icon: Icon, title, result, conditionsTitle, conditions, children }) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center gap-3 mb-4">
          <span className={styles.iconContainer}>
            <Icon />
          </span>
          <h5 className="card-title mb-0">{title}</h5>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">{children}</div>

          <div className="col-lg-5">
            <div className={`${styles.result} h-100`}>
              <span className={styles.resultLabel}>مقدار الزكاة</span>
              <span className={styles.resultValue}>{result.value}</span>
              <span className={styles.resultHint}>{result.hint}</span>
            </div>
          </div>
        </div>

        <div className={`${styles.note} mt-4`}>
          <h6 className="mb-2">{conditionsTitle}</h6>
          <ul className="mb-0">
            {conditions.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
