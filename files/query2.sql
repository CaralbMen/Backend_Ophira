-- =====================================================
-- SCRIPT COMPLETO DE BASE DE DATOS CON DEPRECIACIÓN AUTOMÁTICA (CORREGIDO - CONVERSIÓN DE FECHAS)
-- =====================================================

-- 1. TABLAS PRINCIPALES
-- =====================================================

CREATE TABLE IF NOT EXISTS rol (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS area (
    id_area SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS puesto (
    id_puesto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    id_area INTEGER NOT NULL,
    CONSTRAINT fk_puesto_area
        FOREIGN KEY (id_area)
        REFERENCES area(id_area)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(150) default null,
    apellido_paterno VARCHAR(150) NOT NULL,
    apellido_materno VARCHAR(150),
    correo VARCHAR(200) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_rol INTEGER NOT NULL,
	id_puesto INTEGER NOT NULL,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (id_rol)
        REFERENCES rol(id_rol)
        ON DELETE RESTRICT,
    CONSTRAINT fk_usuario_puesto
        FOREIGN KEY (id_puesto)
        REFERENCES puesto(id_puesto)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS login (
    id_login SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    CONSTRAINT fk_login_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS edificio (
    id_edificio varchar(10) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    cantidad_pisos INTEGER NOT NULL CHECK (cantidad_pisos > 0),
	direccion text not null
);

CREATE TABLE IF NOT EXISTS piso (
	id_piso varchar(10) primary key,
	id_edificio varchar(10) NOT NULL,
    numero_piso INTEGER NOT NULL,
	cantidad_aulas integer not null check(cantidad_aulas>0),
    CONSTRAINT fk_piso_edificio
        FOREIGN KEY (id_edificio)
        REFERENCES edificio(id_edificio)
        ON DELETE CASCADE,
	constraint u_piso unique(id_edificio, numero_piso)
);

CREATE TABLE IF NOT EXISTS aula (
    id_aula varchar(10) PRIMARY KEY,
	id_piso varchar(10) NOT NULL,
    numero_aula VARCHAR(50) NOT NULL,
    CONSTRAINT fk_aula_piso
        FOREIGN KEY (id_piso)
        REFERENCES piso(id_piso)
        ON DELETE CASCADE,
	constraint u_aula unique(id_piso, numero_aula)
);

CREATE TABLE IF NOT EXISTS estado_activo (
    id_estado_activo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color varchar(10)
);

CREATE TABLE IF NOT EXISTS metodo_depreciacion (
    id_metodo_depreciacion SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    parametros JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS activo (
    id_activo SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    modelo VARCHAR(150),
    numero_serie VARCHAR(150) UNIQUE,
    fecha_compra DATE NOT NULL,
    fecha_inicio_depreciacion DATE NULL,
    fecha_ultima_depreciacion DATE NULL,
    fecha_prox_depreciacion DATE NULL,
    valor_actual NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (valor_actual >= 0),
    precio_compra NUMERIC(12,2) NOT NULL CHECK (precio_compra >= 0),
    valor_residual NUMERIC(12,2) DEFAULT 0 CHECK (valor_residual >= 0),
    vida_util_anios INTEGER CHECK (vida_util_anios > 0),
    id_metodo_depreciacion INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    id_estado_activo INTEGER NOT NULL,
    id_aula VARCHAR(10) NOT NULL,
    CONSTRAINT fk_activo_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria),
    CONSTRAINT fk_activo_estado
        FOREIGN KEY (id_estado_activo)
        REFERENCES estado_activo(id_estado_activo),
    CONSTRAINT fk_activo_aula
        FOREIGN KEY (id_aula)
        REFERENCES aula(id_aula),
    CONSTRAINT fk_activo_metodo_depreciacion
        FOREIGN KEY (id_metodo_depreciacion)
        REFERENCES metodo_depreciacion(id_metodo_depreciacion)
);

CREATE TABLE IF NOT EXISTS partes_de_activo (
    id_parte SERIAL PRIMARY KEY,
    id_activo INTEGER NOT NULL,
    numero_parte VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    descripcion TEXT,
    CONSTRAINT fk_partes_activo
        FOREIGN KEY (id_activo)
        REFERENCES activo(id_activo)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_partes_activo ON partes_de_activo(id_activo);

CREATE TABLE IF NOT EXISTS activo_responsable (
    id_activo_responsable SERIAL PRIMARY KEY,
    id_activo INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    CONSTRAINT fk_responsable_activo
        FOREIGN KEY (id_activo)
        REFERENCES activo(id_activo)
        ON DELETE CASCADE,
    CONSTRAINT fk_responsable_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS movimiento (
    id_movimiento SERIAL PRIMARY KEY,
    tipo_movimiento VARCHAR(50) NOT NULL,
    fecha_movimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    id_usuario INTEGER NOT NULL,
    id_activo INTEGER NOT NULL,
    CONSTRAINT fk_movimiento_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario),
    CONSTRAINT fk_movimiento_activo
        FOREIGN KEY (id_activo)
        REFERENCES activo(id_activo)
);

CREATE TABLE IF NOT EXISTS movimiento_actualizacion (
    id_movimiento INTEGER PRIMARY KEY,
    campo_modificado VARCHAR(150) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    justificacion TEXT,
    CONSTRAINT fk_actualizacion_movimiento
        FOREIGN KEY (id_movimiento)
        REFERENCES movimiento(id_movimiento)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS movimiento_depreciacion (
    id_movimiento INTEGER PRIMARY KEY,
    valor_depreciado NUMERIC(12,2) NOT NULL CHECK (valor_depreciado >= 0),
    valor_restante NUMERIC(12,2) NOT NULL CHECK (valor_restante >= 0),
    id_metodo_depreciacion INTEGER NOT NULL,
    parametros_usados JSONB,
    CONSTRAINT fk_depreciacion_movimiento
        FOREIGN KEY (id_movimiento)
        REFERENCES movimiento(id_movimiento)
        ON DELETE CASCADE,
    CONSTRAINT fk_depreciacion_metodo
        FOREIGN KEY (id_metodo_depreciacion)
        REFERENCES metodo_depreciacion(id_metodo_depreciacion)
);

CREATE TABLE IF NOT EXISTS movimiento_ubicacion (
    id_movimiento INTEGER PRIMARY KEY,
    id_aula_origen varchar(10) NOT NULL,
    id_aula_destino varchar(10) NOT NULL,
    CONSTRAINT fk_ubicacion_movimiento
        FOREIGN KEY (id_movimiento)
        REFERENCES movimiento(id_movimiento)
        ON DELETE CASCADE,
    CONSTRAINT fk_ubicacion_origen
        FOREIGN KEY (id_aula_origen)
        REFERENCES aula(id_aula),
    CONSTRAINT fk_ubicacion_destino
        FOREIGN KEY (id_aula_destino)
        REFERENCES aula(id_aula),
    CONSTRAINT chk_aulas_diferentes
        CHECK (id_aula_origen <> id_aula_destino)
);

CREATE TABLE IF NOT EXISTS movimiento_baja (
    id_movimiento INTEGER PRIMARY KEY,
    motivo_baja TEXT NOT NULL,
    CONSTRAINT fk_baja_movimiento
        FOREIGN KEY (id_movimiento)
        REFERENCES movimiento(id_movimiento)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    id_movimiento INTEGER NOT NULL,
    id_usuario_auditor INTEGER NOT NULL,
    fecha_auditoria TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
	estados_activos JSONB,
    ubicacion VARCHAR(255) NULL,
    estado_general VARCHAR(50) NOT NULL DEFAULT 'finalizada',
    CONSTRAINT fk_auditoria_movimiento
        FOREIGN KEY (id_movimiento)
        REFERENCES movimiento(id_movimiento)
        ON DELETE CASCADE,
    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (id_usuario_auditor)
        REFERENCES usuario(id_usuario)
);

-- 2. DATOS DE PRUEBA (SIN ON CONFLICT, CON CONVERSIÓN DE FECHAS)
-- =====================================================

-- Roles
INSERT INTO rol (nombre, descripcion) 
SELECT 'Admin', 'Administrador del sistema'
WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'Admin');

INSERT INTO rol (nombre, descripcion) 
SELECT 'Usuario', 'Usuario operativo'
WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'Usuario');

-- Área
INSERT INTO area (nombre) 
SELECT 'TI'
WHERE NOT EXISTS (SELECT 1 FROM area WHERE nombre = 'TI');

-- Puesto
INSERT INTO puesto (nombre, id_area) 
SELECT 'Desarrollador', 1
WHERE NOT EXISTS (SELECT 1 FROM puesto WHERE nombre = 'Desarrollador' AND id_area = 1);

-- Usuario
INSERT INTO usuario (nombre_usuario, nombre, apellido_paterno, correo, id_rol, id_puesto, password, activo) 
SELECT 'ricky', 'Ricky', 'Vel', 'ricky@mail.com', 1, 1, '123456', true
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE nombre_usuario = 'ricky');

INSERT INTO usuario (nombre_usuario, nombre, apellido_paterno, correo, id_rol, id_puesto, password, activo) 
SELECT 'system', 'Sistema', 'Automatico', 'system@local.com', 1, 1, 'system', false
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE nombre_usuario = 'system');

-- Edificio
INSERT INTO edificio (id_edificio, nombre, cantidad_pisos, direccion) 
SELECT 'A', 'Principal', 2, 'UPQ'
WHERE NOT EXISTS (SELECT 1 FROM edificio WHERE id_edificio = 'A');

INSERT INTO edificio (id_edificio, nombre, cantidad_pisos, direccion) 
SELECT 'B', 'B', 2, 'UPQ'
WHERE NOT EXISTS (SELECT 1 FROM edificio WHERE id_edificio = 'B');

INSERT INTO edificio (id_edificio, nombre, cantidad_pisos, direccion) 
SELECT 'F', 'Edificio F', 3, 'Calle Principal 123'
WHERE NOT EXISTS (SELECT 1 FROM edificio WHERE id_edificio = 'F');

-- Piso
INSERT INTO piso (id_piso, numero_piso, id_edificio, cantidad_aulas) 
SELECT 'A1', 1, 'A', 8
WHERE NOT EXISTS (SELECT 1 FROM piso WHERE id_piso = 'A1');

INSERT INTO piso (id_piso, numero_piso, id_edificio, cantidad_aulas) 
SELECT 'B1', 1, 'B', 5
WHERE NOT EXISTS (SELECT 1 FROM piso WHERE id_piso = 'B1');

-- Aula
INSERT INTO aula (id_aula, numero_aula, id_piso) 
SELECT 'A105', '5', 'A1'
WHERE NOT EXISTS (SELECT 1 FROM aula WHERE id_aula = 'A105');

INSERT INTO aula (id_aula, numero_aula, id_piso) 
SELECT 'A101', 'A-101', 'A1'
WHERE NOT EXISTS (SELECT 1 FROM aula WHERE id_aula = 'A101');

-- Estado Activo
INSERT INTO estado_activo (nombre, color) VALUES 
('Activo', 'green'),
('Mantenimiento', 'yellow'),
('Retirado', 'red'),
('Nuevo', NULL),
('Bueno', NULL),
('Regular', NULL),
('Malo', NULL),
('Dado de Baja', NULL)
ON CONFLICT (nombre) DO NOTHING;

-- Método de Depreciación
INSERT INTO metodo_depreciacion (nombre, descripcion, parametros) VALUES
('Línea Recta', 'Depreciación uniforme a lo largo de la vida útil', 
 '{"tipo": "linea_recta", "formula": "(costo - valor_residual) / vida_util"}'::JSONB),
('SYD (Suma de Dígitos)', 'Depreciación acelerada basada en la suma de los años', 
 '{"tipo": "syd"}'::JSONB),
('Saldo Decreciente', 'Depreciación acelerada con una tasa fija', 
 '{"tipo": "saldo_decreciente", "tasa": 0.40}'::JSONB)
ON CONFLICT (nombre) DO NOTHING;

-- Categoría
INSERT INTO categoria (nombre, descripcion) 
SELECT 'Equipo de Cómputo', 'Computadoras y laptops'
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Equipo de Cómputo');

-- Activos de prueba (con conversión de fechas)
INSERT INTO activo (
    nombre, descripcion, modelo, numero_serie,
    fecha_compra, fecha_inicio_depreciacion,
    precio_compra, valor_residual, vida_util_anios,
    id_metodo_depreciacion, id_categoria, id_estado_activo, id_aula,
    valor_actual
) 
SELECT 'Laptop HP', 'Laptop para desarrollo', 'EliteBook 840', 'SN-LAP-001',
    '2024-01-01'::DATE, '2024-01-01'::DATE,
    10000.00, 1000.00, 5,
    1, 1, 1, 'A105',
    10000.00
WHERE NOT EXISTS (SELECT 1 FROM activo WHERE numero_serie = 'SN-LAP-001')

UNION ALL

SELECT 'Impresora Epson', 'Impresora láser', 'WorkForce Pro', 'SN-IMP-001',
    '2024-01-01'::DATE, '2024-01-01'::DATE,
    8000.00, 500.00, 4,
    2, 1, 1, 'A105',
    8000.00
WHERE NOT EXISTS (SELECT 1 FROM activo WHERE numero_serie = 'SN-IMP-001')

UNION ALL

SELECT 'Servidor Dell', 'Servidor de red', 'PowerEdge R740', 'SN-SRV-001',
    '2024-01-01'::DATE, '2024-01-01'::DATE,
    20000.00, 2000.00, 5,
    3, 1, 1, 'A105',
    20000.00
WHERE NOT EXISTS (SELECT 1 FROM activo WHERE numero_serie = 'SN-SRV-001')

UNION ALL

SELECT 'Monitor LG', 'Monitor 24 pulgadas', '24MP60G', 'SN-MON-001',
    '2024-03-01'::DATE, '2024-04-01'::DATE,
    3000.00, 300.00, 3,
    1, 1, 1, 'A105',
    3000.00
WHERE NOT EXISTS (SELECT 1 FROM activo WHERE numero_serie = 'SN-MON-001')

UNION ALL

SELECT 'Tablet Samsung', 'Tablet para presentaciones', 'Galaxy Tab S7', 'SN-TAB-001',
    '2024-02-15'::DATE, '2024-03-01'::DATE,
    5000.00, 500.00, 3,
    2, 1, 1, 'A105',
    5000.00
WHERE NOT EXISTS (SELECT 1 FROM activo WHERE numero_serie = 'SN-TAB-001');

-- 3. FUNCIONES PRINCIPALES
-- =====================================================

-- Función auxiliar para calcular próxima depreciación
CREATE OR REPLACE FUNCTION fecha_calcular_proxima_depreciacion(
    p_activo_id INT,
    p_fecha_base DATE
)
RETURNS DATE
LANGUAGE plpgsql
AS $func$
DECLARE
    v_fecha_proxima DATE;
BEGIN
    v_fecha_proxima := p_fecha_base + INTERVAL '1 month';
    RETURN v_fecha_proxima;
END;
$func$;

-- Función para registrar depreciación y actualizar valor actual
CREATE OR REPLACE FUNCTION registrar_depreciacion(
    p_activo_id INT,
    p_fecha_depreciacion DATE DEFAULT CURRENT_DATE,
    p_id_usuario INT DEFAULT 2
)
RETURNS TABLE(
    movimiento_id INT,
    depreciacion_mensual NUMERIC,
    valor_anterior NUMERIC,
    valor_nuevo NUMERIC,
    mensaje TEXT
)
LANGUAGE plpgsql
AS $func$
DECLARE
    v_activo RECORD;
    v_depreciacion_mensual NUMERIC;
    v_valor_anterior NUMERIC;
    v_valor_nuevo NUMERIC;
    v_metodo_parametros JSONB;
    v_metodo_tipo TEXT;
    v_vida_meses INT;
    v_depreciable NUMERIC;
    v_movimiento_id INT;
    v_meses_depreciados INT;
BEGIN
    SELECT 
        a.*,
        m.parametros as metodo_parametros,
        m.nombre as metodo_nombre
    INTO v_activo
    FROM activo a
    JOIN metodo_depreciacion m ON a.id_metodo_depreciacion = m.id_metodo_depreciacion
    WHERE a.id_activo = p_activo_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Activo con ID % no encontrado', p_activo_id;
    END IF;
    
    IF v_activo.id_estado_activo IN (SELECT id_estado_activo FROM estado_activo WHERE nombre = 'Dado de Baja') THEN
        RAISE EXCEPTION 'El activo ya está dado de baja';
    END IF;
    
    IF v_activo.fecha_ultima_depreciacion >= date_trunc('month', p_fecha_depreciacion) THEN
        RAISE EXCEPTION 'Ya se registró depreciación para este mes';
    END IF;
    
    v_meses_depreciados := EXTRACT(MONTH FROM age(p_fecha_depreciacion, COALESCE(v_activo.fecha_ultima_depreciacion, v_activo.fecha_inicio_depreciacion)))::INT;
    IF v_meses_depreciados = 0 THEN
        v_meses_depreciados := 1;
    END IF;
    
    v_valor_anterior := v_activo.valor_actual;
    v_metodo_tipo := v_activo.metodo_parametros->>'tipo';
    v_depreciable := v_activo.precio_compra - v_activo.valor_residual;
    v_vida_meses := v_activo.vida_util_anios * 12;
    
    CASE v_metodo_tipo
        WHEN 'linea_recta' THEN
            v_depreciacion_mensual := v_depreciable / v_vida_meses;
            v_depreciacion_mensual := v_depreciacion_mensual * v_meses_depreciados;
            
        WHEN 'syd' THEN
            DECLARE
                v_anio_actual INT;
                v_suma_digitos_anual INT;
                v_depreciacion_anual NUMERIC;
            BEGIN
                v_anio_actual := EXTRACT(YEAR FROM age(p_fecha_depreciacion, v_activo.fecha_inicio_depreciacion))::INT + 1;
                IF v_anio_actual > v_activo.vida_util_anios THEN
                    v_anio_actual := v_activo.vida_util_anios;
                END IF;
                v_suma_digitos_anual := v_activo.vida_util_anios * (v_activo.vida_util_anios + 1) / 2;
                v_depreciacion_anual := ((v_activo.vida_util_anios - v_anio_actual + 1)::NUMERIC / v_suma_digitos_anual * v_depreciable);
                v_depreciacion_mensual := (v_depreciacion_anual / 12) * v_meses_depreciados;
            END;
            
        WHEN 'saldo_decreciente' THEN
            DECLARE
                v_tasa_anual NUMERIC;
                v_tasa_mensual NUMERIC;
            BEGIN
                v_tasa_anual := COALESCE((v_activo.metodo_parametros->>'tasa')::NUMERIC, 0.40);
                v_tasa_mensual := 1 - (1 - v_tasa_anual)^(1.0/12);
                v_depreciacion_mensual := v_activo.valor_actual * v_tasa_mensual * v_meses_depreciados;
            END;
            
        ELSE
            RAISE EXCEPTION 'Método de depreciación no soportado: %', v_metodo_tipo;
    END CASE;
    
    v_valor_nuevo := v_activo.valor_actual - v_depreciacion_mensual;
    IF v_valor_nuevo < v_activo.valor_residual THEN
        v_depreciacion_mensual := v_activo.valor_actual - v_activo.valor_residual;
        v_valor_nuevo := v_activo.valor_residual;
    END IF;
    
    IF v_depreciacion_mensual <= 0 THEN
        RETURN QUERY SELECT NULL::INT, 0::NUMERIC, v_valor_anterior, v_valor_nuevo, 'No hay depreciación pendiente'::TEXT;
        RETURN;
    END IF;
    
    INSERT INTO movimiento (
        tipo_movimiento, 
        fecha_movimiento, 
        descripcion, 
        id_usuario, 
        id_activo
    ) VALUES (
        'depreciacion',
        p_fecha_depreciacion,
        'Registro de depreciación mensual - Método: ' || v_activo.metodo_nombre,
        p_id_usuario,
        p_activo_id
    )
    RETURNING id_movimiento INTO v_movimiento_id;
    
    INSERT INTO movimiento_depreciacion (
        id_movimiento,
        valor_depreciado,
        valor_restante,
        id_metodo_depreciacion,
        parametros_usados
    ) VALUES (
        v_movimiento_id,
        ROUND(v_depreciacion_mensual, 2),
        ROUND(v_valor_nuevo, 2),
        v_activo.id_metodo_depreciacion,
        jsonb_build_object(
            'fecha_calculo', p_fecha_depreciacion,
            'valor_anterior', v_valor_anterior,
            'meses_depreciados', v_meses_depreciados,
            'tasa_aplicada', CASE WHEN v_metodo_tipo = 'saldo_decreciente' 
                THEN (v_activo.metodo_parametros->>'tasa')::NUMERIC 
                ELSE NULL END
        )
    );
    
    UPDATE activo 
    SET 
        valor_actual = ROUND(v_valor_nuevo, 2),
        fecha_ultima_depreciacion = p_fecha_depreciacion,
        fecha_prox_depreciacion = p_fecha_depreciacion + INTERVAL '1 month'
    WHERE id_activo = p_activo_id;
    
    IF v_valor_nuevo <= v_activo.valor_residual THEN
        UPDATE activo 
        SET id_estado_activo = (SELECT id_estado_activo FROM estado_activo WHERE nombre = 'Regular')
        WHERE id_activo = p_activo_id;
    END IF;
    
    RETURN QUERY 
    SELECT 
        v_movimiento_id::INT,
        ROUND(v_depreciacion_mensual, 2)::NUMERIC,
        v_valor_anterior::NUMERIC,
        ROUND(v_valor_nuevo, 2)::NUMERIC,
        'Depreciación registrada exitosamente'::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            NULL::INT, 
            0::NUMERIC, 
            NULL::NUMERIC, 
            NULL::NUMERIC, 
            'Error: ' || SQLERRM::TEXT;
END;
$func$;

-- Función para aplicar depreciaciones pendientes automáticamente
CREATE OR REPLACE FUNCTION aplicar_depreciaciones_pendientes()
RETURNS TEXT
LANGUAGE plpgsql
AS $func$
DECLARE
    v_activo RECORD;
    v_resultado RECORD;
    v_contador INT := 0;
    v_log TEXT := '';
    v_fecha_actual DATE := CURRENT_DATE;
BEGIN
    v_log := v_log || format('=== VERIFICANDO DEPRECIACIONES PENDIENTES: %s ===\n', v_fecha_actual);
    
    FOR v_activo IN 
        SELECT 
            a.id_activo, 
            a.nombre, 
            a.valor_actual, 
            a.valor_residual,
            a.fecha_prox_depreciacion
        FROM activo a
        WHERE a.id_estado_activo NOT IN (
            SELECT id_estado_activo FROM estado_activo WHERE nombre IN ('Dado de Baja', 'Retirado')
        )
        AND a.valor_actual > a.valor_residual
        AND (
            a.fecha_prox_depreciacion <= v_fecha_actual 
            OR a.fecha_prox_depreciacion IS NULL
        )
        AND a.fecha_inicio_depreciacion IS NOT NULL
    LOOP
        BEGIN
            SELECT * INTO v_resultado 
            FROM registrar_depreciacion(
                v_activo.id_activo, 
                v_fecha_actual, 
                2
            );
            
            IF v_resultado.movimiento_id IS NOT NULL THEN
                v_contador := v_contador + 1;
                v_log := v_log || format('✅ %s: Depreciación de %s aplicada. Nuevo valor: %s\n', 
                    v_activo.nombre, 
                    v_resultado.depreciacion_mensual,
                    v_resultado.valor_nuevo);
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            v_log := v_log || format('❌ Error en %s: %s\n', v_activo.nombre, SQLERRM);
        END;
    END LOOP;
    
    v_log := v_log || format('=== TOTAL DEPRECIACIONES APLICADAS: %s ===\n', v_contador);
    
    INSERT INTO auditoria (
        id_movimiento,
        id_usuario_auditor,
        observaciones,
        estados_activos,
        estado_general
    ) VALUES (
        0,
        2,
        v_log,
        jsonb_build_object(
            'proceso', 'depreciacion_automatica',
            'fecha_ejecucion', v_fecha_actual,
            'activos_depreciados', v_contador,
            'tipo', 'trigger_automatico'
        ),
        'completada'
    );
    
    RETURN v_log;
END;
$func$;

-- Función para registrar login
CREATE OR REPLACE FUNCTION registrar_login(
    p_id_usuario INT,
    p_fecha DATE DEFAULT CURRENT_DATE,
    p_hora TIME DEFAULT CURRENT_TIME
)
RETURNS INT
LANGUAGE plpgsql
AS $func$
DECLARE
    v_id_login INT;
    v_usuario_existe BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM usuario WHERE id_usuario = p_id_usuario) INTO v_usuario_existe;
    
    IF NOT v_usuario_existe THEN
        RAISE EXCEPTION 'Usuario con ID % no existe', p_id_usuario;
    END IF;
    
    INSERT INTO login (id_usuario, fecha, hora)
    VALUES (p_id_usuario, p_fecha, p_hora)
    RETURNING id_login INTO v_id_login;
    
    RETURN v_id_login;
END;
$func$;

-- Función para calcular depreciación hasta fecha
CREATE OR REPLACE FUNCTION calcular_depreciacion_hasta_fecha(
    p_activo_id INT,
    p_fecha_corte DATE DEFAULT CURRENT_DATE,
    p_metodo_id INT DEFAULT NULL
)
RETURNS TABLE(
    depreciacion_acumulada NUMERIC,
    valor_en_libros NUMERIC,
    dias_depreciados INTEGER,
    anios_completos INTEGER,
    fraccion_anio NUMERIC
)
LANGUAGE plpgsql
AS $func$
DECLARE
    v_costo NUMERIC;
    v_residual NUMERIC;
    v_vida INT;
    v_fecha_inicio DATE;
    v_metodo_id INT;
    v_parametros JSONB;
    v_tasa NUMERIC;
    v_suma_digitos INT;
    v_depreciable NUMERIC;
    v_depreciacion_anual NUMERIC;
    v_depreciacion_acumulada NUMERIC := 0;
    v_valor_libros NUMERIC;
    v_anio_actual INT;
    v_dias_totales INT;
    v_dias_anio_completo INT := 365;
    v_anios_completos INT;
    v_dias_restantes INT;
    v_fraccion_anio NUMERIC;
    v_nombre_activo VARCHAR(200);
    v_activo_existe BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM activo WHERE id_activo = p_activo_id
    ) INTO v_activo_existe;
    
    IF NOT v_activo_existe THEN
        RAISE EXCEPTION 'El activo con ID % no existe', p_activo_id;
    END IF;

    IF p_fecha_corte > CURRENT_DATE THEN
        RAISE EXCEPTION 'La fecha de corte no puede ser futura';
    END IF;

    SELECT 
        a.precio_compra, 
        COALESCE(a.valor_residual, 0), 
        a.vida_util_anios,
        a.nombre,
        COALESCE(p_metodo_id, a.id_metodo_depreciacion),
        a.fecha_inicio_depreciacion
    INTO 
        v_costo, 
        v_residual, 
        v_vida, 
        v_nombre_activo,
        v_metodo_id,
        v_fecha_inicio
    FROM activo a
    WHERE a.id_activo = p_activo_id;

    IF v_vida IS NULL OR v_vida <= 0 THEN
        RAISE EXCEPTION 'El activo "%" no tiene vida útil válida', v_nombre_activo;
    END IF;

    IF v_residual > v_costo THEN
        RAISE EXCEPTION 'El valor residual no puede ser mayor al costo';
    END IF;

    IF v_fecha_inicio IS NULL THEN
        RAISE EXCEPTION 'El activo "%" no tiene fecha_inicio_depreciacion', v_nombre_activo;
    END IF;

    IF v_fecha_inicio > p_fecha_corte THEN
        RETURN QUERY
        SELECT 
            0::NUMERIC,
            v_costo::NUMERIC,
            0::INTEGER,
            0::INTEGER,
            0::NUMERIC;
        RETURN;
    END IF;

    SELECT parametros
    INTO v_parametros
    FROM metodo_depreciacion
    WHERE id_metodo_depreciacion = v_metodo_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Método de depreciación no existe';
    END IF;

    v_depreciable := v_costo - v_residual;
    v_dias_totales := (p_fecha_corte - v_fecha_inicio);
    v_anios_completos := FLOOR(v_dias_totales / v_dias_anio_completo);
    v_dias_restantes := v_dias_totales - (v_anios_completos * v_dias_anio_completo);
    v_fraccion_anio := v_dias_restantes::NUMERIC / v_dias_anio_completo::NUMERIC;

    IF v_depreciable = 0 THEN
        RETURN QUERY
        SELECT 
            0::NUMERIC,
            v_costo::NUMERIC,
            v_dias_totales::INTEGER,
            v_anios_completos::INTEGER,
            v_fraccion_anio::NUMERIC;
        RETURN;
    END IF;

    CASE v_parametros->>'tipo'
        WHEN 'linea_recta' THEN
            v_depreciacion_anual := v_depreciable / v_vida;
            
            IF v_anios_completos >= v_vida THEN
                v_depreciacion_acumulada := v_depreciable;
            ELSE
                v_depreciacion_acumulada := v_anios_completos * v_depreciacion_anual;
                v_depreciacion_acumulada := v_depreciacion_acumulada + (v_depreciacion_anual * v_fraccion_anio);
                IF v_depreciacion_acumulada > v_depreciable THEN
                    v_depreciacion_acumulada := v_depreciable;
                END IF;
            END IF;

        WHEN 'syd' THEN
            v_suma_digitos := v_vida * (v_vida + 1) / 2;
            
            FOR v_anio_actual IN 1..LEAST(v_anios_completos, v_vida) LOOP
                v_depreciacion_acumulada := v_depreciacion_acumulada + 
                    ((v_vida - v_anio_actual + 1)::NUMERIC / v_suma_digitos * v_depreciable);
            END LOOP;
            
            IF v_anios_completos < v_vida THEN
                v_depreciacion_acumulada := v_depreciacion_acumulada + 
                    (((v_vida - v_anios_completos)::NUMERIC / v_suma_digitos * v_depreciable) * v_fraccion_anio);
            END IF;
            
            IF v_depreciacion_acumulada > v_depreciable THEN
                v_depreciacion_acumulada := v_depreciable;
            END IF;

        WHEN 'saldo_decreciente' THEN
            v_tasa := COALESCE((v_parametros->>'tasa')::NUMERIC, 0.40);
            
            IF v_tasa <= 0 OR v_tasa > 1 THEN
                RAISE EXCEPTION 'Tasa inválida';
            END IF;
            
            v_valor_libros := v_costo;
            
            FOR v_anio_actual IN 1..v_anios_completos LOOP
                v_depreciacion_acumulada := v_depreciacion_acumulada + (v_valor_libros * v_tasa);
                v_valor_libros := v_valor_libros - (v_valor_libros * v_tasa);
                EXIT WHEN v_anio_actual >= v_vida;
            END LOOP;
            
            IF v_anios_completos < v_vida THEN
                v_depreciacion_acumulada := v_depreciacion_acumulada + 
                    ((v_valor_libros * v_tasa) * v_fraccion_anio);
            END IF;
            
            IF v_depreciacion_acumulada > v_depreciable THEN
                v_depreciacion_acumulada := v_depreciable;
            END IF;

        ELSE
            RAISE EXCEPTION 'Método no soportado';
    END CASE;

    v_valor_libros := v_costo - v_depreciacion_acumulada;
    
    IF v_valor_libros < v_residual THEN
        v_valor_libros := v_residual;
        v_depreciacion_acumulada := v_costo - v_residual;
    END IF;

    RETURN QUERY
    SELECT 
        ROUND(v_depreciacion_acumulada, 2),
        ROUND(v_valor_libros, 2),
        v_dias_totales::INTEGER,
        v_anios_completos::INTEGER,
        ROUND(v_fraccion_anio, 4);
