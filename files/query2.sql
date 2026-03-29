DROP VIEW IF EXISTS v_activos_por_depreciar CASCADE;
drop view if exists dashboard;
drop view if exists reporte;

DROP TRIGGER IF EXISTS trg_actualizar_valor_activo ON movimiento_depreciacion;
DROP TRIGGER IF EXISTS trg_verificar_depreciacion_login ON login;
DROP TRIGGER IF EXISTS trg_validar_baja_activo ON activo;

DROP FUNCTION IF EXISTS trg_actualizar_valor_activo() CASCADE;
DROP FUNCTION IF EXISTS trg_verificar_depreciacion_login() CASCADE;
DROP FUNCTION IF EXISTS trg_validar_baja_activo() CASCADE;

DROP FUNCTION IF EXISTS fecha_calcular_proxima_depreciacion(INT, DATE) CASCADE;
DROP FUNCTION IF EXISTS registrar_depreciacion(INT, DATE, INT) CASCADE;
DROP FUNCTION IF EXISTS aplicar_depreciaciones_pendientes(INT, DATE) CASCADE;
DROP FUNCTION IF EXISTS registrar_login(INT, DATE, TIME) CASCADE;
DROP FUNCTION IF EXISTS calcular_depreciacion_hasta_fecha(INT, DATE, INT) CASCADE;
DROP FUNCTION IF EXISTS obtener_plan_depreciacion(INT, INT) CASCADE;
DROP FUNCTION IF EXISTS ejecutar_depreciacion_manual(INT) CASCADE;

DROP PROCEDURE IF EXISTS depreciar_activos_mes_actual(INT) CASCADE;

DROP TABLE IF EXISTS auditoria CASCADE;
DROP TABLE IF EXISTS movimiento_baja CASCADE;
DROP TABLE IF EXISTS movimiento_ubicacion CASCADE;
DROP TABLE IF EXISTS movimiento_depreciacion CASCADE;
DROP TABLE IF EXISTS movimiento_actualizacion CASCADE;
DROP TABLE IF EXISTS movimiento CASCADE;
DROP TABLE IF EXISTS activo_responsable CASCADE;
DROP TABLE IF EXISTS partes_de_activo CASCADE;
DROP TABLE IF EXISTS activo CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS metodo_depreciacion CASCADE;
DROP TABLE IF EXISTS estado_activo CASCADE;
DROP TABLE IF EXISTS aula CASCADE;
DROP TABLE IF EXISTS piso CASCADE;
DROP TABLE IF EXISTS edificio CASCADE;
DROP TABLE IF EXISTS login CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS puesto CASCADE;
DROP TABLE IF EXISTS area CASCADE;
DROP TABLE IF EXISTS rol CASCADE;



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
    nombre VARCHAR(150) DEFAULT NULL,
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
    id_edificio VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    cantidad_pisos INTEGER NOT NULL CHECK (cantidad_pisos > 0),
    direccion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS piso (
    id_piso VARCHAR(10) PRIMARY KEY,
    id_edificio VARCHAR(10) NOT NULL,
    numero_piso INTEGER NOT NULL,
    cantidad_aulas INTEGER NOT NULL CHECK(cantidad_aulas > 0),
    CONSTRAINT fk_piso_edificio
        FOREIGN KEY (id_edificio)
        REFERENCES edificio(id_edificio)
        ON DELETE CASCADE,
    CONSTRAINT u_piso UNIQUE(id_edificio, numero_piso)
);

CREATE TABLE IF NOT EXISTS aula (
    id_aula VARCHAR(10) PRIMARY KEY,
    id_piso VARCHAR(10) NOT NULL,
    numero_aula VARCHAR(50) NOT NULL,
    tipo varchar(30) NOT NULL DEFAULT 'Aula',
    CONSTRAINT fk_aula_piso
        FOREIGN KEY (id_piso)
        REFERENCES piso(id_piso)
        ON DELETE CASCADE,
    CONSTRAINT u_aula UNIQUE(id_piso, numero_aula)
);

