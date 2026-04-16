/**
 * Keyboard-first skip link. Hidden visually until focused, then pinned to
 * the top-left corner. Target must match <main id="main-content"> so the
 * next Tab after activation lands inside the page content, not back on nav.
 */
export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Passer au contenu
    </a>
  );
}