END;
$func$;

-- Función para obtener plan de depreciación
CREATE OR REPLACE FUNCTION obtener_plan_depreciacion(
    p_activo_id INT,
    p_metodo_id INT DEFAULT NULL
)
RETURNS TABLE(
    anio_numero INT,
    fecha_inicio_anio DATE,
    fecha_fin_anio DATE,
    importe_depreciacion NUMERIC,
    valor_en_libros NUMERIC,
    depreciacion_acumulada NUMERIC
)
LANGUAGE plpgsql
AS $func$
DECLARE
    v_fecha_inicio DATE;
    v_costo NUMERIC;
    v_residual NUMERIC;
    v_vida INT;
    v_anio INT;
    v_depreciacion_anual NUMERIC;
    v_depreciable NUMERIC;
    v_metodo_id INT;
    v_parametros JSONB;
    v_tasa NUMERIC;
    v_suma_digitos INT;
    v_valor_libros_anterior NUMERIC;
    v_depreciacion_acum NUMERIC := 0;
BEGIN
    SELECT 
        a.fecha_inicio_depreciacion,
        a.precio_compra,
        COALESCE(a.valor_residual, 0),
        a.vida_util_anios,
        COALESCE(p_metodo_id, a.id_metodo_depreciacion)
    INTO 
        v_fecha_inicio,
        v_costo,
        v_residual,
        v_vida,
        v_metodo_id
    FROM activo a
    WHERE a.id_activo = p_activo_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Activo no encontrado';
    END IF;
    
    IF v_fecha_inicio IS NULL THEN
        RAISE EXCEPTION 'El activo no tiene fecha_inicio_depreciacion';
    END IF;
    
    v_depreciable := v_costo - v_residual;
    
    SELECT parametros INTO v_parametros
    FROM metodo_depreciacion
    WHERE id_metodo_depreciacion = v_metodo_id;
    
    IF v_depreciable = 0 THEN
        FOR v_anio IN 1..v_vida LOOP
            RETURN QUERY
            SELECT 
                v_anio,
                (v_fecha_inicio + ((v_anio-1) || ' years')::INTERVAL)::DATE,
                (v_fecha_inicio + (v_anio || ' years')::INTERVAL - INTERVAL '1 day')::DATE,
                0::NUMERIC,
                v_costo::NUMERIC,
                0::NUMERIC;
        END LOOP;
        RETURN;
    END IF;
    
    CASE v_parametros->>'tipo'
        WHEN 'linea_recta' THEN
            v_depreciacion_anual := v_depreciable / v_vida;
            
            FOR v_anio IN 1..v_vida LOOP
                v_depreciacion_acum := v_depreciacion_acum + v_depreciacion_anual;
                
                RETURN QUERY
                SELECT 
                    v_anio,
                    (v_fecha_inicio + ((v_anio-1) || ' years')::INTERVAL)::DATE,
                    (v_fecha_inicio + (v_anio || ' years')::INTERVAL - INTERVAL '1 day')::DATE,
                    ROUND(v_depreciacion_anual, 2),
                    ROUND(v_costo - v_depreciacion_acum, 2),
                    ROUND(v_depreciacion_acum, 2);
            END LOOP;
            
        WHEN 'syd' THEN
            v_suma_digitos := v_vida * (v_vida + 1) / 2;
            
            FOR v_anio IN 1..v_vida LOOP
                v_depreciacion_anual := ((v_vida - v_anio + 1)::NUMERIC / v_suma_digitos * v_depreciable);
                v_depreciacion_acum := v_depreciacion_acum + v_depreciacion_anual;
                
                RETURN QUERY
                SELECT 
                    v_anio,
                    (v_fecha_inicio + ((v_anio-1) || ' years')::INTERVAL)::DATE,
                    (v_fecha_inicio + (v_anio || ' years')::INTERVAL - INTERVAL '1 day')::DATE,
                    ROUND(v_depreciacion_anual, 2),
                    ROUND(v_costo - v_depreciacion_acum, 2),
                    ROUND(v_depreciacion_acum, 2);
            END LOOP;
            
        WHEN 'saldo_decreciente' THEN
            v_tasa := COALESCE((v_parametros->>'tasa')::NUMERIC, 0.40);
            v_valor_libros_anterior := v_costo;
            
            FOR v_anio IN 1..v_vida LOOP
                v_depreciacion_anual := v_valor_libros_anterior * v_tasa;
                v_valor_libros_anterior := v_valor_libros_anterior - v_depreciacion_anual;
                v_depreciacion_acum := v_depreciacion_acum + v_depreciacion_anual;
                
                IF v_valor_libros_anterior < v_residual THEN
                    v_valor_libros_anterior := v_residual;
                END IF;
                
                RETURN QUERY
                SELECT 
                    v_anio,
                    (v_fecha_inicio + ((v_anio-1) || ' years')::INTERVAL)::DATE,
                    (v_fecha_inicio + (v_anio || ' years')::INTERVAL - INTERVAL '1 day')::DATE,
                    ROUND(v_depreciacion_anual, 2),
                    ROUND(v_valor_libros_anterior, 2),
                    ROUND(v_depreciacion_acum, 2);
            END LOOP;
    END CASE;
