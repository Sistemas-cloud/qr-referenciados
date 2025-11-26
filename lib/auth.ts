// Configuración de autenticación simple
export const AUTH_CONFIG = {
  username: 'admin',
  password: '002671st'
}

export function validateCredentials(username: string, password: string): boolean {
  return username === AUTH_CONFIG.username && password === AUTH_CONFIG.password
}

