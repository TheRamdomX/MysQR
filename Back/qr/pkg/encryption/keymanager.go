package encryption

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"os"
	"time"
)

// SecretBase es una constante (o mejor, una variable de entorno) que sirve
// como semilla fija para derivar siempre la misma clave diaria. Puede venir
// de env (p.ej. AES_SECRET_BASE) o estar en un Vault. No la guardamos en el repo.
var SecretBase = os.Getenv("AES_SECRET_BASE")

// EnsureDailyAESKey revisa si existe la variable QR_AES_KEY_BASE64 para la
// fecha de hoy; si no existe, la genera y la vuelca a ENV.
func EnsureDailyAESKey() (string, error) {
	// Fecha en formato YYYY-MM-DD (UTC)
	today := time.Now().UTC().Format("2006-01-02")
	envKeyName := "QR_AES_KEY_BASE64_" + today
	// Chequear si ya existe para hoy
	if val := os.Getenv(envKeyName); val != "" {
		// Si ya está, retornamos el valor y la seteamos en QR_AES_KEY_BASE64
		os.Setenv("QR_AES_KEY_BASE64", val)
		return val, nil
	}
	// Si no existe, derivamos una nueva clave con HMAC-SHA256
	mac := hmac.New(sha256.New, []byte(SecretBase))
	mac.Write([]byte(today))
	raw := mac.Sum(nil)                               // 32 bytes
	encoded := base64.StdEncoding.EncodeToString(raw) // base64(32 bytes) → 44 chars

	// Guardamos en variable de entorno específica de la fecha
	os.Setenv(envKeyName, encoded)
	// También actualizamos la variable genérica para cifrar/descifrar
	os.Setenv("QR_AES_KEY_BASE64", encoded)

	return encoded, nil
}

// GetCurrentAESKey retorna la clave AES (en bytes) para cifrar/descifrar,
// leyendo QR_AES_KEY_BASE64 (que debe estar ya seteada por EnsureDailyAESKey).
func GetCurrentAESKey() ([]byte, error) {
	b64 := os.Getenv("QR_AES_KEY_BASE64")
	if b64 == "" {
		return nil, fmt.Errorf("la variable QR_AES_KEY_BASE64 no está definida")
	}
	return base64.StdEncoding.DecodeString(b64)
}
