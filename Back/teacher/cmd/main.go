package main

import (
	"encoding/json"
	"log"
	"teacher/pkg/encryption"
	"teacher/pkg/storage"
	"teacher/pkg/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.POST("/api/classes/:classId/start", func(c *gin.Context) {
		classID := c.Param("classId")
		professorID := c.GetHeader("X-Professor-ID")
		sectionID := c.GetHeader("X-Section-ID")
		moduleID := c.GetHeader("X-Module-ID")

		if professorID == "" || sectionID == "" || moduleID == "" {
			c.JSON(400, gin.H{"error": "Missing required headers"})
			return
		}

		// Generar datos del QR
		qrData := utils.NewQRData(classID, professorID, sectionID, moduleID)

		// Encriptar datos
		encrypted, err := encryption.EncryptData(qrData)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to encrypt QR data"})
			return
		}

		// Publicar evento para almacenar en Redis
		event := map[string]string{
			"event_type":   "qr_start",
			"class_id":     classID,
			"professor_id": professorID,
			"section_id":   sectionID,
			"module_id":    moduleID,
			"encrypted_qr": encrypted,
		}
		payload, _ := json.Marshal(event)
		storage.PublishEvent(payload)

		// Retornar QR encriptado
		c.JSON(200, gin.H{
			"encrypted_qr": encrypted,
			"data": gin.H{
				"class_id":     classID,
				"professor_id": professorID,
				"section_id":   sectionID,
				"module_id":    moduleID,
			},
		})
	})

	r.POST("/api/classes/:classId/stop", func(c *gin.Context) {
		classID := c.Param("classId")
		event := map[string]string{
			"event_type": "qr_stop",
			"class_id":   classID,
		}
		payload, _ := json.Marshal(event)
		storage.PublishEvent(payload)
		c.JSON(200, gin.H{"message": "QR generation stopped"})
	})

	if err := r.Run(":8081"); err != nil {
		log.Fatal(err)
	}
}
