package models

// SeccionAsignatura es una sección junto al nombre y código de su asignatura.
type SeccionAsignatura struct {
	SeccionID    int    `json:"seccion_id"`
	AsignaturaID int    `json:"asignatura_id"`
	Nombre       string `json:"nombre"`
	Codigo       string `json:"codigo"`
}

// ModuloSeccion representa el módulo horario actual y la sección que se dicta en él.
type ModuloSeccion struct {
	ModuloID  int `json:"modulo_id"`
	SeccionID int `json:"seccion_id"`
}
