package qr_code

import (
	"fmt"
	"log"
	"mysqr/qr/pkg/encryption"
	"mysqr/qr/pkg/storage"
	"mysqr/qr/pkg/utils"
	"os"
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
		ticker := time.NewTicker(1000 * time.Second) // reset of the QR code
		defer ticker.Stop()

		generateQRForClass(classID)

		for {
			select {
			case <-ticker.C:
				generateQRForClass(classID) // frontend may have to create a socket connection to get the QR code every x seconds ?
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

	// Encriptar el payload con AES-GCM diario
	encrypted, err := encryption.EncryptData(qrData)
	if err != nil {
		log.Printf("Encryption error: %v", err)
		return
	}

	// borrar: if err := storage.StoreInRedis(qrData); err != nil {
	// borrar:     log.Printf("Redis error: %v", err)
	// borrar: }

	// agregado (TTL en Redis): guardar en Redis la clave "qr:<classID>:<UUID>" con valor "encrypted"
	//                         y expiración de 100 minutos (100 * time.Minute)
	ttl := time.Duration(10) * time.Minute
	redisKey := fmt.Sprintf("qr:%s:%s", classID, qrData.UUID)
	if err := storage.SaveQRWithTTL(redisKey, encrypted, ttl); err != nil {
		log.Printf("Redis error al guardar con TTL: %v", err)
	}

	// borrar: if err := generateQRImage(encrypted, qrData.UUID); err != nil {
	// borrar:     log.Printf("QR generation error: %v", err)
	// borrar: }

	// agregado (modificación en nombre de archivo): generar imagen QR usando la URL de validación
	// Construir la URL que el QR debe contener, por ejemplo:
	//    https://<tu-dominio>/qr/validate/{classID}/{UUID}
	qrURL := fmt.Sprintf("https://tu-dominio/qr/validate/%s/%s", classID, qrData.UUID)
	if err := generateQRImage(qrURL, qrData.UUID); err != nil {
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

	// borrar: w, err := standard.New("qrcodes/qr.png")
	// borrar: if err != nil {
	// borrar:     return err
	// borrar: }
	// borrar: return qrc.Save(w)

	// agregado: cada QR se guarda como "<classID>_<UUID>.png" para evitar sobreescrituras
	outPath := fmt.Sprintf("%s/%s.png", outDir, uuid)
	w, err := standard.New(outPath)
	if err != nil {
		return err
	}
	return qrc.Save(w)
}
