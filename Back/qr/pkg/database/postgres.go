package database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

var db *sql.DB

func InitDB() error {
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
		return err
	}

	return db.Ping()
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func ValidateUser(username, password string) (*User, error) {
	query := `
		SELECT id, username, password, role 
		FROM users 
		WHERE username = $1 AND password = $2
	`

	var user User
	err := db.QueryRow(query, username, password).Scan(
		&user.ID,
		&user.Username,
		&user.Password,
		&user.Role,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("invalid credentials")
	}

	if err != nil {
		return nil, fmt.Errorf("database error: %v", err)
	}

	return &user, nil
}
