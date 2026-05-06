/** @param {unknown} error */
export function isProfilesTableUnavailable(error) {
  if (!error || typeof error.message !== "string") return false;
  const code = /** @type {{ code?: string }} */ (error).code;
  const m = error.message.toLowerCase();
  if (code === "PGRST205" && m.includes("profiles")) return true;
  return (
    m.includes("profiles") &&
    (m.includes("schema cache") || m.includes("could not find the table"))
  );
}

/**
 * profiles.id → auth.users(id). Failure means this JWT/user isn’t in the connected project’s Auth.
 * @param {unknown} error
 */
export function isProfilesAuthUserFkViolation(error) {
  if (!error || typeof error.message !== "string") return false;
  const code = /** @type {{ code?: string }} */ (error).code;
  const m = error.message.toLowerCase();
  if (code === "23503" && m.includes("profiles")) return true;
  if (m.includes("profiles_id_fkey")) return true;
  return m.includes("foreign key") && m.includes("profiles");
}
