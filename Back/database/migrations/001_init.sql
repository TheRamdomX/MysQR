CREATE TABLE IF NOT EXISTS Profesores (
  ID int PRIMARY KEY,
  Rut int,
  Nombre varchar,
  Apellido varchar,
  Rol int
);

CREATE TABLE IF NOT EXISTS Alumnos (
  ID int PRIMARY KEY,
  Rut int,
  Nombre varchar,
  Apellido varchar
);

CREATE TABLE IF NOT EXISTS Asignaturas (
  ID int PRIMARY KEY,
  Nombre varchar,
  Codigo varchar
);

CREATE TABLE IF NOT EXISTS Secciones (
  ID int PRIMARY KEY,
  AsignaturaID int,
  ProfesorID int,
  Ubicacion varchar
);

CREATE TABLE IF NOT EXISTS Modulos (
  ID int PRIMARY KEY,
  Fecha date,
  HoraInicio time,
  HoraFin time
);

CREATE TABLE IF NOT EXISTS ProgramacionClases (
  ID int PRIMARY KEY,
  SeccionID int,
  ModuloID int,
  TipoSesion int
);

CREATE TABLE IF NOT EXISTS Inscripciones (
  ID int PRIMARY KEY,
  AlumnoID int,
  SeccionID int
);

CREATE TABLE IF NOT EXISTS Asistencia (
  ID bigserial,
  AlumnoID int NOT NULL,
  SeccionID int NOT NULL,
  ModuloID int NOT NULL,
  FechaRegistro timestamp NOT NULL,
  ManualInd int NOT NULL,
  PRIMARY KEY (ID, SeccionID)
) PARTITION BY LIST (SeccionID);

CREATE TABLE IF NOT EXISTS ReporteAsistencia (
  ID bigserial,
  AlumnoID int NOT NULL,
  SeccionID int NOT NULL,
  ModuloID int NOT NULL,
  EstadoSesion varchar,
  PRIMARY KEY (ID, SeccionID)
) PARTITION BY LIST (SeccionID);

CREATE TABLE IF NOT EXISTS QRGenerado (
  ID int PRIMARY KEY,
  ProfesorID int,
  ModuloID int,
  FechaRegistro timestamp,
  MAC varchar
);

CREATE TABLE IF NOT EXISTS LogIn (
  ID int PRIMARY KEY,
  Rol varchar,
  FechaRegistro timestamp,
  Rut int,
  MAC varchar
);

CREATE TABLE IF NOT EXISTS MACs (
  ID int PRIMARY KEY,
  AlumnoID int,
  FechaRegistro timestamp,
  MAC varchar
);

CREATE TABLE IF NOT EXISTS AUTH (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    ProfesorID int REFERENCES Profesores(ID),
    AlumnoID int REFERENCES Alumnos(ID),
    Rut int NOT NULL,
    CONSTRAINT check_rol_id CHECK (
        (rol = 'profesor' AND ProfesorID IS NOT NULL AND AlumnoID IS NULL) OR
        (rol = 'alumno' AND AlumnoID IS NOT NULL AND ProfesorID IS NULL)
    )
);

ALTER TABLE Secciones ADD FOREIGN KEY (AsignaturaID) REFERENCES Asignaturas(ID);
ALTER TABLE Secciones ADD FOREIGN KEY (ProfesorID) REFERENCES Profesores(ID);
ALTER TABLE ProgramacionClases ADD FOREIGN KEY (SeccionID) REFERENCES Secciones(ID);
ALTER TABLE ProgramacionClases ADD FOREIGN KEY (ModuloID) REFERENCES Modulos(ID);
ALTER TABLE Inscripciones ADD FOREIGN KEY (AlumnoID) REFERENCES Alumnos(ID);
ALTER TABLE Inscripciones ADD FOREIGN KEY (SeccionID) REFERENCES Secciones(ID);
ALTER TABLE Asistencia ADD FOREIGN KEY (AlumnoID) REFERENCES Alumnos(ID);
ALTER TABLE Asistencia ADD FOREIGN KEY (SeccionID) REFERENCES Secciones(ID);
ALTER TABLE Asistencia ADD FOREIGN KEY (ModuloID) REFERENCES Modulos(ID);
ALTER TABLE QRGenerado ADD FOREIGN KEY (ProfesorID) REFERENCES Profesores(ID);
ALTER TABLE QRGenerado ADD FOREIGN KEY (ModuloID) REFERENCES Modulos(ID);
ALTER TABLE ReporteAsistencia ADD FOREIGN KEY (AlumnoID) REFERENCES Alumnos(ID);
ALTER TABLE ReporteAsistencia ADD FOREIGN KEY (SeccionID) REFERENCES Secciones(ID);
ALTER TABLE ReporteAsistencia ADD FOREIGN KEY (ModuloID) REFERENCES Modulos(ID);
ALTER TABLE MACs ADD FOREIGN KEY (AlumnoID) REFERENCES Alumnos(ID);

