FROM golang:1.24 AS builder
WORKDIR /app
COPY qr/go.mod qr/go.sum ./
COPY database ./database
COPY qr/pkg ./pkg
COPY qr/cmd ./cmd
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o app ./cmd/main.go

FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache netcat-openbsd
COPY --from=builder /app/app .
EXPOSE 8080
CMD ["./app"]