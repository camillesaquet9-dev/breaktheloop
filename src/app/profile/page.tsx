export default function ProfilePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-[1280px] mx-auto px-6 py-16"
    >
      <p
        className="font-mono text-xs uppercase mb-3"
        style={{ color: "var(--signal)", letterSpacing: "0.14em" }}
      >
        // PROFIL OPÉRATEUR
      </p>
      <h1
        className="font-display font-bold uppercase mb-6"
        style={{
          fontSize: "clamp(48px, 7vw, 96px)",
          letterSpacing: "-0.04em",
          lineHeight: 0.9,
        }}
      >
        Ton dossier.
      </h1>
      <p className="max-w-xl text-sm" style={{ color: "var(--fg-dim)", lineHeight: 1.6 }}>
        Connecte-toi pour voir tes statistiques, ton historique de breaches et ta progression
        par vecteur.
      </p>
    </main>
  );
}
