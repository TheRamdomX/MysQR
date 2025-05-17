package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"mysqr/database/pkg/postgres"

	_ "github.com/lib/pq"
)

func initDatabase(db *sql.DB) error {
	sqlFile := "migrations/001_init.sql"
	content, err := os.ReadFile(sqlFile)
	if err != nil {
		return err
	}

	statements := strings.Split(string(content), ";")

	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" {
			continue
		}
		_, err := db.Exec(stmt)
		if err != nil {
			return err
		}
	}

	return nil
}

func main() {
	db, err := postgres.CreateConnection()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize database
	if err := initDatabase(db); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Create database service
	dbService := postgres.NewDatabaseService(db)

	// 1. Obtener moduloID basado en la fecha y hora actual
	http.HandleFunc("/api/db/module/current", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		moduleID, err := dbService.GetCurrentModuleID()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]int{"module_id": moduleID})
	})

	// 2. Registro en QRGenerado con el ProfesorID
	http.HandleFunc("/api/db/qr/generate", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var request struct {
			ProfesorID int `json:"profesor_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		id, err := dbService.RegisterQRGeneration(request.ProfesorID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]int64{"id": id})
	})

	// 3. Obtener Secciones.ID y Asignaturas.Nombre usando el ProfesorID
	http.HandleFunc("/api/db/sections/professor/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		idStr := strings.TrimPrefix(r.URL.Path, "/api/db/sections/professor/")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "Invalid professor ID", http.StatusBadRequest)
			return
		}

		sections, err := dbService.GetSectionsByProfessor(id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(sections)
	})

	// 4. Registro en Asistencia (QR)
	http.HandleFunc("/api/db/attendance/qr", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var request struct {
			AlumnoID  int `json:"alumno_id"`
			SeccionID int `json:"seccion_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := dbService.RegisterAttendance(request.AlumnoID, request.SeccionID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	// 4.1. Registro en Asistencia manual
	http.HandleFunc("/api/db/attendance/manual", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var request struct {
			ProfesorID int `json:"profesor_id"`
			AlumnoID   int `json:"alumno_id"`
			SeccionID  int `json:"seccion_id"`
			ModuloID   int `json:"modulo_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := dbService.RegisterManualAttendance(request.AlumnoID, request.SeccionID, request.ModuloID, request.ProfesorID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	// 5. Obtener SeccionesID y nombre de asignaturas con el AlumnoId
	http.HandleFunc("/api/db/sections/student/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		idStr := strings.TrimPrefix(r.URL.Path, "/api/db/sections/student/")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "Invalid student ID", http.StatusBadRequest)
			return
		}

		sections, err := dbService.GetSectionsByStudent(id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(sections)
	})

	// 6. Obtener registros de ReporteAsistencia
	http.HandleFunc("/api/db/attendance/report", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		seccionID, err := strconv.Atoi(r.URL.Query().Get("seccion_id"))
		if err != nil {
			http.Error(w, "Invalid section ID", http.StatusBadRequest)
			return
		}

		alumnoID, err := strconv.Atoi(r.URL.Query().Get("alumno_id"))
		if err != nil {
			http.Error(w, "Invalid student ID", http.StatusBadRequest)
			return
		}

		reports, err := dbService.GetAttendanceReport(seccionID, alumnoID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(reports)
	})

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
