/**
 * Status bar — 6 cells, mock metrics for now.
 * Real metrics arrive once Supabase is wired (count operators, breaches today, etc.).
 */
const CELLS: Array<[string, string, string?]> = [
  ["SESSION", "0xA3F2-9C81"],
  ["OPÉRATEURS", "1 · live"],
  ["BREACHES JOUR", "+0", "var(--signal)"],
  ["SYSTÈMES SOUS ATTAQUE", "1"],
  ["UPTIME", "99.9%"],
  ["LATENCE", "23ms"],
];

export function TopBar() {
  return (
    <div
      className="hidden md:grid grid-cols-6 text-[10px] uppercase"
      style={{
        borderBottom: "1px solid var(--line)",
        color: "var(--fg-mute)",
        background: "var(--bg-1)",
        letterSpacing: "0.08em",
      }}
    >
      {CELLS.map(([label, value, color], i) => (
        <div
          key={label}
          className="flex justify-between gap-2.5 px-3.5 py-1.5"
          style={{
            borderRight: i === CELLS.length - 1 ? "none" : "1px solid var(--line)",
          }}
        >
          <span>{label}</span>
          <b
            className="font-medium"
            style={{ color: color ?? "var(--fg-dim)" }}
          >
            {value}
          </b>
        </div>
      ))}
    </div>
  );
}
