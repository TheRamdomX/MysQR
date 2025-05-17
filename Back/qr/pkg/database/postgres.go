package database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

type User struct {
	ID         int    `json:"id"`
	Username   string `json:"username"`
	Password   string `json:"password"`
	Role       string `json:"role"`
	Rut        int    `json:"rut"`
	ProfesorID *int   `json:"profesor_id,omitempty"`
	AlumnoID   *int   `json:"alumno_id,omitempty"`
}

var db *sql.DB

func CreateConnection() (*sql.DB, error) {
	host := getEnv("DB_HOST", "database")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "mysqr")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		return nil, err
	}

	return db, nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func ValidateUser(username, password, rol string) (*User, error) {
	if db == nil {
		return nil, fmt.Errorf("conexión a la base de datos no inicializada")
	}

	query := `
		SELECT id, username, password_hash, rol, rut, ProfesorID, AlumnoID
		FROM AUTH 
		WHERE username = $1 AND password_hash = $2 AND rol = $3
	`

	var user User
	err := db.QueryRow(query, username, password, rol).Scan(
		&user.ID,
		&user.Username,
		&user.Password,
		&user.Role,
		&user.Rut,
		&user.ProfesorID,
		&user.AlumnoID,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("credenciales inválidas")
	}

	if err != nil {
		return nil, fmt.Errorf("error de base de datos: %v", err)
	}

	return &user, nil
}
