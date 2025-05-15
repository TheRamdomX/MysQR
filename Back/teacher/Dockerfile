FROM golang:1.24 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o teacher-service ./cmd/teacher-service

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/teacher-service .
COPY --from=builder /app/.env .
EXPOSE 8081
CMD ["./teacher-service"]