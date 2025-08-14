-- Script para solucionar el problema de sistema de pensión
-- Este script creará sistemas de pensión básicos y asignará uno por defecto a trabajadores que no tengan

-- 1. Crear tabla sistema_pension si no existe
CREATE TABLE IF NOT EXISTS sistema_pension (
    id_sistema_pension INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('SPP', 'ONP') NOT NULL,
    porcentaje_aporte DECIMAL(5,2) DEFAULT 0.00,
    comision DECIMAL(5,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Insertar sistemas de pensión básicos si no existen
INSERT IGNORE INTO sistema_pension (nombre, tipo, porcentaje_aporte, comision) VALUES
('ONP', 'ONP', 13.00, 0.00),
('AFP Prima', 'SPP', 10.00, 1.60),
('AFP Integra', 'SPP', 10.00, 1.55),
('AFP Habitat', 'SPP', 10.00, 1.47),
('AFP Profuturo', 'SPP', 10.00, 1.69);

-- 3. Asignar ONP (id=1) a todos los trabajadores que no tengan sistema de pensión
UPDATE trabajadores 
SET id_sistema_pension = 1 
WHERE id_sistema_pension IS NULL;

-- 4. Mostrar resultado
SELECT 
    t.nombres,
    t.apellidos,
    sp.nombre as sistema_pension
FROM trabajadores t
LEFT JOIN sistema_pension sp ON t.id_sistema_pension = sp.id_sistema_pension
ORDER BY t.nombres;
