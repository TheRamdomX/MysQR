package main

import (
	"log"
	"qr/pkg/storage"
	"qr/pkg/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Endpoint para generar QR
	/* r.GET("/api/qr/generate", func(c *gin.Context) {
		classID := c.Query("class_id")
		professorID := c.Query("professor_id")
		sectionID := c.Query("section_id")
		moduleID := c.Query("module_id")

		if classID == "" || professorID == "" || sectionID == "" || moduleID == "" {
			c.JSON(400, gin.H{"error": "Missing required parameters"})
			return
		}

		qrData := utils.NewQRData(classID, professorID, sectionID, moduleID)
		if err := storage.StoreInRedis(qrData); err != nil {
			c.JSON(500, gin.H{"error": "Failed to store QR data"})
			return
		}

		c.JSON(200, qrData)
	})
	*/
	// Endpoint para validar QR
	r.POST("/api/qr/validate", func(c *gin.Context) {
		var request struct {
			UUID        string `json:"uuid"`
			ClassID     string `json:"class_id"`
			ProfessorID string `json:"professor_id"`
			SectionID   string `json:"section_id"`
			// ModuleID    string `json:"module_id"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request"})
			return
		}

		key := utils.GenerateRedisKey(request.ClassID, request.UUID)
		exists, err := storage.ValidateQR(key)
		if err != nil {
			c.JSON(500, gin.H{"error": "Validation failed"})
			return
		}

		if !exists {
			c.JSON(404, gin.H{"error": "QR not found or expired"})
			return
		}

		c.JSON(200, gin.H{
			"valid": true,
			"data": gin.H{
				"class_id":     request.ClassID,
				"professor_id": request.ProfessorID,
				"section_id":   request.SectionID,
				// "module_id":    request.ModuleID,
			},
		})
	})

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
