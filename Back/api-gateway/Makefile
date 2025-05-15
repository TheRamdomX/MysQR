.PHONY: install build run docker-build docker-run clean

install:
	go mod init api-gateway
	go mod tidy

build:
	go build -o gateway ./cmd

run:
	go run ./cmd/main.go

docker-build:
	docker build -t api-gateway .

docker-run:
	docker run -p 8088:8088 api-gateway

clean:
	rm -f gateway
