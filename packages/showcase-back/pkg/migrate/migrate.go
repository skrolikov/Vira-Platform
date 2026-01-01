package migrate

import (
	"database/sql"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/lib/pq"
)

type Migration struct {
	Version     string
	Description string
	UpPath      string
	DownPath    string
}

type Migrator struct {
	db            *sql.DB
	migrationsDir string
}

func NewMigrator(db *sql.DB, migrationsDir string) *Migrator {
	return &Migrator{
		db:            db,
		migrationsDir: migrationsDir,
	}
}

func (m *Migrator) EnsureMigrationsTable() error {
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	_, err := m.db.Exec(query)
	return err
}

func (m *Migrator) GetAppliedMigrations() (map[string]bool, error) {
	applied := make(map[string]bool)
	rows, err := m.db.Query("SELECT version FROM schema_migrations ORDER BY version")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var version string
		if err := rows.Scan(&version); err != nil {
			return nil, err
		}
		applied[version] = true
	}
	return applied, nil
}

func (m *Migrator) LoadMigrations() ([]Migration, error) {
	var migrations []Migration
	migrationsMap := make(map[string]*Migration)

	err := filepath.WalkDir(m.migrationsDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		filename := d.Name()
		if !strings.HasSuffix(filename, ".sql") {
			return nil
		}

		parts := strings.Split(filename, "_")
		if len(parts) < 2 {
			return nil
		}

		version := parts[0]
		rest := strings.Join(parts[1:], "_")
		rest = strings.TrimSuffix(rest, ".sql")

		var desc string
		var direction string

		if strings.HasSuffix(rest, ".up") {
			desc = strings.TrimSuffix(rest, ".up")
			direction = "up"
		} else if strings.HasSuffix(rest, ".down") {
			desc = strings.TrimSuffix(rest, ".down")
			direction = "down"
		} else {
			return nil
		}

		if migrationsMap[version] == nil {
			migrationsMap[version] = &Migration{
				Version:     version,
				Description: desc,
			}
		}

		if direction == "up" {
			migrationsMap[version].UpPath = path
		} else {
			migrationsMap[version].DownPath = path
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	for _, mig := range migrationsMap {
		migrations = append(migrations, *mig)
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

func (m *Migrator) ReadSQLFile(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func (m *Migrator) ApplyMigration(migration Migration) error {
	if migration.UpPath == "" {
		return fmt.Errorf("no up migration file for version %s", migration.Version)
	}

	sql, err := m.ReadSQLFile(migration.UpPath)
	if err != nil {
		return fmt.Errorf("failed to read migration file: %w", err)
	}

	tx, err := m.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(sql); err != nil {
		return fmt.Errorf("failed to execute migration %s: %w", migration.Version, err)
	}

	if _, err := tx.Exec(
		"INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING",
		migration.Version,
	); err != nil {
		return fmt.Errorf("failed to record migration: %w", err)
	}

	return tx.Commit()
}

func (m *Migrator) RollbackMigration(migration Migration) error {
	if migration.DownPath == "" {
		return fmt.Errorf("no down migration file for version %s", migration.Version)
	}

	sql, err := m.ReadSQLFile(migration.DownPath)
	if err != nil {
		return fmt.Errorf("failed to read migration file: %w", err)
	}

	tx, err := m.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(sql); err != nil {
		return fmt.Errorf("failed to execute rollback %s: %w", migration.Version, err)
	}

	if _, err := tx.Exec("DELETE FROM schema_migrations WHERE version = $1", migration.Version); err != nil {
		return fmt.Errorf("failed to remove migration record: %w", err)
	}

	return tx.Commit()
}

func (m *Migrator) Migrate() error {
	if err := m.EnsureMigrationsTable(); err != nil {
		return err
	}

	migrations, err := m.LoadMigrations()
	if err != nil {
		return err
	}

	applied, err := m.GetAppliedMigrations()
	if err != nil {
		return err
	}

	for _, migration := range migrations {
		if applied[migration.Version] {
			fmt.Printf("✓ Migration %s already applied\n", migration.Version)
			continue
		}

		fmt.Printf("→ Applying migration %s: %s\n", migration.Version, migration.Description)
		if err := m.ApplyMigration(migration); err != nil {
			return err
		}
		fmt.Printf("✓ Applied migration %s\n", migration.Version)
	}

	return nil
}

func (m *Migrator) Rollback() error {
	if err := m.EnsureMigrationsTable(); err != nil {
		return err
	}

	migrations, err := m.LoadMigrations()
	if err != nil {
		return err
	}

	if len(migrations) == 0 {
		return fmt.Errorf("no migrations found")
	}

	lastMigration := migrations[len(migrations)-1]
	fmt.Printf("→ Rolling back migration %s: %s\n", lastMigration.Version, lastMigration.Description)

	return m.RollbackMigration(lastMigration)
}

func (m *Migrator) Status() error {
	if err := m.EnsureMigrationsTable(); err != nil {
		return err
	}

	migrations, err := m.LoadMigrations()
	if err != nil {
		return err
	}

	applied, err := m.GetAppliedMigrations()
	if err != nil {
		return err
	}

	fmt.Println("\nMigration Status:")
	fmt.Println("=================")

	for _, migration := range migrations {
		status := "❌ Pending"
		if applied[migration.Version] {
			status = "✓ Applied"
		}
		fmt.Printf("%s %s: %s\n", status, migration.Version, migration.Description)
	}

	return nil
}
