package qrcode

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"os"
)

// El fallback debe tener exactamente 32 bytes (AES-256): aes.NewCipher
// rechaza cualquier otro largo.
var encryptionKey = []byte(getEnv("ENCRYPTION_KEY", "mysqr-attendance-secret-key-2026"))

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// Encrypt serializa y cifra un Payload (AES-CFB) para pintarlo como QR.
func Encrypt(payload Payload) (string, error) {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	ciphertext := make([]byte, aes.BlockSize+len(jsonData))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	stream := cipher.NewCFBEncrypter(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], jsonData)

	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt revierte Encrypt. Devuelve error si el string no es un QR válido.
func Decrypt(encrypted string) (Payload, error) {
	var payload Payload

	ciphertext, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return payload, err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return payload, err
	}

	if len(ciphertext) < aes.BlockSize {
		return payload, errors.New("qrcode: ciphertext demasiado corto")
	}

	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	stream := cipher.NewCFBDecrypter(block, iv)
	stream.XORKeyStream(ciphertext, ciphertext)

	if err := json.Unmarshal(ciphertext, &payload); err != nil {
		return payload, err
	}

	return payload, nil
}
