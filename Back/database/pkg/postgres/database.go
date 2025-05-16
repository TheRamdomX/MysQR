package postgres

import (
	"database/pkg/models"
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

const (
	dbHost     = "localhost"
	dbPort     = 5432
	dbUser     = "postgres"
	dbPassword = "postgres"
	dbName     = "asistencia_db"
)

type DatabaseService struct {
	db *sql.DB
}

func CreateConnection() (*sql.DB, error) {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}

func NewDatabaseService(db *sql.DB) *DatabaseService {
	return &DatabaseService{db: db}
}

// 1. Obtener moduloID basado en la fecha y hora actual
func (s *DatabaseService) GetCurrentModuleID() (int, error) {
	query := `
		SELECT ID 
		FROM Modulos 
		WHERE Fecha = CURRENT_DATE
		AND HoraInicio <= CURRENT_TIME
		AND HoraFin >= CURRENT_TIME;
	`
	var moduleID int
	err := s.db.QueryRow(query).Scan(&moduleID)
	if err != nil {
		return 0, err
	}
	return moduleID, nil
}

// 2. Registro en QRGenerado con el ProfesorID
func (s *DatabaseService) RegisterQRGeneration(profesorID int) (int64, error) {
	moduleID, err := s.GetCurrentModuleID()
	if err != nil {
		return 0, err
	}

	query := `
		INSERT INTO QRGenerado (ProfesorID, ModuloID, FechaHora)
		VALUES ($1, $2, CURRENT_TIMESTAMP)
		RETURNING ID
	`
	var id int64
	err = s.db.QueryRow(query, profesorID, moduleID).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// 3. Obtener Secciones.ID y Asignaturas.Nombre usando el ProfesorID
func (s *DatabaseService) GetSectionsByProfessor(profesorID int) ([]models.SeccionAsignatura, error) {
	query := `
		SELECT s.ID, s.AsignaturaID, a.Nombre
		FROM Secciones s
		JOIN Asignaturas a ON s.AsignaturaID = a.ID
		WHERE s.ProfesorID = $1
	`
	rows, err := s.db.Query(query, profesorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sections []models.SeccionAsignatura
	for rows.Next() {
		var sec models.SeccionAsignatura
		err := rows.Scan(&sec.SeccionID, &sec.AsignaturaID, &sec.Nombre)
		if err != nil {
			return nil, err
		}
		sections = append(sections, sec)
	}
	return sections, nil
}

// 4. Registro en Asistencia (QR)
func (s *DatabaseService) RegisterAttendance(alumnoID, seccionID int) error {
	moduleID, err := s.GetCurrentModuleID()
	if err != nil {
		return err
	}

	query := `
		INSERT INTO Asistencia (AlumnoID, SeccionID, ModuloID, FechaRegistro, ManualInd)
		VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 0)
	`
	_, err = s.db.Exec(query, alumnoID, seccionID, moduleID)
	return err
}

// 4.1. Registro en Asistencia manual
func (s *DatabaseService) RegisterManualAttendance(alumnoID, seccionID, moduloID, ProfesorID int) error {
	query := `
		INSERT INTO Asistencia (AlumnoID, SeccionID, ProfesorID, ModuloID, FechaRegistro, ManualInd)
		VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 1)
	`
	_, err := s.db.Exec(query, alumnoID, seccionID, ProfesorID, moduloID)
	return err
}

// 5. Obtener SeccionesID y nombre de asignaturas con el AlumnoId
func (s *DatabaseService) GetSectionsByStudent(alumnoID int) ([]models.SeccionAsignatura, error) {
	query := `
		SELECT s.ID, s.AsignaturaID, a.Nombre
		FROM Secciones s
		JOIN Asignaturas a ON s.AsignaturaID = a.ID
		JOIN Inscripciones i ON s.ID = i.SeccionID
		WHERE i.AlumnoID = $1
	`
	rows, err := s.db.Query(query, alumnoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sections []models.SeccionAsignatura
	for rows.Next() {
		var sec models.SeccionAsignatura
		err := rows.Scan(&sec.SeccionID, &sec.AsignaturaID, &sec.Nombre)
		if err != nil {
			return nil, err
		}
		sections = append(sections, sec)
	}
	return sections, nil
}

// 6. Obtener registros de ReporteAsistencia
func (s *DatabaseService) GetAttendanceReport(seccionID, alumnoID int) ([]models.ReporteAsistencia, error) {
	query := `
		SELECT a.nombre , s.FechaRegistro
		FROM Asistencia s
		join Alumnos a on a.ID = s.AlumnoID
		WHERE SeccionID = $1 AND AlumnoID = $2
	`
	rows, err := s.db.Query(query, seccionID, alumnoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reports []models.ReporteAsistencia
	for rows.Next() {
		var report models.ReporteAsistencia
		err := rows.Scan(&report.Nombre, &report.FechaRegistro)
		if err != nil {
			return nil, err
		}
		reports = append(reports, report)
	}
	return reports, nil
}

// 3.1 Obtener ModuloID actual y SeccionID de ProgramacionClases para un profesor
func (s *DatabaseService) GetCurrentModuleAndSection(profesorID int) (*models.ModuloSeccion, error) {
	// Primero obtenemos el módulo actual
	moduleID, err := s.GetCurrentModuleID()
	if err != nil {
		return nil, fmt.Errorf("error getting current module: %w", err)
	}

	// Luego obtenemos la sección programada para este módulo y profesor
	query := `
		SELECT pc.SeccionID
		FROM ProgramacionClases pc
		WHERE pc.ProfesorID = $1 
		AND pc.ModuloID = $2
	`
	var seccionID int
	err = s.db.QueryRow(query, profesorID, moduleID).Scan(&seccionID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no hay clase programada para este módulo")
		}
		return nil, fmt.Errorf("error getting section: %w", err)
	}

	return &models.ModuloSeccion{
		ModuloID:  moduleID,
		SeccionID: seccionID,
	}, nil
}
