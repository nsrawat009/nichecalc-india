const styles = {
  positive: { bg: 'bg-accentL', border: 'border-accentM/40', icon: '✅', text: 'text-accent' },
  warning:  { bg: 'bg-warnL',   border: 'border-amber/40',   icon: '⚠️', text: 'text-warn' },
  info:     { bg: 'bg-blueL',   border: 'border-blue/30',    icon: 'ℹ️', text: 'text-blue' },
  neutral:  { bg: 'bg-bg',      border: 'border-border',     icon: '💡', text: 'text-muted' },
};

export default function Insight({ type = 'neutral', title, children }) {
  const s = styles[type];
  return (
    <div className={`rounded-xl p-4 border ${s.bg} ${s.border}`}>
      <p className={`text-sm font-semibold mb-1 ${s.text}`}>
        {s.icon} {title}
      </p>
      <p className="text-sm text-text leading-relaxed">{children}</p>
    </div>
  );
}
