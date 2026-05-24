export default function AdSlot({ size = "rectangle", className = "" }) {
  const sizes = {
    leaderboard: { w: "100%",   h: "90px",  label: "728×90 Leaderboard" },
    rectangle:   { w: "336px",  h: "280px", label: "336×280 Rectangle" },
    responsive:  { w: "100%",   h: "90px",  label: "Responsive Ad" },
  };
  const s = sizes[size] || sizes.rectangle;

  return (
    <div
      className={`flex items-center justify-center text-xs text-hint border border-dashed border-border rounded-lg mx-auto ${className}`}
      style={{ width: s.w, height: s.h, background: "#FAFAFA", maxWidth: "100%" }}
    >
      Ad — {s.label}
    </div>
  );
}
