package qr_code

import (
	"qr/pkg/encryption"
	"qr/pkg/utils"
	"time"
)

type QRMetadata struct {
	UUID      string `json:"uuid"`
	ClassID   string `json:"class_id"`
	ExpiresAt int64  `json:"expires_at"`
}

func GenerateQRMetadata(classID string) (*QRMetadata, error) {
	metadata := &QRMetadata{
		UUID:      generateUUID(),
		ClassID:   classID,
		ExpiresAt: time.Now().Add(5 * time.Minute).Unix(),
	}

	// Convertir a QRData para encriptación
	qrData := utils.QRData{
		UUID:    metadata.UUID,
		ClassID: metadata.ClassID,
	}

	// Encriptar la metadata
	_, err := encryption.EncryptData(qrData)
	if err != nil {
		return nil, err
	}

	return metadata, nil
}

func generateUUID() string {
	// Implementación simple de UUID
	return time.Now().Format("20060102150405")
}