END;
$func$;

-- 4. TRIGGERS
-- =====================================================

-- Trigger para actualizar valor actual automáticamente
DROP TRIGGER IF EXISTS trg_actualizar_valor_activo ON movimiento_depreciacion;
CREATE OR REPLACE FUNCTION trg_actualizar_valor_activo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    UPDATE activo a
    SET valor_actual = NEW.valor_restante
    FROM movimiento m
    WHERE m.id_movimiento = NEW.id_movimiento
      AND m.id_activo = a.id_activo
      AND a.valor_actual != NEW.valor_restante;
    
    RETURN NEW;
END;
$func$;

CREATE TRIGGER trg_actualizar_valor_activo
    AFTER INSERT ON movimiento_depreciacion
    FOR EACH ROW
    EXECUTE FUNCTION trg_actualizar_valor_activo();

-- Trigger para verificar y aplicar depreciaciones automáticamente al hacer movimientos
DROP TRIGGER IF EXISTS trg_verificar_depreciacion ON movimiento;
CREATE OR REPLACE FUNCTION trg_verificar_depreciacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
DECLARE
    v_resultado TEXT;
BEGIN
    IF EXISTS (
        SELECT 1 FROM activo a
        WHERE a.id_estado_activo NOT IN (
            SELECT id_estado_activo FROM estado_activo WHERE nombre IN ('Dado de Baja', 'Retirado')
        )
        AND a.valor_actual > a.valor_residual
        AND a.fecha_prox_depreciacion <= CURRENT_DATE
        AND a.fecha_inicio_depreciacion IS NOT NULL
    ) THEN
        SELECT aplicar_depreciaciones_pendientes() INTO v_resultado;
        RAISE NOTICE '%', v_resultado;
    END IF;
    
    RETURN NEW;
