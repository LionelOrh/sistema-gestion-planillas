-- Script para actualizar la tabla trabajadores y agregar foreign key para sistema_pension
-- Fecha: 13 de agosto de 2025

USE quimica_nava;

-- Paso 1: Verificar la estructura actual
DESCRIBE trabajadores;

-- Paso 2: Agregar la nueva columna id_sistema_pension
ALTER TABLE trabajadores 
ADD COLUMN id_sistema_pension INT NULL 
AFTER sistema_pension;

-- Paso 3: Mapear datos existentes (basado en tu estructura actual)
-- Primero necesitamos crear algunos sistemas de pensión básicos si no existen
INSERT IGNORE INTO sistema_pension (nombre, tipo, codigo_sap) VALUES
('ONP Nacional', 'ONP', 'ONP001'),
('AFP Habitat', 'AFP', 'HAB001'),
('AFP Integra', 'AFP', 'INT001'),
('AFP Prima', 'AFP', 'PRI001'),
('AFP Profuturo', 'AFP', 'PRO001');

-- Mapear los datos existentes
UPDATE trabajadores t
SET t.id_sistema_pension = (
    CASE 
        WHEN t.sistema_pension = 'ONP' THEN (SELECT id_sistema_pension FROM sistema_pension WHERE tipo = 'ONP' LIMIT 1)
        WHEN t.sistema_pension = 'AFP_HABITAT' THEN (SELECT id_sistema_pension FROM sistema_pension WHERE nombre LIKE '%Habitat%' LIMIT 1)
        WHEN t.sistema_pension = 'AFP_INTEGRA' THEN (SELECT id_sistema_pension FROM sistema_pension WHERE nombre LIKE '%Integra%' LIMIT 1)
        WHEN t.sistema_pension = 'AFP_PRIMA' THEN (SELECT id_sistema_pension FROM sistema_pension WHERE nombre LIKE '%Prima%' LIMIT 1)
        WHEN t.sistema_pension = 'AFP_PROFUTURO' THEN (SELECT id_sistema_pension FROM sistema_pension WHERE nombre LIKE '%Profuturo%' LIMIT 1)
        ELSE NULL
    END
)
WHERE t.sistema_pension IS NOT NULL;

-- Paso 4: Eliminar la columna antigua sistema_pension
ALTER TABLE trabajadores 
DROP COLUMN sistema_pension;

-- Paso 5: Agregar la foreign key constraint
ALTER TABLE trabajadores
ADD CONSTRAINT fk_trabajadores_sistema_pension
FOREIGN KEY (id_sistema_pension) REFERENCES sistema_pension(id_sistema_pension)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Paso 6: Verificar la nueva estructura
DESCRIBE trabajadores;

-- Paso 7: Verificar las foreign keys
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'trabajadores' 
AND TABLE_SCHEMA = 'quimica_nava'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Consulta de prueba para verificar la relación
SELECT 
    t.id_trabajador,
    t.nombres,
    t.apellidos,
    sp.nombre AS sistema_pension_nombre,
    sp.tipo AS sistema_pension_tipo
FROM trabajadores t
LEFT JOIN sistema_pension sp ON t.id_sistema_pension = sp.id_sistema_pension
LIMIT 5;
