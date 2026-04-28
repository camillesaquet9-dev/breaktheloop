/**
 * Guest mode — when BTL_GUEST_MODE=true, /arena routes work without
 * authentication. Useful for demoing or testing while auth is being
 * debugged. Scores are NOT persisted in this mode.
 *
 * Disable by setting BTL_GUEST_MODE=false (or removing the var) and
 * redeploying.
 */
export function isGuestMode(): boolean {
  return process.env.BTL_GUEST_MODE === "true";
}
