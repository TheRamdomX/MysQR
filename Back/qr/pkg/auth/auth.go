package auth

import (
	"database/sql"
	"errors"
	"net/http"
	"time"

	"mysqr/qr/pkg/database"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var (
	secretKey = []byte("mysqr-secret-key-2024") // En producción, esto debería venir de variables de entorno
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Rol      string `json:"rol"`
}

type LoginResponse struct {
	Token      string `json:"token"`
	Rol        string `json:"rol"`
	ID         int    `json:"id"`
	Rut        int    `json:"rut"`
	ProfesorID *int   `json:"profesor_id,omitempty"`
	AlumnoID   *int   `json:"alumno_id,omitempty"`
}

type Claims struct {
	UserID     int    `json:"user_id"`
	Rol        string `json:"rol"`
	Rut        int    `json:"rut"`
	ProfesorID *int   `json:"profesor_id,omitempty"`
	AlumnoID   *int   `json:"alumno_id,omitempty"`
	jwt.RegisteredClaims
}

func ValidateLogin(username, password, rol string, db *sql.DB) (*LoginResponse, error) {
	user, err := database.ValidateUser(username, password, rol)
	if err != nil {
		return nil, err
	}

	return generateToken(user.ID, user.Role, user.Rut, user.ProfesorID, user.AlumnoID)
}

func generateToken(userID int, rol string, rut int, profesorID, alumnoID *int) (*LoginResponse, error) {
	claims := &Claims{
		UserID:     userID,
		Rol:        rol,
		Rut:        rut,
		ProfesorID: profesorID,
		AlumnoID:   alumnoID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token:      tokenString,
		Rol:        rol,
		ID:         userID,
		Rut:        rut,
		ProfesorID: profesorID,
		AlumnoID:   alumnoID,
	}, nil
}

func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("token inválido")
	}

	return claims, nil
}

func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cuerpo de la solicitud inválido"})
		return
	}

	db, err := database.CreateConnection()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error de conexión a la base de datos"})
		return
	}
	defer db.Close()

	response, err := ValidateLogin(req.Username, req.Password, req.Rol, db)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