CREATE TABLE IF NOT EXISTS estado_activo (
    id_estado_activo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(10)
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
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio_depreciacion DATE NULL,
    fecha_ultima_depreciacion DATE NULL,
    fecha_prox_depreciacion DATE NULL,
    precio_compra NUMERIC(12,2) NOT NULL CHECK (precio_compra >= 0),

    valor_actual NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (valor_actual >= 0),
    valor_residual NUMERIC(12,2) DEFAULT 0 CHECK (valor_residual >= 0),
    vida_util_anios INTEGER CHECK (vida_util_anios > 0),
    id_metodo_depreciacion INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    id_estado_activo INTEGER NOT NULL,
    id_aula VARCHAR(10) NOT NULL,
    id_responsable INTEGER default NULL,
    multiparte boolean not null default false,
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
        REFERENCES metodo_depreciacion(id_metodo_depreciacion),
    constraint fk_activo_responsable
        foreign key (id_responsable)
        references usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS partes_de_activo (
    id_parte SERIAL PRIMARY KEY,
    id_activo INTEGER NOT NULL,
    numero_parte VARCHAR(100) NOT NULL,
    id_aula VARCHAR(10) NOT NULL,
    descripcion TEXT,
    CONSTRAINT fk_partes_activo
        FOREIGN KEY (id_activo)
        REFERENCES activo(id_activo)
        ON DELETE CASCADE,
    constraint fk_aula_parte_activo foreign key(id_aula)
	references aula(id_aula)
);

CREATE INDEX IF NOT EXISTS idx_partes_activo ON partes_de_activo(id_activo);
-- Pendiente de checar
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
    id_aula_origen VARCHAR(10) NOT NULL,
    id_aula_destino VARCHAR(10) NOT NULL,
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
    id_movimiento INTEGER NULL,
    id_usuario_auditor INTEGER NOT NULL,
    fecha_auditoria TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    estados_activos JSONB,
    id_aula VARCHAR(10) NULL,
    estado_general VARCHAR(50) NOT NULL DEFAULT 'finalizada',
    CONSTRAINT fk_auditoria_movimiento
        FOREIGN KEY (id_movimiento)
        REFERENCES movimiento(id_movimiento)
        ON DELETE CASCADE,
    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (id_usuario_auditor)
        REFERENCES usuario(id_usuario),
    constraint fk_aula_auditoria foreign key(id_aula)
    references aula(id_aula)
);


-- =====================================================
-- 2. INSERTS BASE (LOS QUE TE PIDIERON)
-- =====================================================

-- ROL
INSERT INTO rol (nombre, descripcion) VALUES
('Administrador', 'Acceso a todo el sistema'),
('Auditor', 'Visualización y creación de auditorias'),
('Usuario', 'Visualización de activos a su responsabilidad y el estado. Puede cambiar la ubicación');

-- AREA
INSERT INTO area (nombre) VALUES
('Sistemas'),
('Recursos Humanos'),
('Vinculacion');

-- PUESTO
INSERT INTO puesto(nombre, id_area) VALUES
('Director', 1);

-- USUARIOS DE APOYO
INSERT INTO usuario (nombre_usuario, nombre, apellido_paterno, correo, id_rol, id_puesto, password, activo)
VALUES
('admin', 'Admin', 'Sistema', 'admin@local.com', 1, 1, '123456', true),
('system', 'Sistema', 'Automatico', 'system@local.com', 1, 1, 'system', false);

-- EDIFICIO
INSERT INTO edificio VALUES
('A', 'Principal', 2, 'UPQ'),
('B', 'B', 2, 'UPQ');

-- PISO
INSERT INTO piso VALUES
('A2', 'A', 2, 8),
('A1', 'A', 1, 8);

-- AULA
-- Ajustado a tu estructura REAL: (id_aula, id_piso, numero_aula)
INSERT INTO aula (id_aula, id_piso, numero_aula) VALUES
('A208', 'A2', '8'),
('A105', 'A1', '5');

-- ESTADO ACTIVO
INSERT INTO estado_activo (nombre, color) VALUES
('Activo', 'green'),
('Mantenimiento', 'yellow'),
('Retirado', 'red');

-- MÉTODO DE DEPRECIACIÓN
INSERT INTO metodo_depreciacion (nombre, descripcion, parametros) VALUES
('Línea Recta', 'Depreciación uniforme a lo largo de la vida útil', '{"tipo": "linea_recta"}'::JSONB),
('SYD (Suma de Dígitos)', 'Depreciación acelerada basada en la suma de los años', '{"tipo": "syd"}'::JSONB),
('Saldo Decreciente', 'Depreciación acelerada con una tasa fija', '{"tipo": "saldo_decreciente", "tasa": 0.40}'::JSONB);

