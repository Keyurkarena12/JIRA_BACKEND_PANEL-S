/**
 * Public app URLs — set in backend/.env
 * FRONTEND_URL = your frontend cloudflared tunnel (invite links, Stripe redirects, OAuth)
 * BACKEND_URL  = your backend cloudflared tunnel (OAuth callbacks)
 */
const stripTrailingSlash = (url) => (url ? String(url).replace(/\/+$/, '') : '');

export const FRONTEND_URL = stripTrailingSlash(
  process.env.FRONTEND_URL || 'http://localhost:5173'
);

export const BACKEND_URL = stripTrailingSlash(
  process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
);

/** Build a frontend path URL (path must start with /) */
export const frontendUrl = (path = '/') => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${FRONTEND_URL}${p}`;
};

/** Build accept-invite link with URL-safe encoded token */
export const acceptInviteUrl = (token) =>
  `${frontendUrl('/accept-invite')}?token=${encodeURIComponent(token)}`;

if (process.env.NODE_ENV !== 'test') {
  console.log('[urls] FRONTEND_URL:', FRONTEND_URL);
  console.log('[urls] BACKEND_URL:', BACKEND_URL);
}
