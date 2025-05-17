package listeners

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"mysqr/qr/pkg/encryption"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
)

var (
	rdb = redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})
	ctx = context.Background()
)

func StartValidationListener() {
	for {
		pubsub := rdb.Subscribe(ctx, "qr_validations")
		if pubsub == nil {
			log.Println("Failed to subscribe to qr_validations. Retrying...")
			time.Sleep(5 * time.Second)
			continue
		}

		log.Println("Listening for validation requests...")
		ch := pubsub.Channel()

		for msg := range ch {
			var req map[string]string
			if err := json.Unmarshal([]byte(msg.Payload), &req); err != nil {
				// logKafka("validation_decode_error", err.Error())
				continue
			}
			go handleValidation(req)
		}

		pubsub.Close()
		log.Println("Redis validation subscription lost. Reconnecting...")
	}
}

func handleValidation(req map[string]string) {
	uuid, classId, ScannTime, studentId := req["uuid"], req["class_id"], req["ScannTime"], req["studentId"]

	// TODO: before validating the qr code, we need to check if the student is enrolled in the class, if the class exists and if the student has already scanned a qr code for that class on that day
	valid := validateQR(uuid, classId, ScannTime)

	/* result := map[string]interface{}{
		"valid":    valid,
		"uuid":     req["uuid"],
		"class_id": req["class_id"],
		"ts":       time.Now().Unix(),
	} */

	// HERE WE SHOULD SAVE THE VALIDATION RESULT INTO THE DB
	log.Print(valid, uuid, studentId, classId, time.Now().Unix())

	// logKafka("validation_result", result)
}

func validateQR(uuid, classID, ScannTime string) bool {
	key := fmt.Sprintf("qr:%s:%s", classID, uuid)
	data, err := rdb.Get(ctx, key).Result()
	if err != nil {
		log.Printf("Redis GET failed for key %s: %v", key, err)
		return false
	}

	qrData, err := encryption.DecryptData(data)
	if err != nil {
		log.Printf("Decryption failed for key %s: %v", key, err)
		return false
	}

	i, err := strconv.ParseInt(ScannTime, 10, 64)
	log.Print(qrData.Timestamp)
	valid := i-qrData.Timestamp <= 1000
	log.Printf("Validation result: valid=%v, key=%s", valid, key)
	return valid
}
