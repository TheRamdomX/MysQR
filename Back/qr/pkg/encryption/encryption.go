package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io" // agregado: para io.ReadFull
	"mysqr/qr/pkg/utils"
	// agregado: import del keymanager para la clave diaria
	// agregado: módulo keymanager
)

// borrar: var encryptionKey = []byte("32-byte-long-secret-key-12345678") // ya no usamos clave estática

// EncryptData cifra el struct utils.QRData usando AES-256-GCM con la clave “del día”.
// Retorna una cadena Base64 que contiene: [ nonce | ciphertext ] codificado.
func EncryptData(data utils.QRData) (string, error) {
	// agregado: obtener la clave AES (32 bytes) actual desde el keymanager
	key, err := GetCurrentAESKey()
	if err != nil {
		return "", fmt.Errorf("no pude obtener la clave AES diaria: %w", err)
	}

	// 1) Marshal del objeto Go a JSON:
	plaintext, err := json.Marshal(data)
	if err != nil {
		return "", fmt.Errorf("marshal error: %w", err)
	}

	// 2) Creamos el bloque AES y el GCM
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("AES cipher error: %w", err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("GCM mode error: %w", err)
	}

	// 3) Generamos un nonce de GCM (tamaño fijo)
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("nonce generation error: %w", err)
	}

	// 4) Sellamos (Seal) nonce|ciphertext
	ciphertext := gcm.Seal(nonce, nonce, plaintext, nil)

	// 5) Entregamos todo en Base64 (nonce+ciphertext codificado)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func DecryptData(encrypted string) (utils.QRData, error) {
	// 1) Decodificamos la cadena Base64 para obtener [nonce|ciphertext]
	payload, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return utils.QRData{}, fmt.Errorf("base64 decode error: %w", err)
	}

	// agregado: obtenemos la clave actual
	key, err := GetCurrentAESKey()
	if err != nil {
		return utils.QRData{}, fmt.Errorf("no pude obtener la clave AES diaria: %w", err)
	}

	// 2) Creamos el bloque AES y el GCM
	block, err := aes.NewCipher(key)
	if err != nil {
		return utils.QRData{}, fmt.Errorf("AES cipher error: %w", err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return utils.QRData{}, fmt.Errorf("GCM mode error: %w", err)
	}

	// 3) Separamos nonce y ciphertext
	nonceSize := gcm.NonceSize()
	if len(payload) < nonceSize {
		return utils.QRData{}, fmt.Errorf("malformed encrypted data")
	}
	nonce, ciphertext := payload[:nonceSize], payload[nonceSize:]

	// 4) Desencriptamos
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return utils.QRData{}, fmt.Errorf("decryption failed: %w", err)
	}

	// 5) Unmarshal del JSON a utils.QRData
	var result utils.QRData
	if err := json.Unmarshal(plaintext, &result); err != nil {
		return utils.QRData{}, fmt.Errorf("unmarshal error: %w", err)
	}

	return result, nil
}
