package storage

import (
	"context"
	"fmt"
	"qr/pkg/encryption"
	"qr/pkg/utils"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
)

var QRData = utils.QRData{}

var (
	rdb = redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})
	ctx           = context.Background()
	activeClasses = sync.Map{}
)

func StoreInRedis(data utils.QRData) error {
	encrypted, err := encryption.EncryptData(data)
	if err != nil {
		return fmt.Errorf("encryption failed: %w", err)
	}

	key := fmt.Sprintf("qr:%s:%s", data.ClassID, data.UUID)
	if err := rdb.Set(ctx, key, encrypted, 60*time.Second).Err(); err != nil { //stored the qr data into redis with a ttl of 60 sec
		return fmt.Errorf("redis set failed: %w", err)
	}
	return nil
}
