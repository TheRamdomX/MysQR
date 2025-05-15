package main

import (
	"log"
	"net/http"
	"qr/pkg/listeners"
)

func main() {
	go listeners.StartCommandListener()
	go listeners.StartValidationListener()

	log.Fatal(http.ListenAndServe(":8080", nil))
}
