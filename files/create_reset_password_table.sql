-- Script para crear tabla de tokens de recuperación de contraseña
-- Ejecutar este script en la base de datos de Ophira

CREATE TABLE IF NOT EXISTS reset_password_token (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    codigo VARCHAR(4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Índice para búsquedas rápidas por usuario y código
CREATE INDEX idx_reset_token_usuario_codigo ON reset_password_token(id_usuario, codigo);

-- Índice para limpiar tokens expirados
CREATE INDEX idx_reset_token_expires ON reset_password_token(expires_at);
