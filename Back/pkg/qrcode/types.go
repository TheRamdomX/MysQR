package qrcode

// Payload es el contenido de un código QR de asistencia: identifica la
// sección/módulo/profesor de la clase y un UUID único por emisión.
type Payload struct {
	UUID        string `json:"uuid"`
	SectionID   string `json:"section_id"`
	ProfessorID string `json:"professor_id"`
	ModuleID    string `json:"module_id"`
	IssuedAt    int64  `json:"issued_at"`
}
