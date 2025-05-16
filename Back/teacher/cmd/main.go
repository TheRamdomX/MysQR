package main

import (
	"encoding/json"
	"net/http"

	"teacher/pkg/storage"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.POST("/api/classes/:classId/start", func(c *gin.Context) {
		classID := c.Param("classId")
		event := map[string]string{
			"event_type": "qr_start",
			"class_id":   classID,
			// "timestamp":  time.Now().UTC().Format(time.RFC3339),
		}

		payload, _ := json.Marshal(event)
		storage.PublishEvent(payload)

		c.JSON(http.StatusOK, gin.H{"status": "start command sent"})
	})

	r.POST("/api/classes/:classId/stop", func(c *gin.Context) {
		classID := c.Param("classId")
		event := map[string]string{
			"event_type": "qr_stop",
			"class_id":   classID,
			// "timestamp":  time.Now().UTC().Format(time.RFC3339),
		}

		payload, _ := json.Marshal(event)
		storage.PublishEvent(payload)

		c.JSON(http.StatusOK, gin.H{"status": "stop command sent"})
	})

	r.Run(":8081")
}
