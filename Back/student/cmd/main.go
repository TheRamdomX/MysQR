package main

import (
	"log"
	"net/http"
	"os"
	"strconv"

	"mysqr/database/pkg/postgres"
	"mysqr/pkg/authmw"
	"mysqr/pkg/httpcors"
	"mysqr/pkg/qrcode"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

func main() {
	r := gin.Default()
	r.Use(httpcors.Middleware())

	db, err := postgres.CreateConnection()
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	defer db.Close()
	dbService := postgres.NewDatabaseService(db)

	rdb := redis.NewClient(&redis.Options{
		Addr: getEnv("REDIS_HOST", "localhost") + ":" + getEnv("REDIS_PORT", "6379"),
	})
	store := qrcode.NewStore(rdb)

	r.POST("/api/scan", authmw.RequireAuth(), func(c *gin.Context) {
		claims := authmw.Claims(c)
		if claims.Rol != "alumno" || claims.AlumnoID == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Solo un alumno puede escanear asistencia"})
			return
		}
		alumnoID := *claims.AlumnoID

		var request struct {
			QR string `json:"qr" binding:"required"`
		}
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cuerpo de la solicitud inválido"})
			return
		}

		payload, err := qrcode.Decrypt(request.QR)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "QR inválido"})
			return
		}

		valid, err := store.Validate(c.Request.Context(), payload)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al validar el QR"})
			return
		}
		if !valid {
			c.JSON(http.StatusNotFound, gin.H{"error": "QR expirado, pide uno nuevo"})
			return
		}

		seccionID, err := strconv.Atoi(payload.SectionID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "QR inválido"})
			return
		}
		moduloID, err := strconv.Atoi(payload.ModuleID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "QR inválido"})
			return
		}

		enrolled, err := dbService.IsEnrolled(alumnoID, seccionID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al verificar la inscripción"})
			return
		}
		if !enrolled {
			c.JSON(http.StatusForbidden, gin.H{"error": "No estás inscrito en esta sección"})
			return
		}

		already, err := dbService.HasAttendance(alumnoID, seccionID, moduloID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al verificar la asistencia"})
			return
		}
		if already {
			c.JSON(http.StatusOK, gin.H{"status": "already_registered", "message": "Ya habías registrado tu asistencia"})
			return
		}

		if err := dbService.RegisterAttendance(alumnoID, seccionID, moduloID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al registrar la asistencia"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": "registered", "message": "Asistencia registrada exitosamente"})
	})

	log.Printf("Iniciando servidor Student en :8085")
	if err := r.Run(":8085"); err != nil {
		log.Fatal(err)
	}
}

func getEnv(key, defaultValue string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return defaultValue
}
