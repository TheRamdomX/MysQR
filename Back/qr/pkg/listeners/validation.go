package listeners

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"qr/pkg/encryption"
	"qr/pkg/verification"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
)

var (
	rdb = redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})
	ctx = context.Background()
)

type ValidationListener struct {
	db       *sql.DB
	verifier *verification.DBVerifier
}

func NewValidationListener(db *sql.DB) *ValidationListener {
	return &ValidationListener{
		db:       db,
		verifier: verification.NewDBVerifier(db),
	}
}

func (l *ValidationListener) StartValidationListener() {
	for {
		pubsub := rdb.Subscribe(ctx, "qr_validations")
		if pubsub == nil {
			log.Println("Failed to subscribe to qr_validations. Retrying...")
			time.Sleep(5 * time.Second)
			continue
		}

		log.Println("Listening for validation requests...")
		ch := pubsub.Channel()

		for msg := range ch {
			var req map[string]string
			if err := json.Unmarshal([]byte(msg.Payload), &req); err != nil {
				log.Printf("Failed to decode validation request: %v", err)
				continue
			}
			go l.handleValidation(req)
		}

		pubsub.Close()
		log.Println("Redis validation subscription lost. Reconnecting...")
	}
}

func (l *ValidationListener) handleValidation(req map[string]string) {
	uuid := req["uuid"]
	classID := req["class_id"]
	scanTimeStr := req["ScannTime"]
	studentID := req["studentId"]

	// Parse scan time
	scanTimeUnix, err := strconv.ParseInt(scanTimeStr, 10, 64)
	if err != nil {
		log.Printf("Invalid scan time: %v", err)
		return
	}
	scanTime := time.Unix(scanTimeUnix, 0)

	// Create context for database operations
	ctx := context.Background()

	// Perform pre-scan verifications
	if err := l.verifier.PreQRScanVerification(ctx, studentID, classID, scanTime); err != nil {
		log.Printf("Pre-scan verification failed: %v", err)
		return
	}

	// Validate QR code
	valid := l.validateQR(uuid, classID, scanTimeStr)
	if !valid {
		log.Printf("QR validation failed for student %s in class %s", studentID, classID)
		return
	}

	// Validate timestamp is within acceptable range
	if err := l.verifier.ValidateAttendanceTimestamp(ctx, classID, scanTime); err != nil {
		log.Printf("Timestamp validation failed: %v", err)
		return
	}

	// Record attendance
	if err := l.recordAttendance(ctx, studentID, classID, scanTime); err != nil {
		log.Printf("Failed to record attendance: %v", err)
		return
	}

	log.Printf("Successfully recorded attendance for student %s in class %s", studentID, classID)
}

func (l *ValidationListener) validateQR(uuid, classID, scanTimeStr string) bool {
	key := fmt.Sprintf("qr:%s:%s", classID, uuid)
	data, err := rdb.Get(ctx, key).Result()
	if err != nil {
		log.Printf("Redis GET failed for key %s: %v", key, err)
		return false
	}

	qrData, err := encryption.DecryptData(data)
	if err != nil {
		log.Printf("Decryption failed for key %s: %v", key, err)
		return false
	}

	scanTime, err := strconv.ParseInt(scanTimeStr, 10, 64)
	if err != nil {
		log.Printf("Invalid scan time: %v", err)
		return false
	}

	// QR code is valid if scanned within 60 seconds of generation
	valid := scanTime-qrData.Timestamp <= 60
	log.Printf("Validation result: valid=%v, key=%s", valid, key)
	return valid
}

func (l *ValidationListener) recordAttendance(ctx context.Context, studentID, classID string, scanTime time.Time) error {
	_, err := l.db.ExecContext(ctx,
		"INSERT INTO reportes_asistencia (alumno_id, seccion_id, fecha, estado) VALUES ($1, $2, $3, 'presente')",
		studentID, classID, scanTime)
	return err
}
