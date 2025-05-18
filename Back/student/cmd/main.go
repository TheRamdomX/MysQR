package main

import (
	"log"
	"mysqr/student/pkg/encryption"
	"mysqr/student/pkg/storage"
	"mysqr/student/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.POST("/api/scan", func(c *gin.Context) {
		var request struct {
			EncryptedQR string `json:"encryptedQR" binding:"required"`
			StudentID   string `json:"studentID" binding:"required"`
			ProfessorID string `json:"professorID" binding:"required"`
			SectionID   string `json:"sectionID" binding:"required"`
			ModuleID    string `json:"moduleID" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		qrData, err := encryption.DecryptData(request.EncryptedQR)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al desencriptar QR"})
			return
		}

		// Validar que los datos del QR coincidan con los parámetros
		if qrData.ProfessorID != request.ProfessorID ||
			qrData.SectionID != request.SectionID ||
			qrData.ModuleID != request.ModuleID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "QR inválido"})
			return
		}

		// Verificar si el QR existe en Redis
		key := utils.GenerateRedisKey(qrData.ClassID, qrData.UUID)
		exists, err := storage.ValidateQR(key)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al validar QR"})
			return
		}

		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "QR no encontrado o expirado"})
			return
		}

		// Publicar evento de validación exitosa
		event := map[string]interface{}{
			"type":        "validation",
			"status":      "success",
			"studentID":   request.StudentID,
			"professorID": request.ProfessorID,
			"sectionID":   request.SectionID,
			"moduleID":    request.ModuleID,
			"qrID":        qrData.UUID,
		}

		if err := storage.PublishEvent("qr_validations", event); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al publicar evento"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "QR validado exitosamente"})
	})

	log.Printf("Iniciando servidor Student en :8085")
	if err := r.Run(":8085"); err != nil {
		log.Fatal(err)
	}
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
