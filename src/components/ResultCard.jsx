export default function ResultCard({ label, value, primary = false, suffix = "" }) {
  return (
    <div className={`rounded-xl p-4 border ${
      primary
        ? 'bg-accentL border-accentM/40'
        : 'bg-bg border-border'
    }`}>
      <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${primary ? 'text-accentM' : 'text-muted'}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold font-serif ${primary ? 'text-accent' : 'text-text'}`}>
        {value}{suffix}
      </p>
    </div>
  );
}
