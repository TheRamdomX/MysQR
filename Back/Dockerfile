# Dockerfile único para los cuatro servicios.
# Se elige cuál construir con: --build-arg SERVICE=qr|teacher|student|database
FROM golang:1.24 AS builder
ARG SERVICE
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/app ./${SERVICE}/cmd

FROM alpine:latest
WORKDIR /app
COPY --from=builder /out/app .
COPY migrations ./migrations
CMD ["./app"]
