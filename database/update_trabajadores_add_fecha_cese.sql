-- Script para agregar campo fecha_cese y actualizar tipos de contrato
-- Fecha: 15 de agosto de 2025

-- 1. Agregar el campo fecha_cese a la tabla trabajadores
ALTER TABLE trabajadores 
ADD COLUMN fecha_cese DATE NULL AFTER tipo_contrato;

-- 2. Actualizar el ENUM de tipo_contrato con los nuevos valores
ALTER TABLE trabajadores 
MODIFY COLUMN tipo_contrato ENUM(
    'INDEFINIDO',
    'PLAZO_FIJO',
    'OCASIONAL',
    'SUPLENCIA',
    'EMERGENCIA',
    'OBRA_DETERMINADA_O_SERVICIO_ESPECIFICO',
    'INTERMITENTE',
    'TEMPORADA'
) DEFAULT 'INDEFINIDO';

-- 3. Agregar comentarios a los campos para documentación
ALTER TABLE trabajadores 
MODIFY COLUMN fecha_cese DATE NULL COMMENT 'Fecha de finalización del contrato (solo para contratos de plazo fijo y similares)';

ALTER TABLE trabajadores 
MODIFY COLUMN tipo_contrato ENUM(
    'INDEFINIDO',
    'PLAZO_FIJO',
    'OCASIONAL',
    'SUPLENCIA',
    'EMERGENCIA',
    'OBRA_DETERMINADA_O_SERVICIO_ESPECIFICO',
    'INTERMITENTE',
    'TEMPORADA'
) DEFAULT 'INDEFINIDO' COMMENT 'Tipo de contrato laboral del trabajador';

-- 4. Crear índice en fecha_cese para consultas de trabajadores próximos a finalizar contrato
CREATE INDEX idx_trabajadores_fecha_cese ON trabajadores(fecha_cese);

-- 5. Verificar que los trabajadores existentes mantengan fecha_cese como NULL por defecto
-- (Esto ya se cumple automáticamente al agregar la columna con NULL)

SELECT 'Script ejecutado exitosamente. Campo fecha_cese agregado y tipos de contrato actualizados.' as resultado;
