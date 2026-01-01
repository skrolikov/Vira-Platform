.PHONY: build run test docker-up docker-down clean

build:
	go build -o bin/api ./cmd/api

run:
	go run cmd/api/main.go

test:
	go test -v ./...

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f api

clean:
	rm -rf bin/
	go clean

dev:
	docker-compose up -d postgres redis kafka zookeeper
	sleep 5
	go run cmd/api/main.go

