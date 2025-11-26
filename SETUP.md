# Guía de Configuración

## Paso 1: Configurar la Base de Datos en Supabase

### 1.1 Crear la tabla `wsp` (si no existe)

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
CREATE TABLE IF NOT EXISTS wsp (
    id SERIAL PRIMARY KEY,
    ctrl INTEGER NOT NULL,
    fecha DATE,
    estatus VARCHAR(15) NOT NULL DEFAULT '',
    qr INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pendiente'
);
```

### 1.2 Agregar la columna `status` (si la tabla ya existe)

Si la tabla `wsp` ya existe pero no tiene la columna `status`, ejecuta el script en:
`database/add_status_column.sql`

O ejecuta directamente:

```sql
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wsp' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE wsp 
        ADD COLUMN status VARCHAR(50) DEFAULT 'pendiente';
        
        UPDATE wsp 
        SET status = 'pendiente' 
        WHERE status IS NULL;
    END IF;
END $$;
```

### 1.3 Configurar permisos RLS (Row Level Security)

En Supabase, ve a Authentication > Policies y asegúrate de que la tabla `wsp` tenga los permisos correctos:

```sql
-- Habilitar RLS
ALTER TABLE wsp ENABLE ROW LEVEL SECURITY;

-- Política para lectura (ajusta según tus necesidades)
CREATE POLICY "Allow read access" ON wsp
    FOR SELECT USING (true);

-- Política para actualización
CREATE POLICY "Allow update access" ON wsp
    FOR UPDATE USING (true);
```

## Paso 2: Verificar Configuración de Supabase

El proyecto ya tiene configuradas las credenciales de Supabase en `lib/supabase.ts`. Si necesitas cambiarlas:

1. Abre `lib/supabase.ts`
2. Actualiza `supabaseUrl` y `supabaseAnonKey` con tus credenciales

## Paso 3: Instalar Dependencias

```bash
npm install
```

## Paso 4: Ejecutar el Proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Paso 5: Iniciar Sesión

- **Usuario:** admin
- **Contraseña:** 002671st

## Notas Importantes

1. **HTTPS en Producción**: Para usar la cámara, el sitio debe estar en HTTPS
2. **Permisos de Cámara**: El navegador solicitará permisos al usar el lector QR
3. **Columna Status**: Asegúrate de que la columna `status` exista antes de usar la aplicación

## Solución de Problemas

### Error: "relation wsp does not exist"
- Verifica que la tabla `wsp` esté creada en Supabase
- Revisa que estés usando la base de datos correcta

### Error: "column status does not exist"
- Ejecuta el script `database/add_status_column.sql` en Supabase

### Error de permisos en Supabase
- Verifica las políticas RLS en Supabase
- Asegúrate de que el API key tenga los permisos correctos

