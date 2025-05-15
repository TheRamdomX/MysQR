CREATE EXTENSION IF NOT EXISTS pg_prewarm;
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE DATABASE IF NOT EXISTS asistencia_db;

\c asistencia_db

CREATE EXTENSION IF NOT EXISTS pg_prewarm;
CREATE EXTENSION IF NOT EXISTS pg_cron;

ALTER SYSTEM SET shared_preload_libraries = 'pg_cron';
SELECT pg_reload_conf();

CREATE TABLE IF NOT EXISTS Profesores (
  ID int PRIMARY KEY,
  Rut int UNIQUE,
  Nombre varchar,
  Apellido varchar,
  Rol int
);

CREATE TABLE IF NOT EXISTS Alumnos (
  ID int PRIMARY KEY,
  Rut int UNIQUE,
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
  ID bigserial PRIMARY KEY,
  AlumnoID int NOT NULL,
  SeccionID int NOT NULL,
  ModuloID int NOT NULL,
  ProfesorID int NOT NULL,
  FechaRegistro timestamp NOT NULL,
  ManualInd int NOT NULL
) PARTITION BY RANGE (SeccionID);

CREATE TABLE IF NOT EXISTS ReporteAsistencia (
  ID bigserial PRIMARY KEY,
  AlumnoID int NOT NULL,
  SeccionID int NOT NULL,
  ModuloID int NOT NULL,
  EstadoSesion varchar
) PARTITION BY RANGE (SeccionID);

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

CREATE TABLE IF NOT EXISTS AUTH (
  ID int PRIMARY KEY,
  User varchar,
  Password varchar, -- GUARDAR CON HASH
  Rol varchar,
  Rut int 
);

CREATE TABLE IF NOT EXISTS MACs (
  ID int PRIMARY KEY,
  AlumnoID int,
  FechaRegistro timestamp,
  MAC varchar
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
ALTER TABLE Asistencia ADD FOREIGN KEY (ProfesorID) REFERENCES Profesores(ID);
ALTER TABLE QRGenerado ADD FOREIGN KEY (ProfesorID) REFERENCES Profesores(ID);
ALTER TABLE QRGenerado ADD FOREIGN KEY (ModuloID) REFERENCES Modulos(ID);
ALTER TABLE ReporteAsistencia ADD FOREIGN KEY (AlumnoID) REFERENCES Alumnos(ID);
ALTER TABLE ReporteAsistencia ADD FOREIGN KEY (SeccionID) REFERENCES Secciones(ID);
ALTER TABLE ReporteAsistencia ADD FOREIGN KEY (ModuloID) REFERENCES Modulos(ID);
ALTER TABLE MACs ADD FOREIGN KEY (AlumnoID) REFERENCES Alumnos(ID);

-- Insertar datos?
-- yo caxo que desde aca nomas

DO $$
DECLARE
  nombres_prof TEXT[] := ARRAY[
    'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Isabel', 'Diego', 'Laura'
  ];
  apellidos_prof TEXT[] := ARRAY[
    'García', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'González', 'Muñoz', 'Flores', 'Díaz'
  ];
  nombres_alum TEXT[] := ARRAY[
    'Alejandro', 'Valentina', 'Sebastián', 'Camila', 'Matías', 'Francisca', 'Luciano', 'Antonella', 'Ignacio', 'Mariana'
  ];
  asignaturas_nombres TEXT[] := ARRAY[
    'A', 'B', 'C', 'D', 'E'
  ];
  ubicaciones TEXT[] := ARRAY[
    '101', '102', '103', '104', '105', '201', '202', '203', '204', '205'
  ];
  modulos_fechas DATE[] := ARRAY[
    '2023-04-01', '2023-04-03', '2023-04-05', '2023-04-08', '2023-04-10',
    '2023-04-12', '2023-04-15', '2023-04-17', '2023-04-19', '2023-04-22',
    '2023-04-24', '2023-04-26', '2023-04-29', '2023-05-01', '2023-05-03'
  ];
  codigos_mac TEXT[] := ARRAY[
    '00:1B:44:11:3A:B7', '00:0D:3C:04:78:5B', '00:1C:B3:08:76:21', '00:19:E3:CA:44:55',
    '00:1F:C2:09:78:AB', '00:1A:2B:3C:4D:5E', '00:11:22:33:44:55', '64:00:6A:42:59:5D',
    '00:1E:4F:55:66:77', '00:1D:3C:44:55:66', '00:1C:B3:08:76:22', '00:19:E3:CA:44:56'
  ];

  BEGIN
  -- Insert Profesores (10)
  FOR i IN 1..10 LOOP
    INSERT INTO Profesores (ID, Rut, Nombre, Apellido, Rol)
    VALUES (i, 10000000 + i*10, nombres_prof[i], apellidos_prof[i], 1);
  END LOOP;

  -- Insert Alumnos (10)
  FOR i IN 1..10 LOOP
    INSERT INTO Alumnos (ID, Rut, Nombre, Apellido)
    VALUES (i, 20000000 + i*10, nombres_alum[i], apellidos_prof[i]);
  END LOOP;

  -- Insert Asignaturas (5)
  FOR i IN 1..5 LOOP
    INSERT INTO Asignaturas (ID, Nombre, Codigo)
    VALUES (i, asignaturas_nombres[i], 'ASIG-' || LPAD(i::TEXT, 3, '0'));
  END LOOP;

  -- Insert Modulos (15)
  FOR i IN 1..15 LOOP
    INSERT INTO Modulos (ID, Fecha, HoraInicio, HoraFin)
    VALUES (i, modulos_fechas[i], 
      ('08:00'::TIME + (i*2 || ' hours')::INTERVAL),
      ('10:00'::TIME + (i*2 || ' hours')::INTERVAL));
  END LOOP;

  -- Insert ProgramacionClases (~40 entries)
  FOR s IN 1..20 LOOP
    FOR m IN 1..2 LOOP
      INSERT INTO ProgramacionClases (ID, SeccionID, ModuloID, TipoSesion)
      VALUES ((s-1)*2 + m, s, ((s + m -1)%15)+1, (random()*3)::INT);
    END LOOP;
  END LOOP;

  -- Insert Inscripciones (~50 entries)
  FOR a IN 1..10 LOOP
    FOR s IN 1..5 LOOP
      INSERT INTO Inscripciones (ID, AlumnoID, SeccionID)
      VALUES ((a-1)*5 + s, a, ((a + s -1)%20)+1);
    END LOOP;
  END LOOP;

  -- Insert Asistencia (~100 entries)
  FOR i IN 1..100 LOOP
    INSERT INTO Asistencia (AlumnoID, SeccionID, ModuloID, ProfesorID, FechaRegistro, ManualInd)
    VALUES (
      ((i-1)%10)+1,
      ((i-1)%20)+1,
      ((i-1)%15)+1,
      ((i-1)%10)+1,
      NOW() - (random()* INTERVAL '7 days'),
      (random() > 0.5)::INT
    );
  END LOOP;

  -- Insert MACs (~20 entries)
  FOR i IN 1..10 LOOP
    INSERT INTO MACs (ID, AlumnoID, FechaRegistro, MAC)
    VALUES (i*2-1, i, NOW() - INTERVAL '1 month', codigos_mac[i]),
           (i*2, i, NOW() - INTERVAL '2 weeks', codigos_mac[i+2]);
  END LOOP;