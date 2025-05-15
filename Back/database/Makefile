.PHONY: build run docker-build docker-run

build:
	go build -o database ./cmd/main.go

run:
	./database

docker-build:
	docker build -t database-service .

docker-run:
	docker run --network=host database-service