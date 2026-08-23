import { toArabicNumerals } from '@/shared/utils/arabic'

export default function ErrorState({ code, icon: Icon = null, message = 'حدث خطأ، برجاء المحاولة في وقت لاحق.' }) {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-6 text-center">
          {Icon && <Icon size="3rem" className="mb-3" />}
          {code && <h1 className="display-1">{toArabicNumerals(code)}</h1>}
          <p className="lead">{message}</p>
        </div>
      </div>
    </div>
  )
}
