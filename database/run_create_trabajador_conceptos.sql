-- Ejecutar este script para crear la tabla trabajador_conceptos

USE planillas_db;

-- Tabla para la relación entre trabajadores y conceptos asignados
CREATE TABLE IF NOT EXISTS trabajador_conceptos (
    id_trabajador_concepto INT PRIMARY KEY AUTO_INCREMENT,
    id_trabajador INT NOT NULL,
    id_concepto INT NOT NULL,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id_trabajador) ON DELETE CASCADE,
    FOREIGN KEY (id_concepto) REFERENCES conceptos(id_concepto) ON DELETE CASCADE,
    
    -- Índice único para evitar duplicados (un trabajador no puede tener el mismo concepto asignado dos veces)
    UNIQUE KEY unique_trabajador_concepto (id_trabajador, id_concepto),
    
    -- Índices para optimizar consultas
    INDEX idx_trabajador (id_trabajador),
    INDEX idx_concepto (id_concepto),
    INDEX idx_activo (activo)
);

-- Comentarios para documentar la tabla
ALTER TABLE trabajador_conceptos COMMENT = 'Tabla de relación entre trabajadores y conceptos';

-- Verificar que la tabla se creó correctamente
DESCRIBE trabajador_conceptos;

-- Mostrar estadísticas iniciales
SELECT 'Tabla trabajador_conceptos creada exitosamente' as status;
