package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"student/pkg/utils"
)

var encryptionKey = []byte("32-byte-long-secret-key-12345678")

func EncryptData(data utils.QRData) (string, error) {
	text, err := json.Marshal(data)
	if err != nil {
		return "", fmt.Errorf("marshal error: %w", err)
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", fmt.Errorf("AES cipher error: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("GCM mode error: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return "", fmt.Errorf("nonce generation error: %w", err)
	}

	ciphertext := gcm.Seal(nonce, nonce, text, nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func DecryptData(encrypted string) (utils.QRData, error) {
	data, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return utils.QRData{}, fmt.Errorf("base64 decode error: %w", err)
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return utils.QRData{}, fmt.Errorf("AES cipher error: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return utils.QRData{}, fmt.Errorf("GCM mode error: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return utils.QRData{}, fmt.Errorf("malformed encrypted data")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	text, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return utils.QRData{}, fmt.Errorf("decryption failed: %w", err)
	}

	var result utils.QRData
	if err := json.Unmarshal(text, &result); err != nil {
		return utils.QRData{}, fmt.Errorf("unmarshal error: %w", err)
	}

	return result, nil
}