-- Insertar datos


-- Insertar profesores
INSERT INTO Profesores (ID, Rut, Nombre, Apellido, Rol) VALUES
(1, 11111111, 'Juan', 'Pérez', 1),
(2, 22222222, 'María', 'González', 1),
(3, 33333333, 'Carlos', 'Rodríguez', 1);

-- Insertar alumnos
INSERT INTO Alumnos (ID, Rut, Nombre, Apellido) VALUES
(1, 11111111, 'Ana', 'Martínez'),
(2, 22222222, 'Pedro', 'Sánchez'),
(3, 33333333, 'Laura', 'López'),
(4, 44444444, 'Diego', 'Ramírez'),
(5, 55555555, 'Camila', 'Torres');

-- Insertar asignaturas
INSERT INTO Asignaturas (ID, Nombre, Codigo) VALUES
(1, 'Programación I', 'PROG101'),
(2, 'Bases de Datos', 'BD101'),
(3, 'Redes', 'RED101');

-- Insertar secciones (relacionan asignaturas y profesores)
INSERT INTO Secciones (ID, AsignaturaID, ProfesorID, Ubicacion) VALUES
(1, 1, 1, 'Sala 101'),
(2, 2, 2, 'Sala 102'),
(3, 3, 3, 'Sala 201');


-- Insertar módulos
INSERT INTO Modulos (ID, Fecha, HoraInicio, HoraFin) VALUES
(1, CURRENT_DATE - 1, '08:30', '10:00'),
(2, CURRENT_DATE - 1, '10:00', '11:30'),
(3, CURRENT_DATE - 1, '11:30', '13:00'),
(4, CURRENT_DATE - 1, '13:00', '14:30'),
(5, CURRENT_DATE - 1, '14:30', '16:00'),
(6, CURRENT_DATE - 1, '16:00', '17:30'),
(7, CURRENT_DATE - 1, '17:30', '19:00'),
(8, CURRENT_DATE , '08:30', '10:00'),
(9, CURRENT_DATE , '10:00', '11:30'),
(10, CURRENT_DATE , '11:30', '13:00'),
(11, CURRENT_DATE , '13:00', '14:30'),
(12, CURRENT_DATE , '14:30', '16:00'),
(13, CURRENT_DATE , '16:00', '17:30'),
(14, CURRENT_DATE , '17:30', '19:00'),
(15, CURRENT_DATE + 1, '08:30', '10:00'),
(16, CURRENT_DATE + 1, '10:00', '11:30'),
(17, CURRENT_DATE + 1, '11:30', '13:00'),
(18, CURRENT_DATE + 1, '13:00', '14:30'),
(19, CURRENT_DATE + 1, '14:30', '16:00'),
(20, CURRENT_DATE + 1, '16:00', '17:30'),
(21, CURRENT_DATE + 1, '17:30', '19:00'),
(22, CURRENT_DATE - 2, '08:30', '10:00'),
(23, CURRENT_DATE - 2, '10:00', '11:30'),
(24, CURRENT_DATE - 2, '11:30', '13:00'),
(25, CURRENT_DATE - 2, '13:00', '14:30'),
(26, CURRENT_DATE - 2, '14:30', '16:00'),
(27, CURRENT_DATE - 2, '16:00', '17:30'),
(28, CURRENT_DATE - 2, '17:30', '19:00');

-- Insertar programación de clases
INSERT INTO ProgramacionClases (ID, SeccionID, ModuloID, TipoSesion) VALUES
(1, 1, 1, 1),
(2, 1, 2, 1),
(3, 1, 3, 1),
(4, 1, 4, 1),
(5, 2, 5, 1),
(6, 2, 6, 1),
(7, 2, 7, 1),
(8, 2, 8, 1),
(9, 3, 9, 1),
(10, 3, 10, 1),
(11, 3, 11, 1),
(12, 3, 12, 1);

-- Insertar inscripciones de alumnos en secciones
INSERT INTO Inscripciones (ID, AlumnoID, SeccionID) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 1),
(4, 4, 1),
(5, 5, 1),
(6, 1, 2),
(7, 2, 2),
(8, 3, 2),
(9, 4, 2),
(10, 5, 2),
(11, 1, 3),
(12, 2, 3),
(13, 3, 3),
(14, 4, 3),
(15, 5, 3);

CREATE TABLE asistencia_1 PARTITION OF asistencia
FOR VALUES IN (1);

