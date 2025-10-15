
CREATE DATABASE sce;


\c sce;


CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE,  
    descripcion VARCHAR(255), 
    nivel_acceso INT NOT NULL,
    estado BOOLEAN DEFAULT TRUE 
);


CREATE TABLE estados (
    id_estado SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE,  
    descripcion VARCHAR(255) 
);


CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    id_rol INT,
    cedula VARCHAR(20) NOT NULL, 
    nombre VARCHAR(60) NOT NULL,  
    apellido VARCHAR(60) NOT NULL, 
    email VARCHAR(60) NOT NULL UNIQUE,  
    telefono VARCHAR(15) NOT NULL,  
    contrasena VARCHAR(255) NOT NULL, 
    token VARCHAR(255), 
    fecha_token TIMESTAMP,  
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN DEFAULT TRUE, 
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE
);


CREATE TABLE Estado (
    id_estado SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE Municipio (
    id_municipio SERIAL PRIMARY KEY,
    id_estado INT,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    estado BOOLEAN DEFAULT TRUE,  
    FOREIGN KEY (id_estado) REFERENCES Estado(id_estado) ON DELETE CASCADE
);

CREATE TABLE Parroquia (
    id_parroquia SERIAL PRIMARY KEY,
    id_municipio INT,
    nombre VARCHAR(60) NOT NULL,
    estado BOOLEAN DEFAULT TRUE,  
    FOREIGN KEY (id_municipio) REFERENCES Municipio(id_municipio) ON DELETE CASCADE
);

CREATE TABLE Comunidad (
    id_comunidad SERIAL PRIMARY KEY,
    id_parroquia INT,
    nombre VARCHAR(60) NOT NULL,
    estado BOOLEAN DEFAULT TRUE, 
    FOREIGN KEY (id_parroquia) REFERENCES Parroquia(id_parroquia) ON DELETE CASCADE
);

CREATE TABLE Ubicacion (
    id_ubicacion SERIAL PRIMARY KEY,
    id_comunidad INT,
    nombre VARCHAR(60) NOT NULL,
    calle VARCHAR(120) NOT NULL,
    avenida VARCHAR(120) NOT NULL,
    referencia VARCHAR(200) NOT NULL,
    estado BOOLEAN DEFAULT TRUE, 
    FOREIGN KEY (id_comunidad) REFERENCES Comunidad(id_comunidad) ON DELETE CASCADE
);

CREATE TABLE Personal (
    id_persona SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    apellido VARCHAR(120) NOT NULL,
    cuenta VARCHAR(60) NOT NULL UNIQUE,
    telefono VARCHAR(17) NOT NULL,
    cargo VARCHAR(60) NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE Centro_de_Votacion (
    id_ce SERIAL PRIMARY KEY,
    id_persona INT,
    id_ubicacion INT,
    nombre VARCHAR(60) NOT NULL,
    mesas INT NOT NULL,
    codigo INT NOT NULL UNIQUE, 
    estado BOOLEAN DEFAULT TRUE, 
    FOREIGN KEY (id_persona) REFERENCES Personal(id_persona) ON DELETE CASCADE,
    FOREIGN KEY (id_ubicacion) REFERENCES Ubicacion(id_ubicacion) ON DELETE CASCADE
);

CREATE TABLE Evento (
    id_evento SERIAL PRIMARY KEY,
    id_ce INT,
    nombre VARCHAR(60) NOT NULL,
    fecha_evento TIMESTAMP NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_ce) REFERENCES Centro_de_Votacion(id_ce) ON DELETE CASCADE
);

CREATE TABLE Afluencia (
    id_afluencia SERIAL PRIMARY KEY,
    id_evento INT,
    cantidad INT NOT NULL,
    hora TIMESTAMP,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_evento) REFERENCES Evento(id_evento) ON DELETE CASCADE
);

CREATE TABLE Comuna (
    id_comuna SERIAL PRIMARY KEY,
    codigo INT UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    cantidad_electores INT NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE Proyecto (
    id_proyecto SERIAL PRIMARY KEY,
    id_comuna INT,
    nombre VARCHAR(60) NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_comuna) REFERENCES Comuna(id_comuna) ON DELETE CASCADE
);

