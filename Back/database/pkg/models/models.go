package models

import "time"

type ValidationRequest struct {
	StudentID string `json:"studentId"`
	ClassID   string `json:"classId"`
	ModuleID  string `json:"moduleId"`
	TeacherID string `json:"teacherId"`
	UUID      string `json:"uuid"`
}

type AttendanceRecord struct {
	ID            int64     `json:"id"`
	AlumnoID      string    `json:"alumno_id"`
	SeccionID     string    `json:"seccion_id"`
	ModuloID      string    `json:"modulo_id"`
	ProfesorID    string    `json:"profesor_id"`
	FechaRegistro time.Time `json:"fecha_registro"`
	ManualInd     bool      `json:"manual_ind"`
}

type ClassSection struct {
	ID           string `json:"id"`
	AsignaturaID string `json:"asignatura_id"`
	ProfesorID   string `json:"profesor_id"`
	Ubicacion    string `json:"ubicacion"`
}

type Professor struct {
	ID       int    `json:"id"`
	Rut      int    `json:"rut"`
	Nombre   string `json:"nombre"`
	Apellido string `json:"apellido"`
	Rol      int    `json:"rol"`
}

type Student struct {
	ID       int    `json:"id"`
	Rut      int    `json:"rut"`
	Nombre   string `json:"nombre"`
	Apellido string `json:"apellido"`
}

type Subject struct {
	ID     int    `json:"id"`
	Nombre string `json:"nombre"`
	Codigo string `json:"codigo"`
}

type QRGenerado struct {
	ID         int64     `json:"id"`
	ProfesorID int       `json:"profesor_id"`
	ModuloID   int       `json:"modulo_id"`
	FechaHora  time.Time `json:"fecha_hora"`
}

type ReporteAsistencia struct {
	Nombre        string    `json:"nombre"`
	FechaRegistro time.Time `json:"fecha"`
}

type SeccionAsignatura struct {
	SeccionID    int    `json:"seccion_id"`
	AsignaturaID int    `json:"asignatura_id"`
	Nombre       string `json:"nombre"`
}

// ModuloSeccion representa la combinación de un módulo actual y su sección correspondiente
type ModuloSeccion struct {
	ModuloID  int `json:"modulo_id"`
	SeccionID int `json:"seccion_id"`
}

type Asistencia struct {
	ID            int       `json:"id"`
	AlumnoID      int       `json:"alumno_id"`
	SeccionID     int       `json:"seccion_id"`
	FechaRegistro time.Time `json:"fecha_registro"`
	Estado        string    `json:"estado"`
}