CREATE TABLE asistencia_2 PARTITION OF asistencia
FOR VALUES IN (2);

CREATE TABLE asistencia_3 PARTITION OF asistencia
FOR VALUES IN (3);

CREATE TABLE asistencia_4 PARTITION OF asistencia
FOR VALUES IN (4);

CREATE TABLE asistencia_5 PARTITION OF asistencia
FOR VALUES IN (5);

CREATE TABLE reporte_asistencia_1 PARTITION OF ReporteAsistencia
FOR VALUES IN (1);

CREATE TABLE reporte_asistencia_2 PARTITION OF ReporteAsistencia
FOR VALUES IN (2);

CREATE TABLE reporte_asistencia_3 PARTITION OF ReporteAsistencia
FOR VALUES IN (3);

CREATE TABLE reporte_asistencia_4 PARTITION OF ReporteAsistencia
FOR VALUES IN (4);

CREATE TABLE reporte_asistencia_5 PARTITION OF ReporteAsistencia
FOR VALUES IN (5);

-- Insertar registros de asistencia
INSERT INTO Asistencia (ID, AlumnoID, SeccionID, ModuloID, FechaRegistro, ManualInd) VALUES
(1, 1, 1, 1, CURRENT_TIMESTAMP, 0),
(2, 2, 1, 1, CURRENT_TIMESTAMP, 0),
(3, 3, 3, 2, CURRENT_TIMESTAMP, 0);

-- Insertar reportes de asistencia
INSERT INTO ReporteAsistencia (ID, AlumnoID, SeccionID, ModuloID, EstadoSesion) VALUES
(1, 1, 1, 1, 'Presente'),
(2, 1, 1, 1, 'Presente'),
(3, 1, 1, 3, 'Presente');

-- Insertar registros de QR generados por profesores
INSERT INTO QRGenerado (ID, ProfesorID, ModuloID, FechaRegistro, MAC) VALUES
(1, 1, 1, CURRENT_TIMESTAMP, '00:1B:44:11:3A:B7'),
(2, 2, 3, CURRENT_TIMESTAMP, '00:0D:3C:04:78:5B'),
(3, 3, 5, CURRENT_TIMESTAMP, '00:1C:B3:08:76:21');

-- Insertar registros de login
INSERT INTO LogIn (ID, Rol, FechaRegistro, Rut, MAC) VALUES
(1, 'profesor', CURRENT_TIMESTAMP, 12345678, '00:1B:44:11:3A:B7'),
(2, 'alumno', CURRENT_TIMESTAMP, 11111111, '00:0D:3C:04:78:5B');

-- Insertar usuarios en AUTH
INSERT INTO AUTH (username, password_hash, rol, ProfesorID, AlumnoID, Rut)
VALUES ('profesor1', 'password', 'profesor', 1, NULL, 11111111),
       ('profesor2', 'password', 'profesor', 2, NULL, 22222222),
       ('alumno1', 'password', 'alumno', NULL, 1, 33333333),
       ('alumno2', 'password', 'alumno', NULL, 2, 44444444);

-- Insertar direcciones MAC de alumnos
INSERT INTO MACs (ID, AlumnoID, FechaRegistro, MAC) VALUES
(1, 1, CURRENT_TIMESTAMP, '00:1B:44:11:3A:B7'),
(2, 2, CURRENT_TIMESTAMP, '00:0D:3C:04:78:5B'),
(3, 3, CURRENT_TIMESTAMP, '00:1C:B3:08:76:21');




CREATE OR REPLACE FUNCTION obtener_asistencia_por_seccion(seccion_id_input INT)
RETURNS JSONB AS $$
DECLARE
    reporte JSONB;