CREATE TABLE T_Comunal (
    id_comunal SERIAL PRIMARY KEY,
    id_proyecto INT,
    id_evento INT,
    resultado INT NOT NULL,
    estado BOOLEAN DEFAULT TRUE,  
    FOREIGN KEY (id_proyecto) REFERENCES Proyecto(id_proyecto) ON DELETE CASCADE,
    FOREIGN KEY (id_evento) REFERENCES Evento(id_evento) ON DELETE CASCADE
);

CREATE TABLE Eventocc (
    id_cc SERIAL PRIMARY KEY,
    id_evento INT,
    codigo INT NOT NULL UNIQUE, 
    nombre VARCHAR(60) NOT NULL,
    voceria VARCHAR(60) NOT NULL,
    resultado INT NOT NULL,
    cantidad_electores INT NOT NULL,
    estado BOOLEAN DEFAULT TRUE,  -- TRUE = activo, FALSE = inactivo
    FOREIGN KEY (id_evento) REFERENCES Evento(id_evento) ON DELETE CASCADE
);

CREATE TABLE Consejo_Comunal (
    id_consejo SERIAL PRIMARY KEY,
    id_cc INT,
    nombre VARCHAR(60) NOT NULL,
    apellido VARCHAR(60) NOT NULL,
    rif VARCHAR(25) NOT NULL UNIQUE,  -- Añadido UNIQUE para evitar duplicados
    fecha_eleccion DATE,
    cantidad_electores INT NOT NULL,
    estado BOOLEAN DEFAULT TRUE,  -- TRUE = activo, FALSE = inactivo
    FOREIGN KEY (id_cc) REFERENCES Eventocc(id_cc) ON DELETE CASCADE
);

-- Funciones para manejar la lógica de negocio
-- Las funciones en PostgreSQL se implementan de manera diferente a las de MySQL.

