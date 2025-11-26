-- Script para agregar la columna 'status' a la tabla 'wsp' en Supabase
-- Ejecutar este script en el SQL Editor de Supabase si la columna no existe

-- Verificar si la columna existe y agregarla si no existe
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
        
        -- Actualizar registros existentes que no tengan status
        UPDATE wsp 
        SET status = 'pendiente' 
        WHERE status IS NULL;
    END IF;
END $$;

-- Verificar que la columna se creó correctamente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'wsp' AND column_name = 'status';

