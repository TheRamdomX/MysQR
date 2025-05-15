.PHONY: install build run test docker-build docker-run clean
install:
	go mod init teacher
	go mod tidy
build:
	go build -o teacher-service ./cmd/main.go
run:
	go run ./cmd/main.go
test:
	go test -v ./...
docker-build:
	sudo docker build -t teacher-service .
docker-run:
	sudo docker run -p 8080:8080 teacher-service
clean:
	rm -f teacher-service
