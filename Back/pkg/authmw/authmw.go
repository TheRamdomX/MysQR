package authmw

import (
	"net/http"
	"strings"

	"mysqr/qr/pkg/auth"

	"github.com/gin-gonic/gin"
)

const claimsKey = "claims"

// RequireAuth exige un JWT válido en "Authorization: Bearer <token>" y deja
// los claims disponibles en el contexto vía Claims(c).
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Falta token de autorización"})
			return
		}
		tokenString := strings.TrimPrefix(header, "Bearer ")

		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido o expirado"})
			return
		}

		c.Set(claimsKey, claims)
		c.Next()
	}
}

// Claims recupera los claims del JWT guardados por RequireAuth.
func Claims(c *gin.Context) *auth.Claims {
	claims, _ := c.Get(claimsKey)
	if claims == nil {
		return nil
	}
	return claims.(*auth.Claims)
}
