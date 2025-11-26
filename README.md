# Sistema de Validación QR

Sistema moderno de validación y autorización de códigos QR desarrollado con Next.js, TypeScript y Tailwind CSS.

## Características

- 🔐 Autenticación segura con usuario maestro
- 📷 Lector QR desde cámara del dispositivo
- 📁 Lector QR desde imagen subida
- ✅ Validación de número de control y código QR
- 🎯 Actualización de estado de registros en Supabase
- 🎨 Interfaz moderna y profesional con diseño responsivo

## Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase configurada
- Tabla `wsp` creada en Supabase con la columna `status`

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno (opcional, ya están configuradas en el código):
- Supabase URL y API Key están en `lib/supabase.ts`

3. Ejecutar el servidor de desarrollo:
```bash
npm run dev
```

4. Abrir [http://localhost:3000](http://localhost:3000) en el navegador

## Credenciales de Acceso

- **Usuario:** admin
- **Contraseña:** 002671st

## Estructura de la Base de Datos

La tabla `wsp` debe tener las siguientes columnas:
- `id` (SERIAL PRIMARY KEY)
- `ctrl` (INTEGER NOT NULL)
- `fecha` (DATE)
- `estatus` (VARCHAR(15))
- `qr` (INTEGER NOT NULL)
- `status` (VARCHAR, por defecto 'pendiente')

## Funcionalidades

### 1. Autenticación
- Login con usuario y contraseña
- Sesión persistente en localStorage
- Protección de rutas

### 2. Lector QR
- Escaneo en tiempo real desde la cámara
- Lectura de códigos QR desde imágenes
- Validación de formato

### 3. Validación
- Verifica que el número de control y QR coincidan con el mismo registro
- Muestra información del registro encontrado
- Permite autorizar registros pendientes

### 4. Actualización
- Cambia el estado de 'pendiente' a 'autorizado'
- Actualización en tiempo real en Supabase

## Tecnologías Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Supabase** - Base de datos y API
- **html5-qrcode** - Lector de códigos QR
- **lucide-react** - Iconos

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Linting
npm run lint
```

## Notas Importantes

1. **Permisos de Cámara**: El navegador solicitará permisos para acceder a la cámara
2. **HTTPS**: Para usar la cámara en producción, se requiere HTTPS
3. **Columna Status**: Asegúrate de que la columna `status` exista en la tabla `wsp` en Supabase

## Solución de Problemas

### Error: "No se pudo acceder a la cámara"
- Verifica que el navegador tenga permisos de cámara
- Asegúrate de estar usando HTTPS en producción
- Prueba con otro navegador

### Error: "No se encontró un registro"
- Verifica que el número de control y QR coincidan exactamente
- Confirma que los datos existen en Supabase
- Revisa la conexión a internet

### Error de autenticación en Supabase
- Verifica que las credenciales en `lib/supabase.ts` sean correctas
- Confirma que la tabla `wsp` existe y tiene los permisos correctos

## Licencia

Este proyecto es de uso privado.