-- CATEGORÍA
INSERT INTO categoria (nombre, descripcion) VALUES
('Equipo de Cómputo', 'Computadoras y laptops');

-- ACTIVOS DE PRUEBA
INSERT INTO activo (
    nombre, descripcion, modelo, numero_serie,
    fecha_compra, fecha_inicio_depreciacion, fecha_ultima_depreciacion, fecha_prox_depreciacion,
    valor_actual, precio_compra, valor_residual, vida_util_anios,
    id_metodo_depreciacion, id_categoria, id_estado_activo, id_aula, id_responsable
) VALUES
(
    'Laptop', 'Laptop para desarrollo', 'EliteBook 840', 'SN-LAP-001',
    '2025-03-27', '2025-03-27', '2025-03-27', '2026-03-27',
    10000.00, 10000.00, 1000.00, 5,
    1, 1, 1, 'A105', 1
),
(
    'Impresora', 'Impresora láser', 'WorkForce Pro', 'SN-IMP-001',
    '2025-03-27', '2025-03-27', '2025-03-27', '2026-03-27',
    8000.00, 8000.00, 500.00, 4,
    2, 1, 1, 'A105', 1
),
(
    'Servidor', 'Servidor de red', 'PowerEdge R740', 'SN-SRV-001',
    '2025-03-27', '2025-03-27', '2025-03-27', '2026-03-27',
    20000.00, 20000.00, 2000.00, 5,
    3, 1, 1, 'A105', 1
);


-- =====================================================
-- 3. FUNCIONES PRINCIPALES
-- =====================================================

-- =====================================================
-- 3.1 FUNCIÓN PARA CALCULAR PRÓXIMA DEPRECIACIÓN (ANUAL)
-- =====================================================

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
    v_fecha_proxima := (p_fecha_base + INTERVAL '1 year')::DATE;
    RETURN v_fecha_proxima;
END;
$func$;


-- =====================================================
-- 3.2 FUNCIÓN PARA REGISTRAR DEPRECIACIÓN ANUAL
--     - Calcula depreciación
--     - Actualiza valor_actual en activo
--     - Actualiza fecha_prox_depreciacion al siguiente año
--     - Inserta historial en movimiento y movimiento_depreciacion
-- =====================================================

CREATE OR REPLACE FUNCTION registrar_depreciacion(
    p_activo_id INT,
    p_fecha_depreciacion DATE DEFAULT CURRENT_DATE,
    p_id_usuario INT DEFAULT 2
)
RETURNS TABLE(
    movimiento_id INT,
    depreciacion_aplicada NUMERIC,
    valor_anterior NUMERIC,
    valor_nuevo NUMERIC,
    mensaje TEXT
)
LANGUAGE plpgsql
AS $func$
DECLARE
    v_activo RECORD;
    v_depreciacion_aplicada NUMERIC := 0;
    v_valor_anterior NUMERIC := 0;
    v_valor_nuevo NUMERIC := 0;
    v_metodo_tipo TEXT;
    v_depreciable NUMERIC := 0;
    v_movimiento_id INT;
    v_anios_transcurridos INT;
    v_suma_digitos INT;
    v_depreciacion_anual NUMERIC;
    v_tasa_anual NUMERIC;
