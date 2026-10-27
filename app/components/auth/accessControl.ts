export const ALLOWED_PLAYER_EMAILS: string[] = (
  process.env.NEXT_PUBLIC_ALLOWED_PLAYER_EMAILS || ""
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const ALLOWED_ADMIN_EMAILS: string[] = (
  process.env.NEXT_PUBLIC_ALLOWED_ADMIN_EMAILS || ""
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAllowedEmail(email?: string | null): boolean {
  if (!email) return false;
  if (ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase())) {
    return true;
  } else {
    return ALLOWED_PLAYER_EMAILS.includes(email.trim().toLowerCase());
  }
}

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
