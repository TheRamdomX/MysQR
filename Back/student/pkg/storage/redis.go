package storage

import (
	"context"
	"encoding/json"
	"os"

	"github.com/redis/go-redis/v9"
)

var rdb *redis.Client

func init() {
	rdb = redis.NewClient(&redis.Options{
		Addr:     getEnv("REDIS_HOST", "localhost") + ":" + getEnv("REDIS_PORT", "6379"),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       0,
	})
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func ValidateQR(key string) (bool, error) {
	ctx := context.Background()
	exists, err := rdb.Exists(ctx, key).Result()
	return exists > 0, err
}

func PublishEvent(channel string, event interface{}) error {
	ctx := context.Background()
	payload, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return rdb.Publish(ctx, channel, payload).Err()
}
