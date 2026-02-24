// frontend/src/context/authHelpers.ts
export const ACCESS_TOKEN_KEY = 'accessToken';

export function setAccessToken(token: string | null) {
  try {
    if (token === null) localStorage.removeItem(ACCESS_TOKEN_KEY);
    else localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (err) {
    // ignore - localStorage unavailable in SSR/test envs
  }
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {}
}