export const sqlcYaml = `version: "2"
sql:
  - engine: "postgresql"
    schema: "migrations"
    queries: "queries"
    gen:
      go:
        package: "gen"
        out: "internal/db/gen"
        sql_package: "pgx/v5"
        emit_interface: true
        emit_db_tags: true
        emit_empty_slices: true
`;