END;
$func$;

CREATE TRIGGER trg_verificar_depreciacion
    AFTER INSERT ON movimiento
    FOR EACH STATEMENT
    EXECUTE FUNCTION trg_verificar_depreciacion();

-- Trigger para validar baja de activo
DROP TRIGGER IF EXISTS trg_validar_baja_activo ON activo;
CREATE OR REPLACE FUNCTION trg_validar_baja_activo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
DECLARE
    v_estado_baja_id INT;
BEGIN
    SELECT id_estado_activo INTO v_estado_baja_id 
    FROM estado_activo 
    WHERE nombre = 'Dado de Baja';
    
    IF NEW.id_estado_activo = v_estado_baja_id AND OLD.id_estado_activo != v_estado_baja_id THEN
        IF NEW.valor_actual > NEW.valor_residual THEN
            RAISE EXCEPTION 'No se puede dar de baja un activo con valor actual (%) mayor al residual (%)', 
                NEW.valor_actual, NEW.valor_residual;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$func$;

CREATE TRIGGER trg_validar_baja_activo
    BEFORE UPDATE OF id_estado_activo ON activo
    FOR EACH ROW
    EXECUTE FUNCTION trg_validar_baja_activo();

-- 5. PROCEDIMIENTO PARA DEPRECIACIÓN MASIVA
-- =====================================================

