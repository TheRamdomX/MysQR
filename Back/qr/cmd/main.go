package main

import (
	"encoding/json"
	"log"
	"net/http"
	"qr/pkg/auth"
	"qr/pkg/database"
	"qr/pkg/listeners"
	"qr/pkg/qr_code"
)

func main() {
	// Inicializar conexión a la base de datos
	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Iniciar listeners de eventos
	go listeners.StartCommandListener()
	go listeners.StartValidationListener()

	// Endpoint de login
	http.HandleFunc("/api/qr/login", auth.LoginHandler)

	// Endpoint de generación de QR
	http.HandleFunc("/api/qr/generate", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Validar token
		token := r.Header.Get("Authorization")
		if token == "" {
			http.Error(w, "No token provided", http.StatusUnauthorized)
			return
		}

		claims, err := auth.ValidateToken(token)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Verificar que sea un profesor
		if claims.Role != "teacher" {
			http.Error(w, "Only teachers can generate QR codes", http.StatusForbidden)
			return
		}

		var request struct {
			ClassID string `json:"class_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		metadata, err := qr_code.GenerateQRMetadata(request.ClassID)
		if err != nil {
			http.Error(w, "Failed to generate QR metadata", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(metadata)
	})

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
