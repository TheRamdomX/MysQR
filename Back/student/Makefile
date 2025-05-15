.PHONY: install build run test docker-build docker-run clean
install:
	go mod init student
	go mod tidy
build:
	go build -o student-service ./cmd/main.go
run:
	go run ./cmd/main.go
test:
	go test -v ./...
docker-build:
	sudo docker build -t student-service .
docker-run:
	sudo docker run -p 8080:8080 student-service
clean:
	rm -f qr-service