BEGIN
    SELECT
        a.*,
        m.parametros AS metodo_parametros,
        m.nombre AS metodo_nombre
    INTO v_activo
    FROM activo a
    JOIN metodo_depreciacion m
        ON a.id_metodo_depreciacion = m.id_metodo_depreciacion
    WHERE a.id_activo = p_activo_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Activo con ID % no encontrado', p_activo_id;
    END IF;

    IF v_activo.valor_actual <= v_activo.valor_residual THEN
        RETURN QUERY
        SELECT
            NULL::INT,
            0::NUMERIC,
            v_activo.valor_actual,
            v_activo.valor_actual,
            'El activo ya no tiene depreciación pendiente'::TEXT;
        RETURN;
    END IF;

    -- FILTRO PARA NO DEPRECIAR DOS VECES EN EL MISMO EVENTO
    IF v_activo.fecha_prox_depreciacion IS NOT NULL
       AND p_fecha_depreciacion < v_activo.fecha_prox_depreciacion THEN
        RETURN QUERY
        SELECT
            NULL::INT,
            0::NUMERIC,
            v_activo.valor_actual,
            v_activo.valor_actual,
            'Aún no corresponde depreciar este activo'::TEXT;
        RETURN;
    END IF;

    v_valor_anterior := v_activo.valor_actual;
    v_metodo_tipo := v_activo.metodo_parametros->>'tipo';
    v_depreciable := v_activo.precio_compra - v_activo.valor_residual;

    IF v_depreciable <= 0 THEN
        RETURN QUERY
        SELECT
            NULL::INT,
            0::NUMERIC,
            v_valor_anterior,
            v_valor_anterior,
            'No hay base depreciable'::TEXT;
        RETURN;
    END IF;

    -- CUÁNTOS AÑOS VAN DESDE EL INICIO
    v_anios_transcurridos := EXTRACT(YEAR FROM age(p_fecha_depreciacion, v_activo.fecha_inicio_depreciacion))::INT + 1;

    IF v_anios_transcurridos < 1 THEN
        v_anios_transcurridos := 1;
    END IF;

    IF v_anios_transcurridos > v_activo.vida_util_anios THEN
        v_anios_transcurridos := v_activo.vida_util_anios;
    END IF;

    CASE v_metodo_tipo
        WHEN 'linea_recta' THEN
            v_depreciacion_aplicada := v_depreciable / v_activo.vida_util_anios;

        WHEN 'syd' THEN
            v_suma_digitos := v_activo.vida_util_anios * (v_activo.vida_util_anios + 1) / 2;
            v_depreciacion_aplicada := (
                (v_activo.vida_util_anios - v_anios_transcurridos + 1)::NUMERIC
                / v_suma_digitos
            ) * v_depreciable;

        WHEN 'saldo_decreciente' THEN
            v_tasa_anual := COALESCE((v_activo.metodo_parametros->>'tasa')::NUMERIC, 0.40);
            v_depreciacion_aplicada := v_activo.valor_actual * v_tasa_anual;

        ELSE
            RAISE EXCEPTION 'Método de depreciación no soportado: %', v_metodo_tipo;
    END CASE;

    v_valor_nuevo := v_activo.valor_actual - v_depreciacion_aplicada;

    IF v_valor_nuevo < v_activo.valor_residual THEN
        v_depreciacion_aplicada := v_activo.valor_actual - v_activo.valor_residual;
        v_valor_nuevo := v_activo.valor_residual;
    END IF;

    IF v_depreciacion_aplicada <= 0 THEN
        RETURN QUERY
        SELECT
            NULL::INT,
            0::NUMERIC,
            v_valor_anterior,
            v_valor_anterior,
            'No hay depreciación pendiente'::TEXT;
        RETURN;
    END IF;

    -- HISTORIAL EN MOVIMIENTO
    INSERT INTO movimiento (
        tipo_movimiento,
        fecha_movimiento,
        descripcion,
        id_usuario,
        id_activo
    ) VALUES (
        'depreciacion',
        p_fecha_depreciacion,
        'Registro de depreciación anual - Método: ' || v_activo.metodo_nombre,
        p_id_usuario,
        p_activo_id
    )
    RETURNING id_movimiento INTO v_movimiento_id;

    -- HISTORIAL EN MOVIMIENTO_DEPRECIACION
    INSERT INTO movimiento_depreciacion (
        id_movimiento,
        valor_depreciado,
        valor_restante,
        id_metodo_depreciacion,
        parametros_usados
    ) VALUES (
        v_movimiento_id,
        ROUND(v_depreciacion_aplicada, 2),
        ROUND(v_valor_nuevo, 2),
        v_activo.id_metodo_depreciacion,
        jsonb_build_object(
            'fecha_calculo', p_fecha_depreciacion,
            'valor_anterior', v_valor_anterior,
            'valor_nuevo', ROUND(v_valor_nuevo, 2),
            'tipo_periodicidad', 'anual'
        )
    );

    -- ACTUALIZACIÓN DEL ACTIVO
    UPDATE activo
    SET
        valor_actual = ROUND(v_valor_nuevo, 2),
        fecha_ultima_depreciacion = p_fecha_depreciacion,
        fecha_prox_depreciacion = fecha_calcular_proxima_depreciacion(p_activo_id, p_fecha_depreciacion)
    WHERE id_activo = p_activo_id;

    RETURN QUERY
    SELECT
        v_movimiento_id::INT,
        ROUND(v_depreciacion_aplicada, 2)::NUMERIC,
        v_valor_anterior::NUMERIC,
        ROUND(v_valor_nuevo, 2)::NUMERIC,
        'Depreciación registrada exitosamente'::TEXT;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY
        SELECT
            NULL::INT,
            0::NUMERIC,
            NULL::NUMERIC,
            NULL::NUMERIC,
            'Error: ' || SQLERRM::TEXT;
