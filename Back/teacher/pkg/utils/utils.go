package utils

import (
	"time"
)

type QRData struct {
	UUID        string    `json:"uuid"`
	ClassID     string    `json:"class_id"`
	ProfessorID string    `json:"professor_id"`
	SectionID   string    `json:"section_id"`
	ModuleID    string    `json:"module_id"`
	Timestamp   int64     `json:"timestamp"`
	CreatedAt   time.Time `json:"created_at"`
	ExpiresAt   time.Time `json:"expires_at"`
}

func NewQRData(classID, professorID, sectionID, moduleID string) QRData {
	now := time.Now()
	return QRData{
		UUID:        GenerateUUID(),
		ClassID:     classID,
		ProfessorID: professorID,
		SectionID:   sectionID,
		ModuleID:    moduleID,
		Timestamp:   now.Unix(),
		CreatedAt:   now,
		ExpiresAt:   now.Add(6000 * time.Second),
	}
}

func GenerateUUID() string {
	return time.Now().Format("20060102150405") + "-" + RandomString(8)
}

func RandomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}
