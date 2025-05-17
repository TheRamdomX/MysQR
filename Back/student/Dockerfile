FROM golang:1.24 AS builder
WORKDIR /app
COPY student/go.mod student/go.sum ./
COPY database ./database
COPY student/pkg ./pkg
COPY student/cmd ./cmd
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o app ./cmd/main.go

FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache netcat-openbsd
COPY --from=builder /app/app .
EXPOSE 8082
CMD ["./app"]