BEGIN

    -- paso 0: borrar registros de ReporteAsistencia para la seccion
    DELETE FROM ReporteAsistencia WHERE SeccionID = seccion_id_input;

    -- Paso 1: Insertar en ReporteAsistencia las sesiones programadas
    INSERT INTO ReporteAsistencia (AlumnoID, SeccionID, ModuloID, EstadoSesion)
    SELECT 
        i.AlumnoID,
        seccion_id_input,
        pc.ModuloID,
        'ausente'
    FROM Inscripciones i
    JOIN ProgramacionClases pc ON pc.SeccionID = seccion_id_input
    LEFT JOIN ReporteAsistencia ra ON ra.AlumnoID = i.AlumnoID 
                                    AND ra.ModuloID = pc.ModuloID 
                                    AND ra.SeccionID = seccion_id_input
    WHERE i.SeccionID = seccion_id_input
      AND ra.ID IS NULL;

    -- Paso 2: Actualizar registros existentes en ReporteAsistencia según Asistencia real
    UPDATE ReporteAsistencia ra
    SET EstadoSesion = 'presente'
    FROM Asistencia a
    WHERE ra.AlumnoID = a.AlumnoID
      AND ra.SeccionID = a.SeccionID
      AND ra.ModuloID = a.ModuloID
      AND ra.SeccionID = seccion_id_input;

    -- Paso 3: Generar el JSON final agrupado
    SELECT jsonb_agg(estudiante_data) INTO reporte
    FROM (
        SELECT 
            a.Nombre || ' ' || a.Apellido AS estudiante,
            jsonb_object_agg(to_char(m.Fecha, 'MM-DD'), 
                             CASE 
                                 WHEN ra.EstadoSesion ILIKE 'presente' THEN '🟢'
                                 ELSE '🔴'
                             END ORDER BY m.Fecha) AS asistencia
        FROM ReporteAsistencia ra
        JOIN Alumnos a ON a.ID = ra.AlumnoID
        JOIN Modulos m ON m.ID = ra.ModuloID
        WHERE ra.SeccionID = seccion_id_input
        GROUP BY a.ID
        ORDER BY a.Nombre, a.Apellido
    ) AS estudiante_data;

    RETURN reporte;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION obtener_asistencia_estudiante_seccion(seccion_id_input INT, alumno_id_input INT)
RETURNS JSONB AS $$
DECLARE
    reporte JSONB;
    estudiante_existe BOOLEAN;
    seccion_existe BOOLEAN;
BEGIN
    -- Verificar que el estudiante existe
    SELECT EXISTS(SELECT 1 FROM Alumnos WHERE ID = alumno_id_input) INTO estudiante_existe;
    IF NOT estudiante_existe THEN
        RAISE EXCEPTION 'El estudiante con ID % no existe', alumno_id_input;
    END IF;

    -- Verificar que la sección existe
    SELECT EXISTS(SELECT 1 FROM Secciones WHERE ID = seccion_id_input) INTO seccion_existe;
    IF NOT seccion_existe THEN
        RAISE EXCEPTION 'La sección con ID % no existe', seccion_id_input;
    END IF;

    -- paso 0: borrar registros de ReporteAsistencia para la seccion y alumno
    DELETE FROM ReporteAsistencia 
    WHERE SeccionID = seccion_id_input 
    AND AlumnoID = alumno_id_input;

    -- Paso 1: Insertar en ReporteAsistencia las sesiones programadas
    INSERT INTO ReporteAsistencia (AlumnoID, SeccionID, ModuloID, EstadoSesion)
    SELECT 
        alumno_id_input,
        seccion_id_input,
        pc.ModuloID,
        'ausente'
    FROM ProgramacionClases pc
    LEFT JOIN ReporteAsistencia ra ON ra.AlumnoID = alumno_id_input 
                                    AND ra.ModuloID = pc.ModuloID 
                                    AND ra.SeccionID = seccion_id_input
    WHERE pc.SeccionID = seccion_id_input
      AND ra.ID IS NULL;

    -- Paso 2: Actualizar registros existentes en ReporteAsistencia según Asistencia real
    UPDATE ReporteAsistencia ra
    SET EstadoSesion = 'presente'
    FROM Asistencia a
    WHERE ra.AlumnoID = a.AlumnoID
      AND ra.SeccionID = a.SeccionID
      AND ra.ModuloID = a.ModuloID
      AND ra.SeccionID = seccion_id_input
      AND ra.AlumnoID = alumno_id_input;

    -- Paso 3: Generar el JSON final
    SELECT jsonb_build_object(
        'estudiante', a.Nombre || ' ' || a.Apellido,
        'asistencia', COALESCE(
            jsonb_object_agg(
                to_char(m.Fecha, 'MM-DD'), 
                CASE 
                    WHEN ra.EstadoSesion ILIKE 'presente' THEN '🟢'
                    ELSE '🔴'
                END
                ORDER BY m.Fecha
            ),
            '{}'::jsonb
        )
    ) INTO reporte
    FROM ReporteAsistencia ra
    JOIN Alumnos a ON a.ID = ra.AlumnoID
    JOIN Modulos m ON m.ID = ra.ModuloID
    WHERE ra.SeccionID = seccion_id_input
    AND ra.AlumnoID = alumno_id_input
    GROUP BY a.ID, a.Nombre, a.Apellido;

    -- Si no hay datos, devolver un objeto con asistencia vacía
    IF reporte IS NULL THEN
        SELECT jsonb_build_object(
            'estudiante', (SELECT Nombre || ' ' || Apellido FROM Alumnos WHERE ID = alumno_id_input),
            'asistencia', '{}'::jsonb
        ) INTO reporte;
    END IF;

    RETURN reporte;
END;
$$ LANGUAGE plpgsql;