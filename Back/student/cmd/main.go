package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"student/pkg/encryption"
	"student/pkg/storage"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.POST("/scan", func(c *gin.Context) {
		var request struct {
			EncryptedQR string `json:"encryptedQR"`
			StudentID   string `json:"studentId"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			//logKafka("invalid_request", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		// Decrypt QR data (scanned)
		qrData, err := encryption.DecryptData(request.EncryptedQR)
		log.Printf("QR Data: %v", qrData)
		log.Printf("Encrypted: %v", request.EncryptedQR)
		if err != nil {
			//logKafka("decryption_failed", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid QR"})
			return
		}

		validationReq := map[string]string{
			"uuid":      qrData.UUID,
			"class_id":  qrData.ClassID,
			"ScannTime": fmt.Sprintf("%d", time.Now().Unix()),
			"studentId": request.StudentID,
		}

		payload, err := json.Marshal(validationReq)
		if err != nil {
			//logKafka("marshal_failed", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process request"})
			return
		}

		if !storage.PublishEvent(payload) {
			//logKafka("redis_publish_failed", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to submit validation"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":  "pending",
			"message": "Validation request submitted",
		})
	})

	r.Run(":8082")
}

/* func logKafka(eventType string, data interface{}) {
	msg, err := json.Marshal(map[string]interface{}{
		"service":   "student",
		"type":      eventType,
		"data":      data,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
	if err != nil {
		log.Printf("Kafka marshal error: %v", err)
		return
	}

	if err := kafkaWriter.WriteMessages(ctx, kafka.Message{Value: msg}); err != nil {
		log.Printf("Kafka write error: %v", err)
	}
} */

/* Example usage to test:
curl -X POST http://localhost:8082/scan -H "Content-Type: application/json" -d '{
// "EncryptedQR": "QR",
// "studentId": "ID" }'
*/
