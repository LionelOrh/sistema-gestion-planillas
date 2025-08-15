-- Crear tabla parametros_sistema
CREATE TABLE parametros_sistema (
  id_parametro INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  valor_numerico DECIMAL(10,2) DEFAULT NULL,
  valor_texto VARCHAR(255) DEFAULT NULL,
  tipo_parametro ENUM('NUMERICO', 'TEXTO', 'PORCENTAJE') NOT NULL,
  es_editable BOOLEAN DEFAULT TRUE,
  fecha_vigencia_desde DATE NOT NULL,
  fecha_vigencia_hasta DATE DEFAULT NULL,
  estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  usuario_modificacion VARCHAR(100),
  
  -- Índices
  INDEX idx_codigo (codigo),
  INDEX idx_vigencia (fecha_vigencia_desde, fecha_vigencia_hasta),
  INDEX idx_estado (estado)
);

-- Insertar RMV inicial
INSERT INTO parametros_sistema (
  codigo, 
  nombre, 
  descripcion, 
  valor_numerico, 
  tipo_parametro, 
  fecha_vigencia_desde
) VALUES (
  'RMV_PERU', 
  'Remuneración Mínima Vital - Perú', 
  'Valor actual de la RMV establecido por el gobierno peruano', 
  1130.00, 
  'NUMERICO', 
  '2024-05-01'
);
