// The switch used by every on/off setting card's header.
export default function SettingsToggle({ checked, onChange, label }) {
  return (
    <div className="form-check form-switch m-0">
      <input
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="form-check-input"
        type="checkbox"
        aria-label={label}
      />
    </div>
  )
}
