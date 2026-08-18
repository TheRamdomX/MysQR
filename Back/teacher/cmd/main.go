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

	r.POST("/api/classes/start", authmw.RequireAuth(), func(c *gin.Context) {
		claims := authmw.Claims(c)
		if claims.Rol != "profesor" || claims.ProfesorID == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Solo un profesor puede emitir un QR"})
			return
		}

		moduleSection, err := dbService.GetCurrentModuleAndSection(*claims.ProfesorID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if moduleSection == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No hay clase programada en este momento"})
			return
		}

		encrypted, err := store.Issue(
			c.Request.Context(),
			strconv.Itoa(moduleSection.SeccionID),
			strconv.Itoa(*claims.ProfesorID),
			strconv.Itoa(moduleSection.ModuloID),
			qrcode.DefaultTTL,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo emitir el QR"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"encrypted_qr": encrypted,
			"expires_in":   int(qrcode.DefaultTTL.Seconds()),
			"data": gin.H{
				"section_id": moduleSection.SeccionID,
				"module_id":  moduleSection.ModuloID,
			},
		})
	})

	log.Printf("Iniciando servidor Teacher en :8086")
	if err := r.Run(":8086"); err != nil {
		log.Fatal(err)
	}
}

func getEnv(key, defaultValue string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return defaultValue
}
