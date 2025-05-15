package storage

import (
	"context"

	"github.com/go-redis/redis/v8"
)

var rdb = redis.NewClient(&redis.Options{
	Addr: "localhost:6379",
})
var ctx = context.Background()

func PublishEvent(payload []byte) bool {
	err := rdb.Publish(ctx, "qr_commands", payload)
	return err.Err() == nil
}
