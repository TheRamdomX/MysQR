FROM golang:1.24 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o qr-service ./cmd/qr-service

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/qr-service .
COPY --from=builder /app/.env .
EXPOSE 8080
CMD ["./qr-service"]