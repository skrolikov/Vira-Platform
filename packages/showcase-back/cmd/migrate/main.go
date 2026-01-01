package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"showcase-back/pkg/config"
	"showcase-back/pkg/database"
	"showcase-back/pkg/migrate"

	_ "github.com/lib/pq"
)

func main() {
	var (
		command       = flag.String("cmd", "migrate", "Command: migrate, rollback, status")
		dbURL         = flag.String("db-url", "", "Database URL (overrides env vars)")
		migrationsDir = flag.String("migrations", "./migrations", "Migrations directory")
	)
	flag.Parse()

	// Load config if db-url not provided
	if *dbURL == "" {
		config.Load()
	}

	// Connect to database
	var err error

	if *dbURL != "" {
		err = database.ConnectWithURL(*dbURL)
		if err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
	} else {
		err = database.Connect()
		if err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
	}

	db := database.DB

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	migrator := migrate.NewMigrator(db, *migrationsDir)

	switch *command {
	case "migrate", "up":
		if err := migrator.Migrate(); err != nil {
			log.Fatalf("Migration failed: %v", err)
		}
		fmt.Println("\n✅ All migrations applied successfully")

	case "rollback", "down":
		if err := migrator.Rollback(); err != nil {
			log.Fatalf("Rollback failed: %v", err)
		}
		fmt.Println("\n✅ Rollback completed successfully")

	case "status":
		if err := migrator.Status(); err != nil {
			log.Fatalf("Status check failed: %v", err)
		}

	default:
		fmt.Printf("Unknown command: %s\n", *command)
		fmt.Println("Available commands: migrate (up), rollback (down), status")
		os.Exit(1)
	}
}