CREATE OR REPLACE PROCEDURE depreciar_activos_mes_actual(
    p_id_usuario INT DEFAULT 2
)
LANGUAGE plpgsql
AS $func$
DECLARE
    v_activo RECORD;
    v_resultado RECORD;
    v_contador INT := 0;
    v_errores TEXT := '';
BEGIN
    FOR v_activo IN 
        SELECT id_activo, nombre, valor_actual, valor_residual
        FROM activo 
        WHERE id_estado_activo NOT IN (
            SELECT id_estado_activo FROM estado_activo WHERE nombre IN ('Dado de Baja', 'Retirado')
        )
        AND valor_actual > valor_residual
        AND (fecha_prox_depreciacion IS NULL OR fecha_prox_depreciacion <= CURRENT_DATE)
    LOOP
        BEGIN
            SELECT * INTO v_resultado 
            FROM registrar_depreciacion(v_activo.id_activo, CURRENT_DATE, p_id_usuario);
            
            IF v_resultado.movimiento_id IS NOT NULL THEN
                v_contador := v_contador + 1;
                RAISE NOTICE 'Activo %: Depreciación registrada por %', 
                    v_activo.nombre, v_resultado.depreciacion_mensual;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_errores := v_errores || format('Error en activo %s: %s; ', v_activo.nombre, SQLERRM);
        END;
    END LOOP;
    
    RAISE NOTICE 'Proceso completado. Activos depreciados: %, Errores: %', v_contador, v_errores;
