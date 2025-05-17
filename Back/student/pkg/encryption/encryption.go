package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"mysqr/student/pkg/utils"
	"os"
)

var key = []byte(getEnv("ENCRYPTION_KEY", "mysqr-32-byte-secret-key-12345"))

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func EncryptData(data interface{}) (string, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	ciphertext := make([]byte, aes.BlockSize+len(jsonData))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	stream := cipher.NewCTR(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], jsonData)

	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func DecryptData(encryptedData string) (utils.QRData, error) {
	var qrData utils.QRData

	ciphertext, err := base64.StdEncoding.DecodeString(encryptedData)
	if err != nil {
		return qrData, err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return qrData, err
	}

	if len(ciphertext) < aes.BlockSize {
		return qrData, errors.New("ciphertext too short")
	}

	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	stream := cipher.NewCTR(block, iv)
	stream.XORKeyStream(ciphertext, ciphertext)

	if err := json.Unmarshal(ciphertext, &qrData); err != nil {
		return qrData, err
	}

	return qrData, nil
}
