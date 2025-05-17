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

var (
	rdb = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s",
			getEnv("REDIS_HOST", "localhost"),
			getEnv("REDIS_PORT", "6379")),
	})
	ctx = context.Background()
)

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
	if err := rdb.Set(ctx, key, encrypted, 6000*time.Second).Err(); err != nil {
		return fmt.Errorf("redis set failed: %w", err)
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