END;
$func$;


-- =====================================================
-- 3.3 FUNCIÓN PARA APLICAR DEPRECIACIONES PENDIENTES
--     SE EJECUTA AL HACER LOGIN
-- =====================================================

CREATE OR REPLACE FUNCTION aplicar_depreciaciones_pendientes(
    p_id_usuario INT DEFAULT 2,
    p_fecha_proceso DATE DEFAULT CURRENT_DATE
)
RETURNS TEXT
LANGUAGE plpgsql
AS $func$
DECLARE
    v_activo RECORD;
    v_resultado RECORD;
    v_contador INT := 0;
    v_log TEXT := '';
BEGIN
    v_log := v_log || format('=== VERIFICANDO DEPRECIACIONES PENDIENTES: %s ===\n', p_fecha_proceso);

    FOR v_activo IN
        SELECT
            a.id_activo,
            a.nombre,
            a.valor_actual,
            a.valor_residual,
            a.fecha_prox_depreciacion
        FROM activo a
        WHERE a.valor_actual > a.valor_residual
          AND a.fecha_inicio_depreciacion IS NOT NULL
          AND a.fecha_prox_depreciacion IS NOT NULL
          AND a.fecha_prox_depreciacion <= p_fecha_proceso
    LOOP
        BEGIN
            SELECT * INTO v_resultado
            FROM registrar_depreciacion(
                v_activo.id_activo,
                p_fecha_proceso,
                p_id_usuario
            );

            IF v_resultado.movimiento_id IS NOT NULL THEN
                v_contador := v_contador + 1;
                v_log := v_log || format(
                    '✅ %s: Depreciación aplicada por %s. Nuevo valor: %s\n',
                    v_activo.nombre,
                    v_resultado.depreciacion_aplicada,
                    v_resultado.valor_nuevo
                );
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
        NULL,
        p_id_usuario,
        v_log,
        jsonb_build_object(
            'proceso', 'depreciacion_automatica_login',
            'fecha_ejecucion', p_fecha_proceso,
            'activos_depreciados', v_contador
        ),
        'completada'
    );

    RETURN v_log;
END;
$func$;


-- =====================================================
-- 3.4 FUNCIÓN PARA REGISTRAR LOGIN
--     Y DISPARAR REVISIÓN DE DEPRECIACIONES
-- =====================================================

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
    SELECT EXISTS(
        SELECT 1
        FROM usuario
        WHERE id_usuario = p_id_usuario
    ) INTO v_usuario_existe;

    IF NOT v_usuario_existe THEN
        RAISE EXCEPTION 'Usuario con ID % no existe', p_id_usuario;
    END IF;

    INSERT INTO login (id_usuario, fecha, hora)
    VALUES (p_id_usuario, p_fecha, p_hora)
    RETURNING id_login INTO v_id_login;

    RETURN v_id_login;
END;
$func$;


-- =====================================================
-- 3.5 FUNCIÓN YA EXISTENTE: CALCULAR DEPRECIACIÓN HASTA FECHA
--     (SE RESPETA, SOLO MANTENIDA)
-- =====================================================

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


-- =====================================================
-- 3.6 FUNCIÓN PARA OBTENER PLAN DE DEPRECIACIÓN
-- =====================================================

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


