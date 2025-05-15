package storage

import (
	"context"

	"github.com/go-redis/redis/v8"
)

var (
	rdb = redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})
	ctx = context.Background()
	/* kafkaWriter = kafka.NewWriter(kafka.WriterConfig{
		Brokers: []string{"localhost:9092"},
		Topic:   "student_events",
	}) */
)

func PublishEvent(payload []byte) bool {
	err := rdb.Publish(ctx, "qr_validations", payload)
	return err.Err() == nil
}
