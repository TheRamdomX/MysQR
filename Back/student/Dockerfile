FROM golang:1.24 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o student-service ./cmd/student-service

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/student-service .
COPY --from=builder /app/.env .
EXPOSE 8082
CMD ["./student-service"]