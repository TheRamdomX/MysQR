package qr_code

import (
	"fmt"
	"log"
	"os"
	"qr/pkg/encryption"
	"qr/pkg/storage"
	"qr/pkg/utils"
	"sync"
	"time"

	"github.com/yeqown/go-qrcode/v2"
	"github.com/yeqown/go-qrcode/writer/standard"
)

var QRData = utils.QRData{}
var activeClasses = sync.Map{}

func StartQRGeneration(classID string) {
	if _, exists := activeClasses.Load(classID); exists {
		log.Printf("QR generation already active for class: %s", classID)
		return
	}

	stopChan := make(chan struct{})
	activeClasses.Store(classID, stopChan)

	go func() {
		log.Printf("QR generation started for class: %s", classID)
		ticker := time.NewTicker(1000 * time.Second) //reset of the qr code
		defer ticker.Stop()

		generateQRForClass(classID)

		for {
			select {
			case <-ticker.C:
				generateQRForClass(classID) // frontend may have to create a socket connection to get the qr code every x seconds ?
			case <-stopChan:
				activeClasses.Delete(classID)
				log.Printf("QR generation stopped for class: %s", classID)
				return
			}
		}
	}()
}

func StopQRGeneration(classID string) {
	if val, exists := activeClasses.Load(classID); exists {
		close(val.(chan struct{}))
	}
}

func generateQRForClass(classID string) {
	qrData := utils.QRData{
		Timestamp: time.Now().Unix(),
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
