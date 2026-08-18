package main

import (
	"log"
	"net/http"
	"strings"

	"mysqr/pkg/httpcors"
	"mysqr/qr/pkg/auth"

	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.DebugMode)
	r := gin.Default()
	r.Use(httpcors.Middleware())

	// Endpoint de login
	r.POST("/login", func(c *gin.Context) {
		log.Printf("Procesando login en: %s", c.Request.URL.Path)
		auth.LoginHandler(c)
	})

	// El Front lo llama al arrancar para saber si la sesión guardada sigue viva.
	r.POST("/validate-token", func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Falta token de autorización"})
			return
		}

		claims, err := auth.ValidateToken(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido o expirado"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"valid": true,
			"rol":   claims.Rol,
			"id":    claims.UserID,
		})
	})

	log.Printf("Iniciando servidor QR (auth) en :8087")
	if err := r.Run(":8087"); err != nil {
		log.Fatal(err)
	}
}
