import Link from "next/link";

const COMMIT_SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA ?? "").slice(0, 7);

const NAV_GROUPS = [
  {
    heading: "Site",
    links: [
      { href: "/projects", label: "Projects", external: false },
      { href: "/about", label: "About", external: false },
      { href: "/contact", label: "Contact", external: false },
    ],
  },
  {
    heading: "Elsewhere",
    links: [
      { href: "https://github.com/camillesaquet", label: "GitHub", external: true },
      {
        href: "https://www.linkedin.com/in/camille-saquet",
        label: "LinkedIn",
        external: true,
      },
    ],
  },
  {
    heading: "Security",
    links: [
      { href: "/.well-known/security.txt", label: "security.txt", external: false },
      { href: "/humans.txt", label: "humans.txt", external: false },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <p className="mb-10 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          — FOOTER / 99
        </p>

        <div className="grid gap-10 md:grid-cols-3">
          {/* Identity */}
          <div className="space-y-2">
            <p className="font-display text-2xl leading-tight">Camille Saquet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Cybersecurity student — red team oriented. Based in Lannion, France.
            </p>
          </div>

          {/* Link groups */}
          {NAV_GROUPS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {group.heading}
              </p>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {link.label}
                        <span aria-hidden className="ml-1 font-mono text-muted-foreground">
                          ↗
                        </span>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t pt-6 font-mono text-xs text-muted-foreground">
          <span>© {year} Camille Saquet — breaktheloop.site</span>
          <span>
            build <code className="text-foreground">{COMMIT_SHA || "dev"}</code>
          </span>
        </div>
      </div>
    </footer>
  );
}
