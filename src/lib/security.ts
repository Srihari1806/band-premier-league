const ADMIN_SESSION_KEY = "bpl_admin_auth";

const ALLOWED_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const ALLOWED_IMAGE_PROTOCOLS = new Set(["http:", "https:", "data:", "blob:"]);

export function sanitizeText(value: unknown, maxLength = 500): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function normalizeUrl(value?: string | null): string | undefined {
  const raw = sanitizeText(value, 2048);
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    return ALLOWED_URL_PROTOCOLS.has(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function normalizeSocialHandle(value?: string | null): string {
  return sanitizeText(value, 80).replace(/^@+/, "").replace(/[^a-zA-Z0-9._]/g, "");
}

export function safeImageSrc(value?: string | null): string | undefined {
  const raw = sanitizeText(value, 1024 * 1024 * 4);
  if (!raw) return undefined;

  if (raw.startsWith("data:image/")) return raw;

  try {
    const url = new URL(raw);
    return ALLOWED_IMAGE_PROTOCOLS.has(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizeText(value, 254));
}

export function isValidPhone(value: string): boolean {
  return /^[+()\-\s0-9]{7,20}$/.test(sanitizeText(value, 20));
}

export function getConfiguredOperatorCredentials() {
  const loginId = (import.meta.env.VITE_BPL_OPERATOR_ID as string | undefined) || "bploperator";
  const password = (import.meta.env.VITE_BPL_OPERATOR_PASSWORD as string | undefined) || "bpladmin";

  return { loginId, password };
}

export function validateOperatorLogin(loginId: string, password: string): boolean {
  const credentials = getConfiguredOperatorCredentials();
  if (!credentials) return false;

  return (
    sanitizeText(loginId, 128) === credentials.loginId &&
    sanitizeText(password, 256) === credentials.password
  );
}

export function isOperatorSessionActive(): boolean {
  return typeof window !== "undefined" && sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function setOperatorSessionActive() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
  }
}

export function clearOperatorSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
