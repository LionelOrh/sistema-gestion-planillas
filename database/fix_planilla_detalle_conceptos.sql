-- Modificar la tabla planilla_detalle_conceptos para permitir id_concepto NULL
-- Esto permite guardar conceptos que no existen en la tabla conceptos (como sueldo básico o aportes calculados)

USE quimica_nava;

-- 1. Eliminar la foreign key constraint
ALTER TABLE planilla_detalle_conceptos 
DROP FOREIGN KEY planilla_detalle_conceptos_ibfk_2;

-- 2. Modificar la columna para permitir NULL
ALTER TABLE planilla_detalle_conceptos 
MODIFY COLUMN id_concepto INT NULL;

-- 3. Recrear la foreign key constraint con NULL permitido
ALTER TABLE planilla_detalle_conceptos 
ADD CONSTRAINT planilla_detalle_conceptos_ibfk_2 
FOREIGN KEY (id_concepto) 
REFERENCES conceptos (id_concepto) 
ON DELETE RESTRICT;

-- Verificar la estructura
DESCRIBE planilla_detalle_conceptos;
