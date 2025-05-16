package utils

import (
	"fmt"
	"time"
)

// GenerateRedisKey genera una clave única para Redis
func GenerateRedisKey(classID, uuid string) string {
	return fmt.Sprintf("qr:%s:%s", classID, uuid)
}

// IsExpired verifica si un QR ha expirado
func IsExpired(expiresAt time.Time) bool {
	return time.Now().After(expiresAt)
}
