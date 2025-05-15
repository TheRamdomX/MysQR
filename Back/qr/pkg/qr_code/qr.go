package qr_code

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"qr/pkg/encryption"
	"qr/pkg/storage"
	"qr/pkg/utils"
	"qr/pkg/verification"
	"sync"
	"time"

	"github.com/yeqown/go-qrcode/v2"
	"github.com/yeqown/go-qrcode/writer/standard"
)

var QRData = utils.QRData{}
var activeClasses = sync.Map{}

type QRGenerator struct {
	db        *sql.DB
	verifier  *verification.DBVerifier
}

func NewQRGenerator(db *sql.DB) *QRGenerator {
	return &QRGenerator{
		db:       db,
		verifier: verification.NewDBVerifier(db),
	}
}

func (g *QRGenerator) StartQRGeneration(ctx context.Context, classID, teacherID, moduleID string) error {
	if _, exists := activeClasses.Load(classID); exists {
		return fmt.Errorf("QR generation already active for class: %s", classID)
	}

	// Perform pre-generation verifications
	if err := g.verifier.PreQRGenerationVerification(ctx, teacherID, classID, moduleID); err != nil {
		return fmt.Errorf("pre-generation verification failed: %w", err)
	}

	stopChan := make(chan struct{})
	activeClasses.Store(classID, stopChan)

	go func() {
		log.Printf("QR generation started for class: %s", classID)
		ticker := time.NewTicker(1000 * time.Second) //reset of the qr code
		defer ticker.Stop()

		g.generateQRForClass(ctx, classID, teacherID, moduleID)

		for {
			select {
			case <-ticker.C:
				if err := g.verifier.PreQRGenerationVerification(ctx, teacherID, classID, moduleID); err != nil {
					log.Printf("Verification failed for class %s: %v", classID, err)
					continue
				}
				g.generateQRForClass(ctx, classID, teacherID, moduleID)
			case <-stopChan:
				activeClasses.Delete(classID)
				log.Printf("QR generation stopped for class: %s", classID)
				return
			}
		}
	}()

	return nil
}

func (g *QRGenerator) StopQRGeneration(classID string) {
	if val, exists := activeClasses.Load(classID); exists {
		close(val.(chan struct{}))
	}
}

func (g *QRGenerator) generateQRForClass(ctx context.Context, classID, teacherID, moduleID string) {
	qrData := utils.QRData{
		Timestamp: time.Now().Unix(),
		TeacherID: teacherID,
		ClassID:   classID,
		UUID:      utils.GenerateUUID(),
	}

	encrypted, err := encryption.EncryptData(qrData)
	if err != nil {
		log.Printf("Encryption error: %v", err)
		return
	}

	if err := storage.StoreInRedis(qrData); err != nil {
		log.Printf("Redis error: %v", err)
	}

	// Store QR generation record in database
	_, err = g.db.ExecContext(ctx,
		"INSERT INTO qr_generados (profesor_id, modulo_id, fecha_hora) VALUES ($1, $2, NOW())",
		teacherID, moduleID)
	if err != nil {
		log.Printf("Database error storing QR generation: %v", err)
	}

	if err := generateQRImage(encrypted, qrData.UUID); err != nil {
		log.Printf("QR generation error: %v", err)
	}

	log.Printf("QR generated: Class=%s, UUID=%s", classID, qrData.UUID)
}

func generateQRImage(content, uuid string) error {
	qrc, err := qrcode.New(content)
	if err != nil {
		return err
	}

	outDir := "qrcodes"
	if err := os.MkdirAll(outDir, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", outDir, err)
	}

	w, err := standard.New("qrcodes/qr.png")
	if err != nil {
		return err
	}

	return qrc.Save(w)
}
