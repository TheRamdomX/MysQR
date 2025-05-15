package main

import (
	"api-gateway/internal/proxy"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// ENDPOINTS que consume el frontend
	//r.POST("/api/login", proxy.ToAuth)
	r.POST("/api/scan", proxy.ToStudent)
	r.POST("/api/classes/:classId/start", proxy.ToTeacher)
	r.POST("/api/classes/:classId/stop", proxy.ToTeacher)

	// Otros endpoints generales
	r.Any("/api/qr/*path", proxy.ToQR)
	r.Any("/api/db/*path", proxy.ToDB)

	r.Run(":8088")
}
