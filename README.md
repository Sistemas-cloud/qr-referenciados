# Sistema QR — Familia Winston

App de validación/autorización de códigos QR del programa **Familia Winston**.

- Producción: https://familia-winston.vercel.app
- Repo: `Sistemas-cloud/qr-referenciados`
- Backend: **InsForge Winston Servicios** (tabla `wsp`) — 2026-09-09 migrado desde Supabase (proyecto `nmxrccrbnoenkahefrrw` sin DNS).

## Flujo

1. Login (usuario maestro)
2. Escanear QR (cámara o imagen) + número de control
3. Validar coincidencia en `wsp`
4. Autorizar (`status`: pendiente → autorizado)

## Variables de entorno

Ver `.env.example`:

- `NEXT_PUBLIC_INSFORGE_URL` / `INSFORGE_URL`
- `INSFORGE_API_KEY` (solo servidor)
- `AUTH_USERNAME` / `AUTH_PASSWORD`

## Tabla `wsp`

| Columna  | Tipo    | Notas                          |
|----------|---------|--------------------------------|
| id       | serial  | PK                             |
| ctrl     | int     | Número de control              |
| fecha    | date    |                                |
| estatus  | varchar | Legacy (ej. INICIAL)           |
| qr       | int     | Contenido numérico del QR      |
| status   | varchar | `pendiente` / `autorizado`     |

Alta vía API: `POST /api/wsp/create` `{ "ctrl": 12345, "qr": 678901 }`

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar credenciales
npm run dev
```

## Credenciales UI

Por defecto (sobreescritas por env): usuario `admin`.
