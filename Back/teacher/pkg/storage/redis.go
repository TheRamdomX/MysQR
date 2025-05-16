package storage

import (
	"context"
	"fmt"
	"os"

	"github.com/go-redis/redis/v8"
)

var rdb = redis.NewClient(&redis.Options{
	Addr: fmt.Sprintf("%s:%s",
		getEnv("REDIS_HOST", "localhost"),
		getEnv("REDIS_PORT", "6379")),
})
var ctx = context.Background()

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func PublishEvent(payload []byte) bool {
	err := rdb.Publish(ctx, "qr_commands", payload)
	return err.Err() == nil
}
