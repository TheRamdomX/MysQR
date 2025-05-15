package verification

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

var (
	ErrTeacherNotFound     = errors.New("teacher not found or inactive")
	ErrClassNotFound       = errors.New("class section not found or inactive")
	ErrModuleNotFound      = errors.New("module not found or invalid")
	ErrActiveQRExists      = errors.New("active QR already exists for this class")
	ErrQRExpired          = errors.New("QR code has expired")
	ErrStudentNotFound     = errors.New("student not found or inactive")
	ErrStudentNotEnrolled  = errors.New("student is not enrolled in this class")
	ErrAttendanceExists    = errors.New("attendance already registered for this session")
	ErrInvalidTimestamp    = errors.New("timestamp is outside acceptable range")
)

type DBVerifier struct {
	db *sql.DB
}

func NewDBVerifier(db *sql.DB) *DBVerifier {
	return &DBVerifier{db: db}
}

// PreQRGenerationVerification verifies all conditions before generating a QR code
func (v *DBVerifier) PreQRGenerationVerification(ctx context.Context, teacherID, classID, moduleID string) error {
	// Verify teacher exists and is active
	var exists bool
	err := v.db.QueryRowContext(ctx, 
		"SELECT EXISTS(SELECT 1 FROM profesores WHERE id = $1 AND activo = true)",
		teacherID).Scan(&exists)
	if err != nil || !exists {
		return ErrTeacherNotFound
	}

	// Verify class section exists and is active
	err = v.db.QueryRowContext(ctx,
		"SELECT EXISTS(SELECT 1 FROM secciones_asignatura WHERE seccion_id = $1 AND activo = true)",
		classID).Scan(&exists)
	if err != nil || !exists {
		return ErrClassNotFound
	}

	// Verify module exists
	err = v.db.QueryRowContext(ctx,
		"SELECT EXISTS(SELECT 1 FROM modulos WHERE id = $1)",
		moduleID).Scan(&exists)
	if err != nil || !exists {
		return ErrModuleNotFound
	}

	// Check for active QR
	var activeQRCount int
	err = v.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM qr_generados WHERE profesor_id = $1 AND modulo_id = $2 AND fecha_hora > NOW() - INTERVAL '1 minute'",
		teacherID, moduleID).Scan(&activeQRCount)
	if err != nil {
		return err
	}
	if activeQRCount > 0 {
		return ErrActiveQRExists
	}

	return nil
}

// PreQRScanVerification verifies all conditions before processing a QR scan
func (v *DBVerifier) PreQRScanVerification(ctx context.Context, studentID, classID string, scanTime time.Time) error {
	// Verify student exists and is active
	var exists bool
	err := v.db.QueryRowContext(ctx,
		"SELECT EXISTS(SELECT 1 FROM alumnos WHERE id = $1 AND activo = true)",
		studentID).Scan(&exists)
	if err != nil || !exists {
		return ErrStudentNotFound
	}

	// Verify student is enrolled in the class
	err = v.db.QueryRowContext(ctx,
		"SELECT EXISTS(SELECT 1 FROM alumnos_secciones WHERE alumno_id = $1 AND seccion_id = $2)",
		studentID, classID).Scan(&exists)
	if err != nil || !exists {
		return ErrStudentNotEnrolled
	}

	// Check if attendance already exists for this session
	var attendanceCount int
	err = v.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM reportes_asistencia WHERE alumno_id = $1 AND seccion_id = $2 AND fecha::date = $3::date",
		studentID, classID, scanTime).Scan(&attendanceCount)
	if err != nil {
		return err
	}
	if attendanceCount > 0 {
		return ErrAttendanceExists
	}

	return nil
}

// ValidateAttendanceTimestamp checks if the attendance timestamp is within acceptable range
func (v *DBVerifier) ValidateAttendanceTimestamp(ctx context.Context, classID string, scanTime time.Time) error {
	// Get class schedule
	var startTime, endTime time.Time
	err := v.db.QueryRowContext(ctx,
		"SELECT hora_inicio, hora_fin FROM secciones_asignatura WHERE seccion_id = $1",
		classID).Scan(&startTime, &endTime)
	if err != nil {
		return err
	}

	// Allow attendance within 15 minutes before class starts and until class ends
	validStart := scanTime.After(startTime.Add(-15 * time.Minute))
	validEnd := scanTime.Before(endTime)

	if !validStart || !validEnd {
		return ErrInvalidTimestamp
	}

	return nil
} 