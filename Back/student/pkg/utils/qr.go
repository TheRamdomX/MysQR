package utils

import "time"

// QRData representa la estructura de datos del código QR
type QRData struct {
	UUID        string    `json:"uuid"`
	ClassID     string    `json:"class_id"`
	ProfessorID string    `json:"professor_id"`
	SectionID   string    `json:"section_id"`
	ModuleID    string    `json:"module_id"`
	Timestamp   time.Time `json:"timestamp"`
	CreatedAt   time.Time `json:"created_at"`
	ExpiresAt   time.Time `json:"expires_at"`
}
