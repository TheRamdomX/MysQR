package qrcode

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
)

// DefaultTTL es cuánto vive un QR emitido antes de expirar en Redis.
const DefaultTTL = 15 * time.Second

// Store emite y valida QRs respaldado por Redis: emitir escribe la clave
// con TTL, validar solo confirma que sigue viva (no expiró, no fue inventada).
type Store struct {
	rdb *redis.Client
}

func NewStore(rdb *redis.Client) *Store {
	return &Store{rdb: rdb}
}

func redisKey(sectionID, uuid string) string {
	return fmt.Sprintf("qr:%s:%s", sectionID, uuid)
}

// Issue genera un UUID nuevo, completa el payload y lo cifra, lo guarda en
// Redis con TTL y devuelve el QR cifrado listo para pintar.
func (s *Store) Issue(ctx context.Context, sectionID, professorID, moduleID string, ttl time.Duration) (string, error) {
	uuid, err := newUUID()
	if err != nil {
		return "", err
	}

	payload := Payload{
		UUID:        uuid,
		SectionID:   sectionID,
		ProfessorID: professorID,
		ModuleID:    moduleID,
		IssuedAt:    time.Now().Unix(),
	}

	encrypted, err := Encrypt(payload)
	if err != nil {
		return "", err
	}

	if err := s.rdb.Set(ctx, redisKey(sectionID, uuid), encrypted, ttl).Err(); err != nil {
		return "", err
	}

	return encrypted, nil
}

// Validate confirma que el payload descifrado corresponde a un QR todavía
// vigente (su clave no expiró en Redis).
func (s *Store) Validate(ctx context.Context, payload Payload) (bool, error) {
	exists, err := s.rdb.Exists(ctx, redisKey(payload.SectionID, payload.UUID)).Result()
	if err != nil {
		return false, err
	}
	return exists == 1, nil
}

func newUUID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
