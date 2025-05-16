-- Crear tablas
CREATE TABLE IF NOT EXISTS Profesores (
    ID int  ,
    Rut int,
    Nombre varchar,
    Apellido varchar,
    Rol int
);

CREATE TABLE IF NOT EXISTS Alumnos (
    ID int  ,
    Rut int,
    Nombre varchar,
    Apellido varchar
);

CREATE TABLE IF NOT EXISTS Asignaturas (
    ID int  ,
    Nombre varchar,
    Codigo varchar
);

CREATE TABLE IF NOT EXISTS Secciones (
    ID int  ,
    AsignaturaID int,
    ProfesorID int,
    Ubicacion varchar
);

CREATE TABLE IF NOT EXISTS Modulos (
    ID int  ,
    Fecha date,
    HoraInicio time,
    HoraFin time
);

CREATE TABLE IF NOT EXISTS ProgramacionClases (
    ID int  ,
    SeccionID int,
    ModuloID int,
    TipoSesion int
);

CREATE TABLE IF NOT EXISTS Inscripciones (
    ID int  ,
    AlumnoID int,
    SeccionID int
);

CREATE TABLE IF NOT EXISTS Asistencia (
    ID int  ,
    AlumnoID int,
    SeccionID int,
    ModuloID int,
    ProfesorID int,
    FechaRegistro timestamp,
    ManualInd boolean
);

CREATE TABLE IF NOT EXISTS ReporteAsistencia (
    ID int  ,
    AlumnoID int,
    SeccionID int,
    ModuloID int,
    FechaRegistro timestamp,
    Estado varchar
);

CREATE TABLE IF NOT EXISTS QRGenerado (
    ID int  ,
    ProfesorID int,
    ModuloID int,
    FechaRegistro timestamp,
    MAC varchar
);

CREATE TABLE IF NOT EXISTS LogIn (
    ID int  ,
    Rol varchar,
    FechaRegistro timestamp,
    Rut int,
    MAC varchar
);

CREATE TABLE IF NOT EXISTS AUTH (
    ID int  ,
    "Username" varchar,
    Password varchar,
    Rol varchar,
    Rut int
);

CREATE TABLE IF NOT EXISTS MACs (
    ID int  ,
    AlumnoID int,
    FechaRegistro timestamp,
    MAC varchar
);



-- Datos coherentes
-- Insertar profesores
INSERT INTO Profesores (ID, Rut, Nombre, Apellido, Rol) VALUES
(1, 12345678, 'Juan', 'Pérez', 1),
(2, 23456789, 'María', 'González', 1),
(3, 34567890, 'Carlos', 'Rodríguez', 1);

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
(2, 1, 2, 'Sala 102'),
(3, 2, 1, 'Sala 201'),
(4, 3, 3, 'Sala 301');

-- Insertar módulos
INSERT INTO Modulos (ID, Fecha, HoraInicio, HoraFin) VALUES
(1, CURRENT_DATE, '08:30', '10:00'),
(2, CURRENT_DATE, '10:15', '11:45'),
(3, CURRENT_DATE, '12:00', '13:30'),
(4, CURRENT_DATE + 1, '08:30', '10:00'),
(5, CURRENT_DATE + 1, '10:15', '11:45');

-- Insertar programación de clases
INSERT INTO ProgramacionClases (ID, SeccionID, ModuloID, TipoSesion) VALUES
(1, 1, 1, 1),
(2, 1, 2, 1),
(3, 2, 3, 1),
(4, 3, 4, 1),
(5, 4, 5, 1);

-- Insertar inscripciones de alumnos en secciones
INSERT INTO Inscripciones (ID, AlumnoID, SeccionID) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 2),
(4, 4, 3),
(5, 5, 4);

-- Insertar registros de asistencia
INSERT INTO Asistencia (ID, AlumnoID, SeccionID, ModuloID, ProfesorID, FechaRegistro, ManualInd) VALUES
(1, 1, 1, 1, 1, CURRENT_TIMESTAMP, false),
(2, 2, 1, 1, 1, CURRENT_TIMESTAMP, false),
(3, 3, 2, 3, 2, CURRENT_TIMESTAMP, false);

-- Insertar reportes de asistencia
INSERT INTO ReporteAsistencia (ID, AlumnoID, SeccionID, ModuloID, FechaRegistro, Estado) VALUES
(1, 1, 1, 1, CURRENT_TIMESTAMP, 'Presente'),
(2, 2, 1, 1, CURRENT_TIMESTAMP, 'Presente'),
(3, 3, 2, 3, CURRENT_TIMESTAMP, 'Presente');

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
INSERT INTO AUTH (ID, "Username", Password, Rol, Rut) VALUES
(1, 'jperez', 'hash_password_1', 'profesor', 12345678),
(2, 'mgonzalez', 'hash_password_2', 'profesor', 23456789),
(3, 'crodriguez', 'hash_password_3', 'profesor', 34567890),
(4, 'amartinez', 'hash_password_4', 'alumno', 11111111),
(5, 'psanchez', 'hash_password_5', 'alumno', 22222222);

-- Insertar direcciones MAC de alumnos
INSERT INTO MACs (ID, AlumnoID, FechaRegistro, MAC) VALUES
(1, 1, CURRENT_TIMESTAMP, '00:1B:44:11:3A:B7'),
(2, 2, CURRENT_TIMESTAMP, '00:0D:3C:04:78:5B'),
(3, 3, CURRENT_TIMESTAMP, '00:1C:B3:08:76:21');

CREATE TABLE asistencia_1 PARTITION OF asistencia
FOR VALUES IN (1);

CREATE TABLE asistencia_2 PARTITION OF asistencia
FOR VALUES IN (2);

CREATE TABLE asistencia_3 PARTITION OF asistencia
FOR VALUES IN (3);

CREATE TABLE asistencia_4 PARTITION OF asistencia
FOR VALUES IN (4);