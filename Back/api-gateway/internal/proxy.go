package proxy

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"github.com/gin-gonic/gin"
)

func forward(c *gin.Context, target string) {
	remote, err := url.Parse(target)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid target"})
		return
	}
	proxy := httputil.NewSingleHostReverseProxy(remote)
	proxy.ServeHTTP(c.Writer, c.Request)
}

/*func ToAuth(c *gin.Context) {
	forward(c, "http://authentication:8083")
}*/

func ToStudent(c *gin.Context) {
	forward(c, "http://student:8082")
}

func ToTeacher(c *gin.Context) {
	forward(c, "http://teacher:8081")
}

func ToQR(c *gin.Context) {
	forward(c, "http://qr:8080")
}

func ToDB(c *gin.Context) {
	forward(c, "http://database:8084")
}
