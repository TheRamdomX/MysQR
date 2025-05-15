FROM golang:1.22 AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o database ./cmd/main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/database .
COPY --from=builder /app/migrations ./migrations
CMD ["./database"]