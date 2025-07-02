package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"mysqr/database/pkg/postgres"

	"github.com/gorilla/handlers"
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

	/*
		// Initialize database
		if err := initDatabase(db); err != nil {
			log.Fatalf("Failed to initialize database: %v", err)
		}
	*/

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

	// 3.1 Obtener ModuloID actual y SeccionID de ProgramacionClases para un profesor
	http.HandleFunc("/api/db/professor/current-class", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		profesorID, err := strconv.Atoi(r.URL.Query().Get("profesor_id"))
		if err != nil {
			http.Error(w, "Invalid professor ID", http.StatusBadRequest)
			return
		}

		moduleSection, err := dbService.GetCurrentModuleAndSection(profesorID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Si no hay clase programada, devolvemos un objeto vacío con status 200
		if moduleSection == nil {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{})
			return
		}

		json.NewEncoder(w).Encode(moduleSection)
	})

	// 4. Registro en Asistencia (QR)
	http.HandleFunc("/api/db/attendance/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var request struct {
			AlumnoID      int    `json:"alumno_id"`
			SeccionID     int    `json:"seccion_id"`
			ModuloID      int    `json:"modulo_id"`
			FechaRegistro string `json:"fecha_registro"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := dbService.RegisterAttendance(request.AlumnoID, request.SeccionID, request.ModuloID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Asistencia registrada exitosamente"})
	})

	// 4.1. Registro en Asistencia manual
	http.HandleFunc("/api/db/attendance/manual", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var request struct {
			AlumnoID  int `json:"alumno_id"`
			SeccionID int `json:"seccion_id"`
			ModuloID  int `json:"modulo_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := dbService.RegisterManualAttendance(request.AlumnoID, request.SeccionID, request.ModuloID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	// 4.2. Eliminar registros manuales de una sección
	http.HandleFunc("/api/db/attendance/manual/delete", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var request struct {
			SeccionID int `json:"seccion_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := dbService.DeleteManualAttendanceBySection(request.SeccionID); err != nil {
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

		// Ejecutar la función directamente
		query := `SELECT * FROM obtener_asistencia_por_seccion($1)`
		var reporte []byte
		err = db.QueryRow(query, seccionID).Scan(&reporte)
		if err != nil {
			log.Printf("Error al obtener reporte de asistencia: %v", err)
			http.Error(w, "Error al obtener reporte de asistencia", http.StatusInternalServerError)
			return
		}

		// Establecer el tipo de contenido y enviar la respuesta
		w.Header().Set("Content-Type", "application/json")
		w.Write(reporte)
	})

	// 6.1 Obtener asistencia de un estudiante específico
	http.HandleFunc("/api/db/attendance/student", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		seccionID, err := strconv.Atoi(r.URL.Query().Get("seccion_id"))
		if err != nil {
			log.Printf("Error al convertir seccion_id: %v", err)
			http.Error(w, "ID de sección inválido", http.StatusBadRequest)
			return
		}

		alumnoID, err := strconv.Atoi(r.URL.Query().Get("alumno_id"))
		if err != nil {
			log.Printf("Error al convertir alumno_id: %v", err)
			http.Error(w, "ID de alumno inválido", http.StatusBadRequest)
			return
		}

		// Verificar que el estudiante existe y está inscrito en la sección
		var exists bool
		err = db.QueryRow(`
			SELECT EXISTS (
				SELECT 1 
				FROM Inscripciones 
				WHERE AlumnoID = $1 AND SeccionID = $2
			)`, alumnoID, seccionID).Scan(&exists)

		if err != nil {
			log.Printf("Error al verificar inscripción: %v", err)
			http.Error(w, "Error al verificar la inscripción del estudiante", http.StatusInternalServerError)
			return
		}

		if !exists {
			http.Error(w, "El estudiante no está inscrito en esta sección", http.StatusNotFound)
			return
		}

		// Ejecutar la función directamente
		query := `SELECT * FROM obtener_asistencia_estudiante_seccion($1, $2)`
		var reporte []byte
		err = db.QueryRow(query, seccionID, alumnoID).Scan(&reporte)
		if err != nil {
			log.Printf("Error al obtener reporte de asistencia del estudiante: %v", err)
			http.Error(w, fmt.Sprintf("Error al obtener reporte de asistencia: %v", err), http.StatusInternalServerError)
			return
		}

		// Verificar que el reporte no esté vacío
		if len(reporte) == 0 {
			http.Error(w, "No se encontraron datos de asistencia", http.StatusNotFound)
			return
		}

		// Establecer el tipo de contenido y enviar la respuesta
		w.Header().Set("Content-Type", "application/json")
		w.Write(reporte)
	})

	// 7. Procesar estudiantes en lotes
	http.HandleFunc("/api/db/sections/students/batch", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Recibida petición POST en /api/db/sections/students/batch")

		if r.Method != http.MethodPost {
			log.Printf("Método no permitido: %s", r.Method)
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Leer el cuerpo de la petición
		body, err := io.ReadAll(r.Body)
		if err != nil {
			log.Printf("Error al leer el cuerpo de la petición: %v", err)
			http.Error(w, "Error reading request body", http.StatusBadRequest)
			return
		}
		log.Printf("Cuerpo de la petición recibido: %s", string(body))

		var request struct {
			Students []struct {
				ID             string `json:"id"`
				Nombre         string `json:"Nombre"`
				NombreCompleto string `json:"NombreCompleto"`
				Rut            string `json:"Rut"`
				Email          string `json:"Email"`
			} `json:"students"`
			Curso struct {
				Codigo string   `json:"codigo"`
				Nombre string   `json:"nombre"`
				Dias   []string `json:"dias"`
				Bloque string   `json:"bloque"`
			} `json:"curso"`
		}

		if err := json.Unmarshal(body, &request); err != nil {
			log.Printf("Error al decodificar JSON: %v", err)
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Obtener el ID del profesor del token o header
		profesorID := r.Header.Get("X-Profesor-ID")
		if profesorID == "" {
			http.Error(w, "ID de profesor no proporcionado", http.StatusBadRequest)
			return
		}

		profesorIDInt, err := strconv.Atoi(profesorID)
		if err != nil {
			http.Error(w, "ID de profesor inválido", http.StatusBadRequest)
			return
		}

		// Procesar el lote de estudiantes
		err = dbService.ProcesarLoteEstudiantes(request.Students, request.Curso, profesorIDInt)
		if err != nil {
			log.Printf("Error al procesar lote de estudiantes: %v", err)
			http.Error(w, fmt.Sprintf("Error al procesar estudiantes: %v", err), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Estudiantes procesados exitosamente"})
	})

	// Endpoint para registrar alumno
	http.HandleFunc("/api/db/alumno/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			Username string `json:"username"`
			Password string `json:"password"`
			Nombre   string `json:"nombre"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		err := dbService.RegistrarAlumno(req.Username, req.Password, req.Nombre)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Alumno registrado correctamente"})
	})

	log.Println("Server started on :8084")
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:8081", "http://localhost:8080", "http://localhost:8088", "http://192.168.206.9:8088"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization", "X-Profesor-ID"}),
		handlers.AllowCredentials(),
	)
	log.Fatal(http.ListenAndServe(":8084", corsHandler(http.DefaultServeMux)))
}
