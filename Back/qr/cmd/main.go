package main

import (
	"log"
	"mysqr/qr/pkg/auth"
	"mysqr/qr/pkg/storage"
	"mysqr/qr/pkg/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	// Configurar Gin en modo debug
	gin.SetMode(gin.DebugMode)
	r := gin.Default()

	// Configurar CORS
	r.Use(func(c *gin.Context) {
		log.Printf("Recibida petición: %s %s", c.Request.Method, c.Request.URL.Path)
		log.Printf("Headers: %v", c.Request.Header)
		log.Printf("Body: %v", c.Request.Body)

		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			log.Printf("Respondiendo a OPTIONS para: %s", c.Request.URL.Path)
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Endpoint de login
	r.POST("/login", func(c *gin.Context) {
		log.Printf("Procesando login en: %s", c.Request.URL.Path)
		auth.LoginHandler(c)
	})

	// Endpoint para validar QR
	r.POST("/validate", func(c *gin.Context) {
		log.Printf("Validando QR: %s", c.Request.URL.Path)
		var request struct {
			UUID        string `json:"uuid"`
			ClassID     string `json:"class_id"`
			ProfessorID string `json:"professor_id"`
			SectionID   string `json:"section_id"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			log.Printf("Error al parsear JSON de validación: %v", err)
			c.JSON(400, gin.H{"error": "Invalid request"})
			return
		}

		key := utils.GenerateRedisKey(request.ClassID, request.UUID)
		exists, err := storage.ValidateQR(key)
		if err != nil {
			log.Printf("Error al validar QR: %v", err)
			c.JSON(500, gin.H{"error": "Validation failed"})
			return
		}

		if !exists {
			log.Printf("QR no encontrado o expirado: %s", key)
			c.JSON(404, gin.H{"error": "QR not found or expired"})
			return
		}

		log.Printf("QR válido: %s", key)
		c.JSON(200, gin.H{
			"valid": true,
			"data": gin.H{
				"class_id":     request.ClassID,
				"professor_id": request.ProfessorID,
				"section_id":   request.SectionID,
			},
		})
	})

	log.Printf("Iniciando servidor QR en :8087")
	if err := r.Run(":8087"); err != nil {
		log.Fatal(err)
	}
}
