package main

import (
	"log"
	"mysqr/qr/pkg/auth"
	"mysqr/qr/pkg/storage"
	"mysqr/qr/pkg/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Configurar CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Endpoint de login
	r.POST("/login", auth.LoginHandler)

	// Endpoint para validar QR
	r.POST("/api/qr/validate", func(c *gin.Context) {
		var request struct {
			UUID        string `json:"uuid"`
			ClassID     string `json:"class_id"`
			ProfessorID string `json:"professor_id"`
			SectionID   string `json:"section_id"`
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
			},
		})
	})

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
