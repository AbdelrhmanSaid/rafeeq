import { Link } from 'react-router-dom'

export default function BackButton({ to, label = 'العودة', buttonClass = 'btn-flat', embedHidden = true }) {
  return (
    <Link
      to={to}
      className={`btn d-inline-flex align-items-center gap-2 ${buttonClass} ${embedHidden ? 'embed-hidden' : ''}`}
    >
      <span>{label}</span>
    </Link>
  )
}
