import { formatTimelineDate, labelForKind, TIMELINE, type TimelineEvent } from "@/lib/timeline";

/**
 * Chronological timeline for the About page.
 *
 * Server component. Pure typography + border rules; no motion. Upcoming
 * events get a dashed border and a muted tag instead of the normal solid
 * one — the visual metaphor is "planned, not yet lived".
 */
export function Timeline() {
  const sorted = [...TIMELINE].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ol className="relative space-y-10 border-l border-border pl-8 md:pl-10">
      {sorted.map((event) => (
        <TimelineEntry key={`${event.date}-${event.title}`} event={event} />
      ))}
    </ol>
  );
}

function TimelineEntry({ event }: { readonly event: TimelineEvent }) {
  return (
    <li className="relative">
      {/* Node dot — sits on the left rail. */}
      <span
        aria-hidden="true"
        className={`absolute top-1 h-2.5 w-2.5 -translate-x-[calc(2rem+5px)] md:-translate-x-[calc(2.5rem+5px)] ${
          event.upcoming ? "border border-dashed border-accent bg-background" : "bg-foreground"
        }`}
      />

      <div className="flex flex-wrap items-baseline gap-x-3">
        <time
          dateTime={event.date}
          className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
        >
          {formatTimelineDate(event.date)}
        </time>
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
            event.upcoming ? "text-accent" : "text-muted-foreground"
          }`}
        >
          {labelForKind(event.kind)}
          {event.upcoming && " · à venir"}
        </span>
      </div>

      <h3 className="mt-2 font-display text-2xl leading-tight">{event.title}</h3>

      <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {event.org}
        {event.location && ` · ${event.location}`}
      </p>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/90">{event.body}</p>
    </li>
  );
}
