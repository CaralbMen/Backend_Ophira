create database PI;


CREATE TABLE rol (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE area (
    id_area SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE puesto (
    id_puesto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    id_area INTEGER NOT NULL,
    CONSTRAINT fk_puesto_area
        FOREIGN KEY (id_area)
        REFERENCES area(id_area)
        ON DELETE RESTRICT
);

CREATE TABLE usuario (
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
select * from usuario;

-- Hasta aqui todo creado
-- Pruebas para las localizaciones
-- drop table edificio;
CREATE TABLE edificio (
    id_edificio varchar(10) PRIMARY KEY, -- C, B, D, LT1, CIDEA
    nombre VARCHAR(150) NOT NULL,
    cantidad_pisos INTEGER NOT NULL CHECK (cantidad_pisos > 0),
	direccion text not null
);

insert into edificio values
('A', 'Principal', 2, 'UPQ'),
('B', 'B', 2, 'UPQ');

select * from edificio;


drop table piso; 
CREATE TABLE piso (
	id_piso varchar(10) primary key,
	id_edificio varchar(10) NOT NULL,
    numero_piso INTEGER NOT NULL,
	cantidad_aulas integer not null check(cantidad_aulas>0),
    CONSTRAINT fk_piso_edificio
        FOREIGN KEY (id_edificio)
        REFERENCES edificio(id_edificio)
        ON DELETE CASCADE,
	constraint u_piso unique(id_edificio, numero_piso) -- C1, B2...
);

insert into piso values
('A1', 'A', 1, 8);

select * from piso;

drop table aula;
CREATE TABLE aula (
    id_aula varchar(10) PRIMARY KEY,
	id_piso varchar(10) NOT NULL,
    numero_aula VARCHAR(50) NOT NULL,
    tipo varchar(30) not null default 'Aula',
    CONSTRAINT fk_aula_piso
        FOREIGN KEY (id_piso)
        REFERENCES piso(id_piso)
        ON DELETE CASCADE,
	constraint u_aula unique(id_piso, numero_aula)
);
insert into aula values
('A105', 'A1', 5, 'Aula');
select * from aula;


CREATE TABLE estado_activo (
    id_estado_activo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color varchar(10)
);

insert into estado_activo (nombre) values
('Activo', 'green'),
('Mantenimiento', 'yellow'),
('Retirado', 'red');
select * from estado_activo;


CREATE TABLE metodo_depreciacion (
    id_metodo_depreciacion SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    parametros JSONB NOT NULL
);

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT
);

CREATE TABLE activo (
    id_activo SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    modelo VARCHAR(150),
    numero_serie VARCHAR(150) UNIQUE,
    fecha_compra DATE NOT NULL,
    precio_compra NUMERIC(12,2) NOT NULL CHECK (precio_compra >= 0),
    valor_residual NUMERIC(12,2) DEFAULT 0 CHECK (valor_residual >= 0),
    vida_util_anios INTEGER CHECK (vida_util_anios > 0),
    id_metodo_depreciacion INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    id_estado_activo INTEGER NOT NULL,
    id_aula INTEGER NOT NULL,
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

CREATE TABLE activo_responsable (
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

CREATE TABLE movimiento (
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


CREATE TABLE movimiento_actualizacion (
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

drop table metodo_depreciacion;
select * from metodo_depreciacion;

CREATE TABLE movimiento_depreciacion (
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

CREATE TABLE movimiento_ubicacion (
    id_movimiento INTEGER PRIMARY KEY,
    id_aula_origen INTEGER NOT NULL,
    id_aula_destino INTEGER NOT NULL,
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

CREATE TABLE movimiento_baja (
    id_movimiento INTEGER PRIMARY KEY,
    motivo_baja TEXT NOT NULL,
    CONSTRAINT fk_baja_movimiento
        FOREIGN KEY (id_movimiento)
        REFERENCES movimiento(id_movimiento)
        ON DELETE CASCADE
);

CREATE TABLE auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    id_movimiento INTEGER NOT NULL,
    id_usuario_auditor INTEGER NOT NULL,
    fecha_auditoria TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
	estados_activos JSONB,
    CONSTRAINT fk_auditoria_movimiento
        FOREIGN KEY (id_movimiento)
        REFERENCES movimiento(id_movimiento)
        ON DELETE CASCADE,
    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (id_usuario_auditor)
        REFERENCES usuario(id_usuario)
);

-- Datos para el jSONB 
INSERT INTO metodo_depreciacion (nombre, descripcion, parametros) VALUES
('Línea Recta', 'Depreciación uniforme a lo largo de la vida útil', 
 '{"tipo": "linea_recta", "formula": "(costo - valor_residual) / vida_util"}'::JSONB),

('SYD (Suma de Dígitos)', 'Depreciación acelerada basada en la suma de los años', 
 '{"tipo": "syd"}'::JSONB),
-- siq uiero ajustar la tasa le muevo aqui
('Saldo Decreciente', 'Depreciación acelerada con una tasa fija', 
 '{"tipo": "saldo_decreciente", "tasa": 0.40}'::JSONB);

INSERT INTO estado_activo (nombre) VALUES 
('Nuevo'), 
('Bueno'), 
('Regular'), 
('Malo'), 
('Dado de Baja');

-- aqui inicia el chorizote de la función 

CREATE OR REPLACE FUNCTION calcular_depreciacion(
    p_activo_id INT,
    p_metodo_id INT DEFAULT NULL
)
RETURNS TABLE(
    anio INT, 
    importe_depreciacion NUMERIC, 
    valor_en_libros NUMERIC,
    depreciacion_acumulada NUMERIC
)
LANGUAGE plpgsql
AS $func$
DECLARE
    v_costo NUMERIC;
    v_residual NUMERIC;
    v_vida INT;
    v_metodo_id INT;
    v_parametros JSONB;
    v_tasa NUMERIC;
    v_suma_digitos INT;
    v_depreciable NUMERIC;
    v_activo_existe BOOLEAN;
    v_nombre_activo VARCHAR(200);
BEGIN
    -- Validar existencia del activo
    SELECT EXISTS(
        SELECT 1 FROM activo WHERE id_activo = p_activo_id
    ) INTO v_activo_existe;
    
    IF NOT v_activo_existe THEN
        RAISE EXCEPTION 'El activo con ID % no existe', p_activo_id;
    END IF;

    -- Obtener datos del activo
    SELECT 
        a.precio_compra, 
        COALESCE(a.valor_residual, 0), 
        a.vida_util_anios,
        a.nombre,
        COALESCE(p_metodo_id, a.id_metodo_depreciacion)
    INTO 
        v_costo, 
        v_residual, 
        v_vida, 
        v_nombre_activo,
        v_metodo_id
    FROM activo a
    WHERE a.id_activo = p_activo_id;

    -- Validaciones
    IF v_vida IS NULL OR v_vida <= 0 THEN
        RAISE EXCEPTION 'El activo "%" no tiene vida útil válida', v_nombre_activo;
    END IF;

    IF v_residual > v_costo THEN
        RAISE EXCEPTION 'El valor residual no puede ser mayor al costo';
    END IF;

    -- Obtener parámetros
    SELECT parametros
    INTO v_parametros
    FROM metodo_depreciacion
    WHERE id_metodo_depreciacion = v_metodo_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Método de depreciación no existe';
    END IF;

    v_depreciable := v_costo - v_residual;

    -- Caso sin depreciación
    IF v_depreciable = 0 THEN
        RETURN QUERY
        SELECT 
            g.anio,
            0,
            v_costo,
            0
        FROM generate_series(1, v_vida) g(anio);
        RETURN;
    END IF;

    -- Métodos
    CASE v_parametros->>'tipo'
-- LÍNEA RECTA
        
        WHEN 'linea_recta' THEN
            RETURN QUERY
            SELECT 
                g.anio,
                ROUND(v_depreciable / v_vida, 2),
                ROUND(v_costo - (g.anio * (v_depreciable / v_vida)), 2),
                ROUND(g.anio * (v_depreciable / v_vida), 2)
            FROM generate_series(1, v_vida) g(anio);


-- SYD

        WHEN 'syd' THEN
            v_suma_digitos := v_vida * (v_vida + 1) / 2;

            RETURN QUERY
            SELECT 
                g.anio,
                ROUND((v_vida - g.anio + 1)::NUMERIC / v_suma_digitos * v_depreciable, 2),
                ROUND(
                    v_costo - SUM((v_vida - g.anio + 1)::NUMERIC / v_suma_digitos * v_depreciable)
                    OVER (ORDER BY g.anio), 2
                ),
                ROUND(
                    SUM((v_vida - g.anio + 1)::NUMERIC / v_suma_digitos * v_depreciable)
                    OVER (ORDER BY g.anio), 2
                )
            FROM generate_series(1, v_vida) g(anio);


        WHEN 'saldo_decreciente' THEN
            v_tasa := COALESCE((v_parametros->>'tasa')::NUMERIC, 0);

            IF v_tasa <= 0 OR v_tasa > 1 THEN
                RAISE EXCEPTION 'Tasa inválida';
            END IF;

            RETURN QUERY
            WITH RECURSIVE rec(
                anio, 
                importe_depreciacion, 
                valor_en_libros, 
                depreciacion_acumulada
            ) AS (
                
                -- Año 1
                SELECT 
                    1,
                    ROUND(LEAST(v_costo * v_tasa, v_costo - v_residual), 2),
                    ROUND(v_costo - LEAST(v_costo * v_tasa, v_costo - v_residual), 2),
                    ROUND(LEAST(v_costo * v_tasa, v_costo - v_residual), 2)

                UNION ALL

                -- Siguientes años
                SELECT 
                    r.anio + 1,
                    ROUND(
                        LEAST(r.valor_en_libros * v_tasa, r.valor_en_libros - v_residual), 2
                    ),
                    ROUND(
                        r.valor_en_libros - LEAST(r.valor_en_libros * v_tasa, r.valor_en_libros - v_residual), 2
                    ),
                    ROUND(
                        r.depreciacion_acumulada + LEAST(r.valor_en_libros * v_tasa, r.valor_en_libros - v_residual), 2
                    )
                FROM rec r
                WHERE r.anio < v_vida
                  AND r.valor_en_libros > v_residual
            )
            SELECT * FROM rec;

        ELSE
            RAISE EXCEPTION 'Método no soportado: %', v_parametros->>'tipo';
    END CASE;

END;
$func$;



-- no pasar a partir de aqui esto es para las pruebas
-- Roles
INSERT INTO rol (nombre, descripcion) VALUES
('Admin', 'Administrador del sistema'),
('Usuario', 'Usuario operativo');

-- Área
INSERT INTO area (nombre) VALUES
('TI');

-- Puesto
INSERT INTO puesto (nombre, id_area) VALUES
('Desarrollador', 1);

-- Usuario
INSERT INTO usuario (
    nombre_usuario, nombre, apellido_paterno, correo,
    id_rol, id_puesto, password
) VALUES
('ricky', 'Ricky', 'Vel', 'ricky@mail.com', 1, 1, '123456');

-- Edificio
INSERT INTO edificio (nombre, numero_pisos) VALUES
('Edificio A', 3);

-- Piso
INSERT INTO piso (numero_piso, id_edificio) VALUES
(1, 1);

-- Aula
INSERT INTO aula (numero_aula, id_piso) VALUES
('A-101', 1);

-- Categoría
INSERT INTO categoria (nombre, descripcion) VALUES
('Equipo de Cómputo', 'Computadoras y laptops');

--para depreciacion
-- Línea Recta
INSERT INTO activo (
    nombre, fecha_compra, precio_compra, valor_residual,
    vida_util_anios, id_metodo_depreciacion,
    id_categoria, id_estado_activo, id_aula
) VALUES
('Laptop HP', '2024-01-01', 10000, 1000, 5, 1, 1, 1, 1);

-- SYD
INSERT INTO activo (
    nombre, fecha_compra, precio_compra, valor_residual,
    vida_util_anios, id_metodo_depreciacion,
    id_categoria, id_estado_activo, id_aula
) VALUES
('Impresora Epson', '2024-01-01', 8000, 500, 4, 2, 1, 1, 1);

-- Saldo decreciente
INSERT INTO activo (
    nombre, fecha_compra, precio_compra, valor_residual,
    vida_util_anios, id_metodo_depreciacion,
    id_categoria, id_estado_activo, id_aula
) VALUES
('Servidor Dell', '2024-01-01', 20000, 2000, 5, 3, 1, 1, 1);
-- linea recta
SELECT * FROM calcular_depreciacion(1);

SELECT 
    a.nombre,
    d.*
FROM calcular_depreciacion(1) d
JOIN activo a 
    ON a.id_activo = 1;
-- syd
SELECT * FROM calcular_depreciacion(2);
SELECT 
    a.nombre,
    d.*
FROM calcular_depreciacion(2) d
JOIN activo a 
    ON a.id_activo = 2;
--saldo decreciente
SELECT * FROM calcular_depreciacion(3);
SELECT 
    a.nombre,
    d.*
FROM calcular_depreciacion(3) d
JOIN activo a 
    ON a.id_activo = 3;