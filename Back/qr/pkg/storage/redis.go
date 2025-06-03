package storage

import (
	"context"
	"fmt"
	"mysqr/qr/pkg/encryption"
	"mysqr/qr/pkg/utils"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

var QRData = utils.QRData{}

// borrar: var (
// borrar:     rdb = redis.NewClient(&redis.Options{
// borrar:         Addr: fmt.Sprintf("%s:%s",
// borrar:             getEnv("REDIS_HOST", "localhost"),
// borrar:             getEnv("REDIS_PORT", "6379")),
// borrar:     })
// borrar:     ctx = context.Background()
// borrar: )

// agregado: rdb se inicializará en InitRedis()
var (
	rdb *redis.Client          // cliente Redis, inicializado en InitRedis()
	ctx = context.Background() // contexto compartido
)

// InitRedis inicializa el cliente Redis usando las variables de entorno REDIS_HOST y REDIS_PORT.
// Debe llamarse una vez al arrancar el servicio (p.ej., en main.go).
// Ejemplo: storage.InitRedis()

// agregado: función para inicializar la conexión a Redis
func InitRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s",
			getEnv("REDIS_HOST", "localhost"),
			getEnv("REDIS_PORT", "6379")),
	})
	// opcionalmente, podrías hacer un ping para verificar la conectividad:
	// if err := rdb.Ping(ctx).Err(); err != nil {
	//     panic(fmt.Errorf("no se pudo conectar a Redis: %w", err))
	// }
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func StoreInRedis(data utils.QRData) error {
	encrypted, err := encryption.EncryptData(data)
	if err != nil {
		return fmt.Errorf("encryption failed: %w", err)
	}

	key := utils.GenerateRedisKey(data.ClassID, data.UUID)
	// borrar: if err := rdb.Set(ctx, key, encrypted, 6000*time.Second).Err(); err != nil {
	// borrar:     return fmt.Errorf("redis set failed: %w", err)
	// borrar: }
	// borrar: return nil

	// agregado (TTL configurable): guardar en Redis con expiración de 6000 segundos (100 minutos)
	if err := rdb.Set(ctx, key, encrypted, 600*time.Second).Err(); err != nil {
		return fmt.Errorf("redis set failed: %w", err)
	}
	return nil
}

// SaveQRWithTTL guarda la cadena 'value' en la clave 'key' con expiración 'ttl'
func SaveQRWithTTL(key, value string, ttl time.Duration) error {
	if err := rdb.Set(ctx, key, value, ttl).Err(); err != nil {
		return fmt.Errorf("SaveQRWithTTL failed: %w", err)
	}
	return nil
}

func ValidateQR(key string) (bool, error) {
	exists, err := rdb.Exists(ctx, key).Result()
	if err != nil {
		return false, fmt.Errorf("redis exists check failed: %w", err)
	}
	return exists == 1, nil
}

func GetQRData(key string) (*utils.QRData, error) {
	data, err := rdb.Get(ctx, key).Result()
	if err != nil {
		return nil, fmt.Errorf("redis get failed: %w", err)
	}

	decrypted, err := encryption.DecryptData(data)
	if err != nil {
		return nil, fmt.Errorf("decryption failed: %w", err)
	}

	return &decrypted, nil
}