END;
$func$;

-- 6. VISTA PARA MONITOREAR ACTIVOS CON DEPRECIACIÓN PENDIENTE
-- =====================================================

CREATE OR REPLACE VIEW v_activos_por_depreciar AS
SELECT 
    a.id_activo,
    a.nombre,
    a.modelo,
    a.numero_serie,
    a.valor_actual,
    a.valor_residual,
    a.precio_compra,
    a.fecha_compra,
    a.fecha_inicio_depreciacion,
    a.fecha_ultima_depreciacion,
    a.fecha_prox_depreciacion,
    CASE 
        WHEN a.fecha_prox_depreciacion <= CURRENT_DATE THEN 'PENDIENTE DE DEPRECIAR'
        WHEN a.fecha_prox_depreciacion IS NULL AND a.fecha_inicio_depreciacion IS NOT NULL THEN 'POR CALCULAR'
        WHEN a.valor_actual <= a.valor_residual THEN 'DEPRECIADO COMPLETAMENTE'
        ELSE 'AL DÍA'
    END as estado_depreciacion,
    (CURRENT_DATE - COALESCE(a.fecha_prox_depreciacion, a.fecha_inicio_depreciacion)) as dias_atraso,
    m.nombre as metodo_depreciacion,
    e.nombre as estado_activo,
    e.color as estado_color
