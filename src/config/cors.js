/**
 * CORS origins for Express + Socket.io.
 * Set FRONTEND_URL in backend/.env to your frontend tunnel URL.
 * Set ALLOW_TUNNEL_CORS=true to allow any *.trycloudflare.com origin (handy when tunnels rotate).
 */
const normalizeOrigin = (url) => String(url || '').trim().replace(/\/+$/, '');

const parseExtraOrigins = () =>
  String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

export const getAllowedOrigins = () => {
  const origins = new Set([
    normalizeOrigin(process.env.FRONTEND_URL),
    'http://localhost:5173',
    'http://localhost:5000',
    ...parseExtraOrigins(),
  ].filter(Boolean));

  return [...origins];
};

export const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const allowed = getAllowedOrigins();
  if (allowed.includes(normalizeOrigin(origin))) return true;

  if (process.env.ALLOW_TUNNEL_CORS === 'true') {
    try {
      const { hostname } = new URL(origin);
      if (hostname.endsWith('.trycloudflare.com')) return true;
    } catch {
      return false;
    }
  }

  return false;
};

export const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
};

export const socketCorsOptions = {
  origin: (origin, callback) => {
    callback(null, isOriginAllowed(origin));
  },
  credentials: true,
};