-- =====================================================
-- 3.7 FUNCIÓN PARA EJECUTAR DEPRECIACIÓN MANUAL
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
            v_resultado.depreciacion_aplicada,
            v_resultado.valor_nuevo,
            v_resultado.mensaje;
        RETURN;
    END IF;

    FOR v_activo IN
        SELECT id_activo, nombre
        FROM activo
        WHERE valor_actual > valor_residual
    LOOP
        BEGIN
            SELECT * INTO v_resultado
            FROM registrar_depreciacion(v_activo.id_activo, CURRENT_DATE, 2);

            RETURN QUERY
            SELECT
                v_activo.nombre,
                COALESCE(v_resultado.depreciacion_aplicada, 0),
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


-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- =====================================================
-- 4.1 TRIGGER PARA ASEGURAR QUE VALOR_ACTUAL REFLEJE EL HISTORIAL
-- =====================================================

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


-- =====================================================
-- 4.2 TRIGGER PARA DISPARAR DEPRECIACIÓN AL INSERTAR LOGIN
-- =====================================================

CREATE OR REPLACE FUNCTION trg_verificar_depreciacion_login()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
DECLARE
    v_resultado TEXT;
BEGIN
    SELECT aplicar_depreciaciones_pendientes(NEW.id_usuario, NEW.fecha)
    INTO v_resultado;

    RAISE NOTICE '%', v_resultado;

    RETURN NEW;
END;
$func$;

CREATE TRIGGER trg_verificar_depreciacion_login
AFTER INSERT ON login
FOR EACH ROW
EXECUTE FUNCTION trg_verificar_depreciacion_login();


-- =====================================================
-- 4.3 TRIGGER PARA VALIDAR BAJA DE ACTIVO
-- =====================================================

CREATE OR REPLACE FUNCTION trg_validar_baja_activo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
DECLARE
    v_estado_retirado_id INT;
BEGIN
    SELECT id_estado_activo
    INTO v_estado_retirado_id
    FROM estado_activo
    WHERE nombre = 'Retirado';

    IF NEW.id_estado_activo = v_estado_retirado_id
       AND OLD.id_estado_activo != v_estado_retirado_id THEN

        IF NEW.valor_actual > NEW.valor_residual THEN
            RAISE EXCEPTION
                'No se puede retirar un activo con valor actual (%) mayor al residual (%)',
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


-- =====================================================
-- 5. PROCEDIMIENTO (SE RESPETA EL NOMBRE AUNQUE YA ES ANUAL)
-- =====================================================

CREATE OR REPLACE PROCEDURE depreciar_activos_mes_actual(
    p_id_usuario INT DEFAULT 2
)
LANGUAGE plpgsql
AS $func$
DECLARE
    v_log TEXT;
BEGIN
    SELECT aplicar_depreciaciones_pendientes(p_id_usuario, CURRENT_DATE)
    INTO v_log;

    RAISE NOTICE '%', v_log;
END;
$func$;


-- =====================================================
-- 6. VISTA DE ACTIVOS POR DEPRECIAR
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
    END AS estado_depreciacion,
    (CURRENT_DATE - COALESCE(a.fecha_prox_depreciacion, a.fecha_inicio_depreciacion)) AS dias_atraso,
    m.nombre AS metodo_depreciacion,
    e.nombre AS estado_activo,
    e.color AS estado_color
FROM activo a
JOIN metodo_depreciacion m
    ON a.id_metodo_depreciacion = m.id_metodo_depreciacion
JOIN estado_activo e
    ON a.id_estado_activo = e.id_estado_activo
WHERE a.valor_actual > a.valor_residual
ORDER BY a.fecha_prox_depreciacion NULLS FIRST;


-- =====================================================
-- 7. LOGIN DE PRUEBA PARA DISPARAR DEPRECIACIÓN
-- =====================================================

-- Este login dispara el proceso automático
INSERT INTO login (id_usuario, fecha, hora)
VALUES (1, CURRENT_DATE, CURRENT_TIME);


-- =====================================================
-- 8. CONSULTAS DE VERIFICACIÓN FINAL
-- =====================================================

SELECT '=== ACTIVOS ACTUALES ===' AS "RESUMEN";
SELECT
    id_activo,
    nombre,
    fecha_ultima_depreciacion,
    fecha_prox_depreciacion,
    valor_actual,
    valor_residual
FROM activo
ORDER BY id_activo;

SELECT '=== HISTORIAL DE MOVIMIENTOS DE DEPRECIACIÓN ===' AS "RESUMEN";
SELECT
    m.id_movimiento,
    m.tipo_movimiento,
    m.fecha_movimiento,
    a.nombre AS activo,
    md.valor_depreciado,
    md.valor_restante
