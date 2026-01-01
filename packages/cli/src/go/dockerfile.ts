export const dockerfile = `# ---- build stage ----
    FROM golang:1.21-alpine AS builder
    WORKDIR /app
    COPY go.mod go.sum ./
    RUN go mod download
    COPY . .
    RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/bin/vira-api ./cmd/api
    
    # ---- runtime stage ----
    FROM gcr.io/distroless/base-debian12:nonroot
    WORKDIR /app
    COPY --from=builder /app/bin/vira-api /app/vira-api
    COPY config ./config
    EXPOSE 8080
    ENTRYPOINT ["/app/vira-api"]
    `;