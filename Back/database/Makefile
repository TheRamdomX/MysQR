.PHONY: build run docker-build docker-run

build:
	go build -o database ./cmd/main.go

run:
	go run ./cmd/main.go

docker-build:
	docker build -t database-service .

docker-run:
	docker run --network=host database-service