FROM movimiento m
JOIN movimiento_depreciacion md
    ON m.id_movimiento = md.id_movimiento
JOIN activo a
    ON m.id_activo = a.id_activo
ORDER BY m.id_movimiento DESC;

SELECT '=== ACTIVOS POR DEPRECIAR ===' AS "RESUMEN";
SELECT * FROM v_activos_por_depreciar;

SELECT '=== AUDITORÍA ===' AS "RESUMEN";
SELECT
    id_auditoria,
    fecha_auditoria,
    observaciones,
    estados_activos
FROM auditoria
ORDER BY id_auditoria DESC;

SELECT id_activo, nombre, fecha_prox_depreciacion, valor_actual
FROM activo;

INSERT INTO login (id_usuario, fecha, hora)
VALUES (1, CURRENT_DATE, CURRENT_TIME);

SELECT * FROM movimiento ORDER BY id_movimiento DESC;
SELECT * FROM movimiento_depreciacion ORDER BY id_movimiento DESC;




-- ========================================================
-- Vistas para pantallas de analisis
-- Dashboard
create or replace view dashboard as
select
    count(*) as total_activos,
    count(*) filter (WHERE id_estado_activo = (select id_estado_activo from estado_activo where nombre= 'Mantenimiento')) AS activos_en_mantenimiento,
    count(*) filter (WHERE DATE(fecha_registro) >= CURRENT_DATE - interval '7 days') AS aniadidos_recientemente,
    SUM(valor_actual) AS valor_total
FROM activo;
select * from dashboard;
-- Reportes
create or replace view reporte as
select
    count(*) AS total_activos,
	count(*) filter (WHERE id_estado_activo = (select id_estado_activo from estado_activo where nombre= 'Activo')) AS bienes_activos,
    count(*) filter (WHERE id_estado_activo = (select id_estado_activo from estado_activo where nombre= 'Mantenimiento')) AS activos_en_mantenimiento,
    count(*) filter (WHERE DATE(fecha_registro) >= CURRENT_DATE - INTERVAL '7 days') AS aniadidos_recientemente,
    SUM(valor_actual) AS valor_total,
	count(*) filter (where extract(month from fecha_registro)=1 and extract(year from fecha_registro)= extract(year from current_date)) as enero,
	count(*) filter (where extract(month from fecha_registro)=2 and extract(year from fecha_registro)= extract(year from current_date)) as febrero,
	count(*) filter (where extract(month from fecha_registro)=3 and extract(year from fecha_registro)= extract(year from current_date)) as marzo,
	count(*) filter (where extract(month from fecha_registro)=4 and extract(year from fecha_registro)= extract(year from current_date)) as abril,
	count(*) filter (where extract(month from fecha_registro)=5 and extract(year from fecha_registro)= extract(year from current_date)) as mayo,
	count(*) filter (where extract(month from fecha_registro)=6 and extract(year from fecha_registro)= extract(year from current_date)) as junio,
	count(*) filter (where extract(month from fecha_registro)=7 and extract(year from fecha_registro)= extract(year from current_date)) as julio,
	count(*) filter (where extract(month from fecha_registro)=8 and extract(year from fecha_registro)= extract(year from current_date)) as agosto,
	count(*) filter (where extract(month from fecha_registro)=9 and extract(year from fecha_registro)= extract(year from current_date)) as septiembre,
	count(*) filter (where extract(month from fecha_registro)=10 and extract(year from fecha_registro)= extract(year from current_date)) as octubre,
	count(*) filter (where extract(month from fecha_registro)=11 and extract(year from fecha_registro)= extract(year from current_date)) as noviembre,
	count(*) filter (where extract(month from fecha_registro)=12 and extract(year from fecha_registro)= extract(year from current_date)) as diciembre
FROM activo;
-- Historial
create view historial_actividad as
(select m.fecha_movimiento,u.id_usuario, u.nombre_usuario as responsable, u.apellido_paterno, m.id_activo, e.nombre as estado, e.color, m.descripcion
from movimiento m join usuario u on m.id_usuario= u.id_usuario
join activo a on m.id_activo= a.id_activo
join estado_activo e on a.id_estado_activo= e.id_estado_activo
);
select * from historial_actividad;




