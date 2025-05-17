package listeners

import (
	"encoding/json"
	"log"
	"mysqr/qr/pkg/qr_code"
	"time"
)

func StartCommandListener() {
	for {
		pubsub := rdb.Subscribe(ctx, "qr_commands")
		if pubsub == nil {
			log.Println("Failed to subscribe to Redis. Retrying in 5s...")
			time.Sleep(5 * time.Second)
			continue
		}

		log.Println("Subscribed to Redis successfully")

		ch := pubsub.Channel()
		for msg := range ch {
			log.Printf("Received message: %s", msg.Payload)

			var event map[string]string
			if err := json.Unmarshal([]byte(msg.Payload), &event); err != nil {
				log.Printf("Decode error: %v", err)
				continue
			}

			switch event["event_type"] {
			case "qr_start":
				log.Printf("Starting QR generation for class: %s", event["class_id"])
				qr_code.StartQRGeneration(event["class_id"])
			case "qr_stop":
				log.Printf("Stopping QR generation for class: %s", event["class_id"])
				qr_code.StopQRGeneration(event["class_id"])
			default:
				log.Printf("Unknown event type: %s", event["event_type"])
			}
		}

		pubsub.Close()
		log.Println("Redis subscription lost. Reconnecting...")
	}
}
