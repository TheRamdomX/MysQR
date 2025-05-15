.PHONY: install build run test docker-build docker-run clean
install:
	go mod init qr
	go mod tidy
build:
	go build -o qr-service ./cmd/main.go
run:
	go run ./cmd/main.go
test:
	go test -v ./...
docker-build:
	sudo docker build -t qr-service .
docker-run:
	sudo docker run -p 8080:8080 qr-service
clean:
	rm -f qr-service