-- Agregar un usuario
CREATE OR REPLACE FUNCTION agregar_usuario(
    p_cedula VARCHAR(20),
    p_nombre VARCHAR(60),
    p_apellido VARCHAR(60),
    p_email VARCHAR(60),
    p_telefono VARCHAR(15),
    p_contrasena VARCHAR(255)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO usuarios (cedula, nombre, apellido, email, telefono, contrasena, estado)
    VALUES (p_cedula, p_nombre, p_apellido, p_email, p_telefono, crypt(p_contrasena, gen_salt('bf')), TRUE);  -- Encriptar la contraseña
END;
$$ LANGUAGE plpgsql;

-- Modificar un usuario
CREATE OR REPLACE FUNCTION modificar_usuario(
    p_id INT,
    p_cedula VARCHAR(20),
    p_nombre VARCHAR(60),
    p_apellido VARCHAR(60),
    p_email VARCHAR(60),
    p_telefono VARCHAR(15),
    p_contrasena VARCHAR(255),
    p_token VARCHAR(255),
    p_fecha_token TIMESTAMP
) RETURNS VOID AS $$
BEGIN
    UPDATE usuarios
    SET cedula = p_cedula,
        nombre = p_nombre,
        apellido = p_apellido,
        email = p_email,
        telefono = p_telefono,
        contrasena = crypt(p_contrasena, gen_salt('bf')),  -- Encriptar la nueva contraseña
        token = p_token,
        fecha_token = p_fecha_token
    WHERE id = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar un usuario (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_usuario(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE usuarios
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar un rol
CREATE OR REPLACE FUNCTION agregar_rol(
    p_nombre VARCHAR(60),
    p_descripcion VARCHAR(255),
    p_nivel_acceso INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO roles (nombre, descripcion, nivel_acceso, estado)
    VALUES (p_nombre, p_descripcion, p_nivel_acceso, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar un rol
CREATE OR REPLACE FUNCTION modificar_rol(
    p_id INT,
    p_nombre VARCHAR(60),
    p_descripcion VARCHAR(255),
    p_nivel_acceso INT
) RETURNS VOID AS $$
BEGIN
    UPDATE roles
    SET nombre = p_nombre,
        descripcion = p_descripcion,
        nivel_acceso = p_nivel_acceso
    WHERE id_rol = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar un rol (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_rol(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE roles
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_rol = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar un municipio
CREATE OR REPLACE FUNCTION agregar_municipio(
    p_nombre VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Municipio (nombre, estado)
    VALUES (p_nombre, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar un municipio
CREATE OR REPLACE FUNCTION modificar_municipio(
    p_id INT,
    p_nombre VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    UPDATE Municipio
    SET nombre = p_nombre
    WHERE id_municipio = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar un municipio (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_municipio(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Municipio
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_municipio = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar una parroquia
CREATE OR REPLACE FUNCTION agregar_parroquia(
    p_id_municipio INT,
    p_nombre VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Parroquia (id_municipio, nombre, estado)
    VALUES (p_id_municipio, p_nombre, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar una parroquia
CREATE OR REPLACE FUNCTION modificar_parroquia(
    p_id INT,
    p_id_municipio INT,
    p_nombre VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    UPDATE Parroquia
    SET id_municipio = p_id_municipio,
        nombre = p_nombre
    WHERE id_parroquia = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar una parroquia (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_parroquia(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Parroquia
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_parroquia = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar una comunidad
CREATE OR REPLACE FUNCTION agregar_comunidad(
    p_id_parroquia INT,
    p_nombre VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Comunidad (id_parroquia, nombre, estado)
    VALUES (p_id_parroquia, p_nombre, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar una comunidad
CREATE OR REPLACE FUNCTION modificar_comunidad(
    p_id INT,
    p_id_parroquia INT,
    p_nombre VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    UPDATE Comunidad
    SET id_parroquia = p_id_parroquia,
        nombre = p_nombre
    WHERE id_comunidad = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar una comunidad (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_comunidad(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Comunidad
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_comunidad = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar una ubicación
CREATE OR REPLACE FUNCTION agregar_ubicacion(
    p_id_comunidad INT,
    p_nombre VARCHAR(60),
    p_calle VARCHAR(120),
    p_avenida VARCHAR(120),
    p_referencia VARCHAR(200)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Ubicacion (id_comunidad, nombre, calle, avenida, referencia, estado)
    VALUES (p_id_comunidad, p_nombre, p_calle, p_avenida, p_referencia, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar una ubicación
CREATE OR REPLACE FUNCTION modificar_ubicacion(
    p_id INT,
    p_id_comunidad INT,
    p_nombre VARCHAR(60),
    p_calle VARCHAR(120),
    p_avenida VARCHAR(120),
    p_referencia VARCHAR(200)
) RETURNS VOID AS $$
BEGIN
    UPDATE Ubicacion
    SET id_comunidad = p_id_comunidad,
        nombre = p_nombre,
        calle = p_calle,
        avenida = p_avenida,
        referencia = p_referencia
    WHERE id_ubicacion = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar una ubicación (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_ubicacion(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Ubicacion
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_ubicacion = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar una persona
CREATE OR REPLACE FUNCTION agregar_persona(
    p_cedula VARCHAR(20),
    p_nombre VARCHAR(60),
    p_apellido VARCHAR(120),
    p_cuenta VARCHAR(60),
    p_telefono VARCHAR(17),
    p_cargo VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Personal (cedula, nombre, apellido, cuenta, telefono, cargo, estado)
    VALUES (p_cedula, p_nombre, p_apellido, p_cuenta, p_telefono, p_cargo, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar una persona
CREATE OR REPLACE FUNCTION modificar_persona(
    p_id INT,
    p_cedula VARCHAR(20),
    p_nombre VARCHAR(60),
    p_apellido VARCHAR(120),
    p_cuenta VARCHAR(60),
    p_telefono VARCHAR(17),
    p_cargo VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    UPDATE Personal
    SET cedula = p_cedula,
        nombre = p_nombre,
        apellido = p_apellido,
        cuenta = p_cuenta,
        telefono = p_telefono,
        cargo = p_cargo
    WHERE id_persona = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar una persona (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_persona(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Personal
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_persona = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar un centro de votación
CREATE OR REPLACE FUNCTION agregar_centro_votacion(
    p_id_persona INT,
    p_id_ubicacion INT,
    p_nombre VARCHAR(60),
    p_cantidad INT,
    p_codigo INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Centro_de_Votacion (id_persona, id_ubicacion, nombre, mesas, codigo, estado)
    VALUES (p_id_persona, p_id_ubicacion, p_nombre, p_cantidad, p_codigo, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar un centro de votación
CREATE OR REPLACE FUNCTION modificar_centro_votacion(
    p_id INT,
    p_id_persona INT,
    p_id_ubicacion INT,
    p_nombre VARCHAR(60),
    p_cantidad INT,
    p_codigo INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Centro_de_Votacion
    SET id_persona = p_id_persona,
        id_ubicacion = p_id_ubicacion,
        nombre = p_nombre,
        mesas = p_cantidad,
        codigo = p_codigo
    WHERE id_ce = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar un centro de votación (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_centro_votacion(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Centro_de_Votacion
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_ce = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar un evento
CREATE OR REPLACE FUNCTION agregar_evento(
    p_id_ce INT,
    p_nombre VARCHAR(60),
    p_fecha_evento TIMESTAMP
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Evento (id_ce, nombre, fecha_evento, estado)
    VALUES (p_id_ce, p_nombre, p_fecha _evento, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar un evento
CREATE OR REPLACE FUNCTION modificar_evento(
    p_id INT,
    p_id_ce INT,
    p_nombre VARCHAR(60),
    p_fecha_evento TIMESTAMP
) RETURNS VOID AS $$
BEGIN
    UPDATE Evento
    SET id_ce = p_id_ce,
        nombre = p_nombre,
        fecha_evento = p_fecha_evento
    WHERE id_evento = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar un evento (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_evento(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Evento
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_evento = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar una afluencia
CREATE OR REPLACE FUNCTION agregar_afluencia(
    p_id_evento INT,
    p_cantidad INT,
    p_hora TIMESTAMP
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Afluencia (id_evento, cantidad, hora, estado)
    VALUES (p_id_evento, p_cantidad, p_hora, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar una afluencia
CREATE OR REPLACE FUNCTION modificar_afluencia(
    p_id INT,
    p_id_evento INT,
    p_cantidad INT,
    p_hora TIMESTAMP
) RETURNS VOID AS $$
BEGIN
    UPDATE Afluencia
    SET id_evento = p_id_evento,
        cantidad = p_cantidad,
        hora = p_hora
    WHERE id_afluencia = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar una afluencia (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_afluencia(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Afluencia
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_afluencia = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar un candidato
CREATE OR REPLACE FUNCTION agregar_candidato(
    p_id_partido INT,
    p_nombre VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO candidatos (id_partido, nombre, estado)
    VALUES (p_id_partido, p_nombre, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar un candidato
CREATE OR REPLACE FUNCTION modificar_candidato(
    p_id INT,
    p_id_partido INT,
    p_nombre VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    UPDATE candidatos
    SET id_partido = p_id_partido,
        nombre = p_nombre
    WHERE id_candidato = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar un candidato (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_candidato(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE candidatos
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_candidato = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar un resultado de evento
CREATE OR REPLACE FUNCTION agregar_t_evento(
    p_id_candidato INT,
    p_id_evento INT,
    p_resultado INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO t_evento (id_candidato, id_evento, resultado, estado)
    VALUES (p_id_candidato, p_id_evento, p_resultado, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar un resultado de evento
CREATE OR REPLACE FUNCTION modificar_t_evento(
    p_id INT,
    p_id_candidato INT,
    p_id_evento INT,
    p_resultado INT
) RETURNS VOID AS $$
BEGIN
    UPDATE t_evento
    SET id_candidato = p_id_candidato,
        id_evento = p_id_evento,
        resultado = p_resultado
    WHERE id_tevento = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar un resultado de evento (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_t_evento(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE t_evento
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_tevento = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar una comuna
CREATE OR REPLACE FUNCTION agregar_comuna(
    p_codigo INT,
    p_nombre VARCHAR(120),
    p_cantidad_electores INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Comuna (codigo, nombre, cantidad_electores, estado)
    VALUES (p_codigo, p_nombre, p_cantidad_electores, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar una comuna
CREATE OR REPLACE FUNCTION modificar_comuna(
    p_id INT,
    p_codigo INT,
    p_nombre VARCHAR(120),
    p_cantidad_electores INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Comuna
    SET codigo = p_codigo,
        nombre = p_nombre,
        cantidad_electores = p_cantidad_electores
    WHERE id_comuna = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar una comuna (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_comuna(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Comuna
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_comuna = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar un proyecto
CREATE OR REPLACE FUNCTION agregar_proyecto(
    p_id_comuna INT,
    p_nombre VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Proyecto (id_comuna, nombre, estado)
    VALUES (p_id_comuna, p_nombre, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar un proyecto
CREATE OR REPLACE FUNCTION modificar_proyecto(
    p_id INT,
    p_id_comuna INT,
    p_nombre VARCHAR(60)
) RETURNS VOID AS $$
BEGIN
    UPDATE Proyecto
    SET id_comuna = p_id_comuna,
        nombre = p_nombre
    WHERE id_proyecto = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar un proyecto (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_proyecto(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Proyecto
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_proyecto = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar un resultado comunal
CREATE OR REPLACE FUNCTION agregar_t_comunal(
    p_id_proyecto INT,
    p_id_evento INT,
    p_resultado INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO T_Comunal (id_proyecto, id_evento, resultado, estado)
    VALUES (p_id_proyecto, p_id_evento, p_resultado, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar un resultado comunal
CREATE OR REPLACE FUNCTION modificar_t_comunal(
    p_id INT,
    p_id_proyecto INT,
    p_id_evento INT,
    p_resultado INT
) RETURNS VOID AS $$
BEGIN
    UPDATE T_Comunal
    SET id_proyecto = p_id_proyecto,
        id_evento = p_id_evento,
        resultado = p_resultado
    WHERE id_comunal = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar un resultado comunal (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_t_comunal(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE T_Comunal
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_comunal = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar un evento comunitario
CREATE OR REPLACE FUNCTION agregar_eventocc(
    p_id_evento INT,
    p_codigo INT,
    p_nombre VARCHAR(60),
    p_voceria VARCHAR(60),
    p_resultado INT,
    p_cantidad_electores INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Eventocc (id_evento, codigo, nombre, voceria, resultado, cantidad_electores, estado)
    VALUES (p_id_evento, p_codigo, p_nombre, p_voceria, p_resultado, p_cantidad_electores, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar un evento comunitario
CREATE OR REPLACE FUNCTION modificar_eventocc(
    p_id INT,
    p_id_evento INT,
    p_codigo INT,
    p_nombre VARCHAR(60),
    p_voceria VARCHAR(60),
    p_resultado INT,
    p_cantidad_electores INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Eventocc
    SET id_evento = p_id_evento,
        codigo = p_codigo,
        nombre = p_nombre,
        voceria = p_voceria,
        resultado = p_resultado,
        cantidad_electores = p_cantidad_electores
    WHERE id_cc = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;

-- Eliminar un evento comunitario (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_eventocc(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Eventocc
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_cc = p_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar un consejo comunal
CREATE OR REPLACE FUNCTION agregar_consejo_comunal(
    p_id_cc INT,
    p_nombre VARCHAR(60),
    p_apellido VARCHAR(60),
    p_rif VARCHAR(25),
    p_fecha_eleccion DATE,
    p_cantidad_electores INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO Consejo_Comunal (id_cc, nombre, apellido, rif, fecha_eleccion, cantidad_electores, estado)
    VALUES (p_id_cc, p_nombre, p_apellido, p_rif, p_fecha_eleccion, p_cantidad_electores, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Modificar un consejo comunal
CREATE OR REPLACE FUNCTION modificar_consejo_comunal(
    p_id INT,
    p_id_cc INT,
    p_nombre VARCHAR(60),
    p_apellido VARCHAR(60),
    p_rif VARCHAR(25),
    p_fecha_eleccion DATE,
    p_cantidad_electores INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Consejo_Comunal
    SET id_cc = p_id_cc,
        nombre = p_nombre,
        apellido = p_apellido,
        rif = p_rif,
        fecha_eleccion = p_fecha_eleccion, -- <--- aquí va la coma
        cantidad_electores = p_cantidad_electores
    WHERE id_consejo = p_id AND estado = TRUE;  -- Solo modifica si el estado es activo
END;
$$ LANGUAGE plpgsql;


-- Eliminar un consejo comunal (eliminación lógica)
CREATE OR REPLACE FUNCTION eliminar_consejo_comunal(
    p_id INT
) RETURNS VOID AS $$
BEGIN
    UPDATE Consejo_Comunal
    SET estado = FALSE  -- Cambia el estado a inactivo
    WHERE id_consejo = p_id;
END;
$$ LANGUAGE plpgsql;

-- Crear la tabla de candidatos que faltaba (necesaria para algunas funciones)
CREATE TABLE candidatos (
    id_candidato SERIAL PRIMARY KEY,
    id_partido INT,
    nombre VARCHAR(60) NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_partido) REFERENCES partidos(id_partido) ON DELETE CASCADE
);

-- Crear la tabla de partidos (necesaria para la tabla de candidatos)
CREATE TABLE partidos (
    id_partido SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

-- Crear la tabla de t_evento que faltaba (necesaria para algunas funciones)
CREATE TABLE t_evento (
    id_tevento SERIAL PRIMARY KEY,
    id_candidato INT,
    id_evento INT,
    resultado INT NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_candidato) REFERENCES candidatos(id_candidato) ON DELETE CASCADE,
    FOREIGN KEY (id_evento) REFERENCES Evento(id_evento) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cedula ON usuarios(cedula);
CREATE INDEX idx_personal_cedula ON Personal(cedula);
CREATE INDEX idx_centro_votacion_codigo ON Centro_de_Votacion(codigo);
CREATE INDEX idx_eventocc_codigo ON Eventocc(codigo);
CREATE INDEX idx_consejo_comunal_rif ON Consejo_Comunal(rif);
CREATE INDEX idx_comuna_codigo ON Comuna(codigo);

-- Función para verificar si un usuario existe
CREATE OR REPLACE FUNCTION usuario_existe(p_email VARCHAR) 
RETURNS BOOLEAN AS $$
DECLARE 
    existe BOOLEAN;
BEGIN
    SELECT COUNT(*) > 0 INTO existe FROM usuarios WHERE email = p_email;
    RETURN existe;
END;
$$ LANGUAGE plpgsql;

-- Función para autenticar un usuario
CREATE OR REPLACE FUNCTION autenticar_usuario(p_email VARCHAR, p_contrasena VARCHAR)
RETURNS TABLE(id INT, nombre VARCHAR, email VARCHAR, id_rol INT) AS $$
BEGIN
    RETURN QUERY 
    SELECT u.id, u.nombre, u.email, u.id_rol 
    FROM usuarios u 
    WHERE u.email = p_email 
    AND u.contrasena = crypt(p_contrasena, u.contrasena)
    AND u.estado = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener información de un usuario
CREATE OR REPLACE FUNCTION obtener_usuario(p_id INT)
RETURNS TABLE(
    id INT, 
    id_rol INT, 
    cedula VARCHAR, 
    nombre VARCHAR, 
    apellido VARCHAR, 
    email VARCHAR, 
    telefono VARCHAR, 
    fecha_registro TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        u.id, 
        u.id_rol, 
        u.cedula, 
        u.nombre, 
        u.apellido, 
        u.email, 
        u.telefono, 
        u.fecha_registro
    FROM usuarios u
    WHERE u.id = p_id AND u.estado = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para listar usuarios con paginación
CREATE OR REPLACE FUNCTION listar_usuarios(
    p_limit INT, 
    p_offset INT
) RETURNS TABLE(
    id INT, 
    nombre VARCHAR, 
    apellido VARCHAR, 
    email VARCHAR, 
    rol_nombre VARCHAR
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        u.id, 
        u.nombre, 
        u.apellido, 
        u.email, 
        r.nombre as rol_nombre
    FROM usuarios u
    JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.estado = TRUE
    ORDER BY u.id
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Función para contar usuarios activos
CREATE OR REPLACE FUNCTION contar_usuarios()
RETURNS BIGINT AS $$
DECLARE
    total BIGINT;
BEGIN
    SELECT COUNT(*) INTO total FROM usuarios WHERE estado = TRUE;
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar token de usuario
CREATE OR REPLACE FUNCTION actualizar_token(
    p_id INT,
    p_token VARCHAR,
    p_fecha_token TIMESTAMP
) RETURNS VOID AS $$
BEGIN
    UPDATE usuarios
    SET token = p_token,
        fecha_token = p_fecha_token
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar token
CREATE OR REPLACE FUNCTION verificar_token(
    p_id INT,
    p_token VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    valido BOOLEAN;
BEGIN
    SELECT token = p_token AND fecha_token > CURRENT_TIMESTAMP 
    INTO valido 
    FROM usuarios 
    WHERE id = p_id;
    
    RETURN valido;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para cambiar contraseña
CREATE OR REPLACE FUNCTION cambiar_contrasena(
    p_id INT,
    p_contrasena_actual VARCHAR,
    p_nueva_contrasena VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    coincide BOOLEAN;
BEGIN
    -- Verificar que la contraseña actual sea correcta
    SELECT contrasena = crypt(p_contrasena_actual, contrasena) 
    INTO coincide 
    FROM usuarios 
    WHERE id = p_id;
    
    IF coincide THEN
        UPDATE usuarios
        SET contrasena = crypt(p_nueva_contrasena, gen_salt('bf'))
        WHERE id = p_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para restablecer contraseña (admin)
CREATE OR REPLACE FUNCTION restablecer_contrasena(
    p_id INT,
    p_nueva_contrasena VARCHAR
) RETURNS VOID AS $$
BEGIN
    UPDATE usuarios
    SET contrasena = crypt(p_nueva_contrasena, gen_salt('bf'))
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Vista para información resumida de centros de votación
CREATE OR REPLACE VIEW vista_centros_votacion AS
SELECT 
    cv.id_ce as id,
    cv.nombre,
    cv.mesas,
    cv.codigo,
    com.nombre as comunidad,
    par.nombre as parroquia,
    mun.nombre as municipio,
    est.nombre as estado
FROM 
    Centro_de_Votacion cv
JOIN Ubicacion u ON cv.id_ubicacion = u.id_ubicacion
JOIN Comunidad com ON u.id_comunidad = com.id_comunidad
JOIN Parroquia par ON com.id_parroquia = par.id_parroquia
JOIN Municipio mun ON par.id_municipio = mun.id_municipio
JOIN Estado est ON mun.id_estado = est.id_estado
WHERE 
    cv.estado = TRUE;

-- Vista para información de eventos con afluencia
CREATE OR REPLACE VIEW vista_eventos_afluencia AS
SELECT 
    e.id_evento as id,
    e.nombre,
    e.fecha_evento,
    cv.nombre as centro_votacion,
    COALESCE(SUM(a.cantidad), 0) as total_asistentes
FROM 
    Evento e
JOIN Centro_de_Votacion cv ON e.id_ce = cv.id_ce
LEFT JOIN Afluencia a ON e.id_evento = a.id_evento AND a.estado = TRUE
WHERE 
    e.estado = TRUE
GROUP BY 
    e.id_evento, e.nombre, e.fecha_evento, cv.nombre;

-- Función para obtener jerarquía geográfica completa
CREATE OR REPLACE FUNCTION obtener_jerarquia_geografica()
RETURNS TABLE(
    estado_id INT,
    estado_nombre VARCHAR,
    municipio_id INT,
    municipio_nombre VARCHAR,
    parroquia_id INT,
    parroquia_nombre VARCHAR,
    comunidad_id INT,
    comunidad_nombre VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id_estado as estado_id,
        e.nombre as estado_nombre,
        m.id_municipio as municipio_id,
        m.nombre as municipio_nombre,
        p.id_parroquia as parroquia_id,
        p.nombre as parroquia_nombre,
        c.id_comunidad as comunidad_id,
        c.nombre as comunidad_nombre
    FROM 
        Estado e
    JOIN Municipio m ON e.id_estado = m.id_estado AND m.estado = TRUE
    JOIN Parroquia p ON m.id_municipio = p.id_municipio AND p.estado = TRUE
    JOIN Comunidad c ON p.id_parroquia = c.id_parroquia AND c.estado = TRUE
    WHERE 
        e.estado = TRUE
    ORDER BY 
        e.nombre, m.nombre, p.nombre, c.nombre;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de eventos por centro de votación
CREATE OR REPLACE FUNCTION estadisticas_eventos_por_centro()
RETURNS TABLE(
    centro_id INT,
    centro_nombre VARCHAR,
    total_eventos BIGINT,
    ultimo_evento TIMESTAMP,
    total_asistentes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cv.id_ce as centro_id,
        cv.nombre as centro_nombre,
        COUNT(e.id_evento) as total_eventos,
        MAX(e.fecha_evento) as ultimo_evento,
        COALESCE(SUM(a.cantidad), 0) as total_asistentes
    FROM 
        Centro_de_Votacion cv
    LEFT JOIN Evento e ON cv.id_ce = e.id_ce AND e.estado = TRUE
    LEFT JOIN Afluencia a ON e.id_evento = a.id_evento AND a.estado = TRUE
    WHERE 
        cv.estado = TRUE
    GROUP BY 
        cv.id_ce, cv.nombre
    ORDER BY 
        cv.nombre;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener resultados de eventos comunales
CREATE OR REPLACE FUNCTION resultados_eventos_comunales()
RETURNS TABLE(
    evento_id INT,
    evento_nombre VARCHAR,
    fecha_evento TIMESTAMP,
    proyecto_nombre VARCHAR,
    resultado INT,
    comuna_nombre VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id_evento as evento_id,
        e.nombre as evento_nombre,
        e.fecha_evento,
        p.nombre as proyecto_nombre,
        tc.resultado,
        co.nombre as comuna_nombre
    FROM 
        T_Comunal tc
    JOIN Proyecto p ON tc.id_proyecto = p.id_proyecto AND p.estado = TRUE
    JOIN Evento e ON tc.id_evento = e.id_evento AND e.estado = TRUE
    JOIN Comuna co ON p.id_comuna = co.id_comuna AND co.estado = TRUE
    WHERE 
        tc.estado = TRUE
    ORDER BY 
        e.fecha_evento DESC, co.nombre;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener consejos comunales por evento
CREATE OR REPLACE FUNCTION consejos_comunales_por_evento(p_id_evento INT)
RETURNS TABLE(
    consejo_id INT,
    nombre VARCHAR,
    apellido VARCHAR,
    rif VARCHAR,
    voceria VARCHAR,
    resultado INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id_consejo as consejo_id,
        cc.nombre,
        cc.apellido,
        cc.rif,
        ecc.voceria,
        ecc.resultado
    FROM 
        Consejo_Comunal cc
    JOIN Eventocc ecc ON cc.id_cc = ecc.id_cc AND ecc.estado = TRUE
    WHERE 
        ecc.id_evento = p_id_evento
        AND cc.estado = TRUE
    ORDER BY 
        ecc.resultado DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar actividad de usuario
CREATE OR REPLACE FUNCTION registrar_actividad(
    p_id_usuario INT,
    p_accion VARCHAR,
    p_detalle TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO actividades (id_usuario, accion, detalle, fecha)
    VALUES (p_id_usuario, p_accion, p_detalle, CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;

-- Crear tabla de actividades si no existe
CREATE TABLE IF NOT EXISTS actividades (
    id_actividad SERIAL PRIMARY KEY,
    id_usuario INT,
    accion VARCHAR(100) NOT NULL,
    detalle TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Crear índice para búsqueda de actividades
CREATE INDEX idx_actividades_usuario ON actividades(id_usuario);
CREATE INDEX idx_actividades_fecha ON actividades(fecha);

-- Función para obtener actividades recientes
CREATE OR REPLACE FUNCTION obtener_actividades_recientes(p_limit INT)
RETURNS TABLE(
    id_actividad INT,
    id_usuario INT,
    usuario_nombre VARCHAR,
    accion VARCHAR,
    detalle TEXT,
    fecha TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id_actividad,
        a.id_usuario,
        u.nombre || ' ' || u.apellido as usuario_nombre,
        a.accion,
        a.detalle,
        a.fecha
    FROM 
        actividades a
    LEFT JOIN usuarios u ON a.id_usuario = u.id
    ORDER BY 
        a.fecha DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