FROM activo a
JOIN metodo_depreciacion m ON a.id_metodo_depreciacion = m.id_metodo_depreciacion
JOIN estado_activo e ON a.id_estado_activo = e.id_estado_activo
WHERE a.valor_actual > a.valor_residual
  AND a.id_estado_activo NOT IN (
      SELECT id_estado_activo FROM estado_activo WHERE nombre IN ('Dado de Baja', 'Retirado')
  )
ORDER BY a.fecha_prox_depreciacion NULLS FIRST;

-- 7. FUNCIÓN PARA EJECUTAR DEPRECIACIÓN MANUAL
-- =====================================================

CREATE OR REPLACE FUNCTION ejecutar_depreciacion_manual(
    p_activo_id INT DEFAULT NULL
)
RETURNS TABLE(
    activo_nombre VARCHAR,
    depreciacion_aplicada NUMERIC,
    nuevo_valor NUMERIC,
    mensaje TEXT
)
LANGUAGE plpgsql
AS $func$
DECLARE
    v_activo RECORD;
    v_resultado RECORD;
BEGIN
    IF p_activo_id IS NOT NULL THEN
        SELECT * INTO v_resultado 
        FROM registrar_depreciacion(p_activo_id, CURRENT_DATE, 2);
        
        RETURN QUERY
        SELECT 
            (SELECT nombre FROM activo WHERE id_activo = p_activo_id),
            v_resultado.depreciacion_mensual,
            v_resultado.valor_nuevo,
            v_resultado.mensaje;
        RETURN;
    END IF;
    
    FOR v_activo IN 
        SELECT id_activo, nombre 
        FROM activo 
        WHERE valor_actual > valor_residual
        AND id_estado_activo NOT IN (
            SELECT id_estado_activo FROM estado_activo WHERE nombre IN ('Dado de Baja', 'Retirado')
        )
    LOOP
        BEGIN
            SELECT * INTO v_resultado 
            FROM registrar_depreciacion(v_activo.id_activo, CURRENT_DATE, 2);
            
            RETURN QUERY
            SELECT 
                v_activo.nombre,
                COALESCE(v_resultado.depreciacion_mensual, 0),
                COALESCE(v_resultado.valor_nuevo, 0),
                COALESCE(v_resultado.mensaje, 'Procesado');
                
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY
            SELECT 
                v_activo.nombre,
                0::NUMERIC,
                0::NUMERIC,
                'Error: ' || SQLERRM;
        END;
    END LOOP;
