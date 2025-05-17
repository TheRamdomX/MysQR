FROM golang:1.24 AS builder
WORKDIR /app
COPY go.mod go.sum ./
COPY pkg ./pkg
COPY cmd ./cmd
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o app ./cmd/main.go

FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache netcat-openbsd
COPY --from=builder /app/app .
COPY migrations ./migrations
EXPOSE 8084
CMD ["./app"]