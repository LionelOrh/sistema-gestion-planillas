-- Script para agregar campos de Asignación Familiar a la tabla trabajadores
-- Fecha: 15 de agosto de 2025
-- Descripción: Agrega campos para manejar asignación familiar y cantidad de hijos

-- Agregar campo asignacion_familiar (BOOLEAN)
-- Por defecto FALSE para trabajadores existentes
ALTER TABLE trabajadores 
ADD COLUMN asignacion_familiar BOOLEAN DEFAULT FALSE 
COMMENT 'Indica si el trabajador tiene derecho a asignación familiar';

-- Agregar campo cantidad_hijos (INTEGER)
-- Por defecto 0 para trabajadores existentes
ALTER TABLE trabajadores 
ADD COLUMN cantidad_hijos INT DEFAULT 0 
COMMENT 'Número de hijos menores del trabajador para asignación familiar';

-- Agregar índice para optimizar consultas de asignación familiar
ALTER TABLE trabajadores 
ADD INDEX idx_asignacion_familiar (asignacion_familiar);

-- Agregar constraint para validar cantidad_hijos (no puede ser negativo)
ALTER TABLE trabajadores 
ADD CONSTRAINT chk_cantidad_hijos CHECK (cantidad_hijos >= 0);

-- Opcional: Ver la estructura actualizada de la tabla
-- DESCRIBE trabajadores;

-- Comentarios adicionales:
-- 1. asignacion_familiar = TRUE significa que el trabajador tiene derecho
-- 2. cantidad_hijos debe ser mayor o igual a 0
-- 3. El cálculo será: 10% de RMV (1130) = 113 soles por hijo
-- 4. Se debe crear automáticamente el registro en trabajador_conceptos cuando asignacion_familiar = TRUE
