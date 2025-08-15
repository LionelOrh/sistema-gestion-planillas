-- Script para migrar tipos de contrato existentes
-- Fecha: 15 de agosto de 2025

-- Actualizar los tipos de contrato existentes para que coincidan con los nuevos valores del ENUM
-- Este script mapea los valores antiguos a los nuevos

-- Verificar datos existentes antes de la migración
SELECT 
    tipo_contrato,
    COUNT(*) as cantidad
FROM trabajadores 
GROUP BY tipo_contrato
ORDER BY cantidad DESC;

-- Migrar valores existentes
UPDATE trabajadores 
SET tipo_contrato = 'INDEFINIDO' 
WHERE tipo_contrato = 'INDEFINIDO' OR tipo_contrato = 'indefinido';

UPDATE trabajadores 
SET tipo_contrato = 'PLAZO_FIJO' 
WHERE tipo_contrato = 'TEMPORAL' OR tipo_contrato = 'temporal' OR tipo_contrato = 'PLAZO_FIJO';

UPDATE trabajadores 
SET tipo_contrato = 'OCASIONAL' 
WHERE tipo_contrato = 'ocasional' OR tipo_contrato = 'OCASIONAL';

-- Para trabajadores que puedan tener valores NULL o vacíos, asignar INDEFINIDO por defecto
UPDATE trabajadores 
SET tipo_contrato = 'INDEFINIDO' 
WHERE tipo_contrato IS NULL OR tipo_contrato = '';

-- Verificar los datos después de la migración
SELECT 
    tipo_contrato,
    COUNT(*) as cantidad
FROM trabajadores 
GROUP BY tipo_contrato
ORDER BY cantidad DESC;

-- Mostrar trabajadores que necesitan revisión manual (si los hay)
SELECT 
    id_trabajador,
    nombres,
    apellidos,
    tipo_contrato,
    fecha_ingreso,
    fecha_cese
FROM trabajadores 
WHERE tipo_contrato NOT IN (
    'INDEFINIDO',
    'PLAZO_FIJO',
    'OCASIONAL',
    'SUPLENCIA',
    'EMERGENCIA',
    'OBRA_DETERMINADA_O_SERVICIO_ESPECIFICO',
    'INTERMITENTE',
    'TEMPORADA'
);

SELECT 'Migración de tipos de contrato completada exitosamente.' as resultado;
