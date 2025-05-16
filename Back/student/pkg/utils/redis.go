package utils

import (
	"fmt"
)

func GenerateRedisKey(classID, uuid string) string {
	return fmt.Sprintf("qr:%s:%s", classID, uuid)
}
