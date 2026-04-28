"use client";

import { useEffect, useState } from "react";

type Event = [type: "BREACH" | "DENIED" | "DEFENSE", target: string, by: string];

const EVENTS: Event[] = [
  ["BREACH", "CH-047 · veiled_oracle", "k0re_dump"],
  ["DENIED", "CH-061 · whisper_net", "null_runner"],
  ["BREACH", "CH-018 · cold_mirror", "phasewalk"],
  ["DEFENSE", "CH-022 · reverse_seal", "cipherbloom"],
  ["BREACH", "CH-039 · echo_chamber", "morphine.exe"],
  ["DENIED", "CH-103 · gilded_lattice", "gh0st_thread"],
  ["BREACH", "CH-072 · hollow_loop", "static.signal"],
  ["DEFENSE", "CH-014 · iron_quote", "meridian_07"],
  ["BREACH", "CH-091 · pale_axiom", "__voidcursor"],
  ["DENIED", "CH-055 · nervous_kernel", "silver_thaw"],
];

export function ConsoleStrip() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const now = hydrated ? new Date().toISOString().slice(11, 19) : "00:00:00";
  const items = [...EVENTS, ...EVENTS];

  return (
    <div
      className="relative overflow-hidden whitespace-nowrap py-3 text-[11px]"
      style={{
        background: "var(--bg-1)",
        borderTop: "1px solid var(--line)",
        color: "var(--fg-mute)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-32 z-[2]"
        style={{ background: "linear-gradient(90deg, var(--bg-1), transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-32 z-[2]"
        style={{ background: "linear-gradient(-90deg, var(--bg-1), transparent)" }}
      />
      <div className="inline-flex gap-12 animate-scroll pl-6">
        {items.map((e, i) => {
          const color =
            e[0] === "BREACH"
              ? "var(--signal)"
              : e[0] === "DEFENSE"
                ? "var(--safe)"
                : "var(--fg-mute)";
          return (
            <span key={`${e[1]}-${i}`} className="inline-flex gap-2 items-center">
              <b style={{ color: "var(--fg-mute)", fontWeight: 400 }}>› {now}</b>
              <span style={{ color, fontStyle: "normal" }}>[{e[0]}]</span>
              <span style={{ color: "var(--fg-dim)" }}>{e[1]}</span>
              <span style={{ color: "var(--fg-mute)" }}>par</span>
              <span style={{ color: "var(--fg)" }}>@{e[2]}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
