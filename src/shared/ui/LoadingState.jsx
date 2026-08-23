export default function LoadingState({ message = 'جاري التحميل...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center gap-4">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">جاري التحميل...</span>
      </div>

      <p className="lead">{message}</p>
    </div>
  )
}
