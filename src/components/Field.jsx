export default function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text">{label}</label>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {children}
    </div>
  );
}

export function NumberInput({ value, onChange, min, max, step = 1, prefix = "₹" }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full border border-border rounded-lg py-2.5 pr-3 text-sm bg-surface focus:outline-none focus:border-accentM transition-colors ${prefix ? 'pl-7' : 'pl-3'}`}
      />
    </div>
  );
}

export function Slider({ value, onChange, min, max, step = 1000 }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full bg-border appearance-none cursor-pointer mt-1"
    />
  );
}

export function Toggle({ options, value, onChange }) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden w-fit">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-accentL border-r border-accentM text-accent'
              : 'bg-surface text-muted hover:bg-bg'
          } last:border-r-0`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