END;
$func$;

-- 8. INSERTAR DATOS EN LOGIN Y ACTUALIZAR ACTIVOS
-- =====================================================

-- Insertar registros de login
INSERT INTO login (id_usuario, fecha, hora)
SELECT 1, CURRENT_DATE, CURRENT_TIME
WHERE EXISTS (SELECT 1 FROM usuario WHERE id_usuario = 1)
  AND NOT EXISTS (SELECT 1 FROM login WHERE id_usuario = 1 AND fecha = CURRENT_DATE);

INSERT INTO login (id_usuario, fecha, hora)
SELECT 1, CURRENT_DATE - INTERVAL '1 day', '08:30:00'::TIME
WHERE EXISTS (SELECT 1 FROM usuario WHERE id_usuario = 1)
  AND NOT EXISTS (SELECT 1 FROM login WHERE id_usuario = 1 AND fecha = CURRENT_DATE - INTERVAL '1 day');

INSERT INTO login (id_usuario, fecha, hora)
SELECT 1, CURRENT_DATE - INTERVAL '2 days', '09:15:00'::TIME
WHERE EXISTS (SELECT 1 FROM usuario WHERE id_usuario = 1)
  AND NOT EXISTS (SELECT 1 FROM login WHERE id_usuario = 1 AND fecha = CURRENT_DATE - INTERVAL '2 days');

INSERT INTO login (id_usuario, fecha, hora)
SELECT 2, CURRENT_DATE, '10:00:00'::TIME
WHERE EXISTS (SELECT 1 FROM usuario WHERE id_usuario = 2)
  AND NOT EXISTS (SELECT 1 FROM login WHERE id_usuario = 2 AND fecha = CURRENT_DATE);

-- Actualizar fechas de próxima depreciación
UPDATE activo 
SET 
    fecha_ultima_depreciacion = COALESCE(fecha_ultima_depreciacion, fecha_inicio_depreciacion),
    fecha_prox_depreciacion = fecha_calcular_proxima_depreciacion(id_activo, COALESCE(fecha_ultima_depreciacion, fecha_inicio_depreciacion))
WHERE fecha_inicio_depreciacion IS NOT NULL 
  AND fecha_prox_depreciacion IS NULL;

-- 9. VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
    v_pendientes INT;
BEGIN
    SELECT COUNT(*) INTO v_pendientes
    FROM v_activos_por_depreciar
    WHERE estado_depreciacion = 'PENDIENTE DE DEPRECIAR';
    
    RAISE NOTICE '==================================================';
    RAISE NOTICE '✅ BASE DE DATOS CONFIGURADA CORRECTAMENTE';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '📊 ACTIVOS PENDIENTES DE DEPRECIAR: %', v_pendientes;
    RAISE NOTICE '';
    RAISE NOTICE '🔄 DEPRECIACIÓN AUTOMÁTICA ACTIVADA:';
    RAISE NOTICE '   - Se ejecuta cada vez que se registra un movimiento';
    RAISE NOTICE '   - También puedes ejecutar manualmente:';
    RAISE NOTICE '     SELECT * FROM ejecutar_depreciacion_manual();';
    RAISE NOTICE '     CALL depreciar_activos_mes_actual();';
    RAISE NOTICE '';
    RAISE NOTICE '📝 COMANDOS ÚTILES:';
    RAISE NOTICE '   - Ver activos pendientes: SELECT * FROM v_activos_por_depreciar;';
    RAISE NOTICE '   - Ver logs: SELECT * FROM auditoria WHERE estados_activos->>''proceso'' = ''depreciacion_automatica'' ORDER BY fecha_auditoria DESC LIMIT 5;';
    RAISE NOTICE '   - Ver registros de login: SELECT * FROM login;';
    RAISE NOTICE '==================================================';
END $$;

-- Mostrar resumen final
SELECT '=== ACTIVOS CON DEPRECIACIÓN PENDIENTE ===' as "RESUMEN";
SELECT * FROM v_activos_por_depreciar WHERE estado_depreciacion = 'PENDIENTE DE DEPRECIAR' LIMIT 5;

SELECT '=== ÚLTIMOS REGISTROS DE LOGIN ===' as "RESUMEN";
SELECT * FROM login ORDER BY fecha DESC, hora DESC LIMIT 5;

SELECT '=== VALOR ACTUAL DE ACTIVOS ===' as "RESUMEN";
SELECT id_activo, nombre, valor_actual, valor_residual, fecha_prox_depreciacion 
FROM activo 
ORDER BY id_activo;