// 2026-09-09: Credenciales de login vía env (sin hardcode en producción).
export const AUTH_CONFIG = {
  username: process.env.AUTH_USERNAME || 'admin',
  password: process.env.AUTH_PASSWORD || '002671st',
}

export function validateCredentials(username: string, password: string): boolean {
  return username === AUTH_CONFIG.username && password === AUTH_CONFIG.password
}
