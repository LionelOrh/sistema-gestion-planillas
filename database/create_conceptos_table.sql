-- Script para crear la tabla de conceptos
-- Ejecutar en MySQL/MariaDB

-- Crear tabla conceptos
CREATE TABLE IF NOT EXISTS conceptos (
    id_concepto INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('ingreso', 'descuento', 'aporte-trabajador', 'aporte-empleador') NOT NULL,
    tipo_calculo ENUM('monto-fijo', 'porcentaje') NOT NULL,
    valor DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    codigo_contable VARCHAR(20) NULL,
    es_remunerativo BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_tipo (tipo),
    INDEX idx_activo (activo),
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_fecha_fin (fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar algunos conceptos de ejemplo
INSERT INTO conceptos (codigo, nombre, tipo, tipo_calculo, valor, codigo_contable, es_remunerativo, activo, fecha_inicio) VALUES
-- Ingresos
('001', 'Sueldo Básico', 'ingreso', 'monto-fijo', 1025.00, '621001', TRUE, TRUE, '2024-01-01'),
('002', 'Bonificación por Antiguedad', 'ingreso', 'monto-fijo', 102.50, '621002', TRUE, TRUE, '2024-01-01'),
('003', 'Asignación Familiar', 'ingreso', 'monto-fijo', 102.50, '621003', TRUE, TRUE, '2024-01-01'),

-- Descuentos
('101', 'Tardanzas', 'descuento', 'monto-fijo', 0.00, '627101', FALSE, TRUE, '2024-01-01'),
('102', 'Préstamos', 'descuento', 'monto-fijo', 0.00, '627102', FALSE, TRUE, '2024-01-01'),

-- Aportes del trabajador
('201', 'AFP - Aporte Obligatorio', 'aporte-trabajador', 'porcentaje', 10.00, '403001', FALSE, TRUE, '2024-01-01'),
('202', 'AFP - Prima de Seguros', 'aporte-trabajador', 'porcentaje', 1.36, '403002', FALSE, TRUE, '2024-01-01'),
('203', 'AFP - Comisión', 'aporte-trabajador', 'porcentaje', 1.60, '403003', FALSE, TRUE, '2024-01-01'),

-- Aportes del empleador
('301', 'ESSALUD', 'aporte-empleador', 'porcentaje', 9.00, '627301', FALSE, TRUE, '2024-01-01'),
('302', 'SCTR Salud', 'aporte-empleador', 'porcentaje', 0.75, '627302', FALSE, TRUE, '2024-01-01'),
('303', 'SCTR Pensión', 'aporte-empleador', 'porcentaje', 1.23, '627303', FALSE, TRUE, '2024-01-01');

-- Mostrar los conceptos creados
SELECT 
    id_concepto,
    codigo,
    nombre,
    tipo,
    tipo_calculo,
    valor,
    codigo_contable,
    es_remunerativo,
    activo,
    fecha_inicio,
    fecha_fin
FROM conceptos 
ORDER BY tipo, codigo;
