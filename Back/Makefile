.PHONY: help build vet fmt tidy run-qr run-teacher run-student run-database up down logs

help:
	@echo "build         compila los cuatro servicios"
	@echo "vet fmt tidy  chequeos estáticos y aseo de dependencias"
	@echo "run-<svc>     ejecuta un servicio en local (qr|teacher|student|database)"
	@echo "up down logs  orquestación con docker compose"

build:
	go build ./...

vet:
	go vet ./...

fmt:
	gofmt -w .

tidy:
	go mod tidy

run-qr:
	go run ./qr/cmd
run-teacher:
	go run ./teacher/cmd
run-student:
	go run ./student/cmd
run-database:
	go run ./database/cmd

up:
	docker compose up -d --build
down:
	docker compose down
logs:
	docker compose logs -f
