#!/usr/bin/env node

/**
 * Vira CLI - Генератор проектов и компонентов
 * 
 * @example
 * npx vira create project
 * npx vira generate service user
 * npx vira generate component Button
 */

import { Command } from "commander";
import * as fs from "fs-extra";
import * as path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { backendReadme } from "./go/backendReadme";
import { backendEnvExample } from "./go/backendEnvExample";
import { dockerfile } from "./go/dockerfile";
import { kafkaYaml } from "./go/kafkaYaml";
import { redisYaml } from "./go/redisYaml";
import { dbYaml } from "./go/dbYaml";
import { appYaml } from "./go/appYaml";
import { typesGo } from "./go/typesGo";
import { kafkaGo } from "./go/kafkaGo";
import { redisGo } from "./go/redisGo";
import { sqlcYaml } from "./go/sqlcYaml";
import { dbGo } from "./go/dbGo";
import { configGo } from "./go/configGo";
import { mainGo } from "./go/mainGo";
import { goMod } from "./go/goMod";
import { channelHelpers } from "./go/channelHelpers";
import { eventsAPI } from "./go/eventsAPI";
import { eventHandlerTemplate } from "./go/eventHandlerTemplate";
import { registryGo } from "./go/registryGo";
import { stateStore } from "./go/stateStore";
import { appTsx } from "./react/appTsx";
import { kanbanAppTsx } from "./react/kanbanAppTsx";
import { kanbanModels } from "./react/kanbanModels";
import { kanbanService } from "./react/kanbanService";
import { kanbanBoard } from "./react/kanbanBoard";
import { kanbanColumn } from "./react/kanbanColumn";
import { kanbanCard } from "./react/kanbanCard";
import { kanbanHandlers } from "./go/kanbanHandlers";
import { mainTsx } from "./react/mainTsx";
import { indexCss } from "./react/indexCss";
import { indexHtml } from "./react/indexHtml";
import { envExample } from "./react/envExample";
import { envLocal } from "./react/envLocal";
import { viteConfig } from "./react/viteConfig";
import { tsconfig } from "./react/tsconfig";
import { dockerCompose } from "./go/dockerCompose";
import { dockerComposeProd } from "./go/dockerComposeProd";
import { readme } from "./go/readme";

const program = new Command();

program
  .name("vira")
  .description("ViraJS CLI - Create projects and generate code")
  .version("1.2.0");

type TemplateType = "frontend" | "fullstack" | "kanban";
const SUPPORTED_TEMPLATES: TemplateType[] = ["frontend", "fullstack", "kanban"];

/**
 * Инициализация проекта в текущей директории
 */
program
  .command("init")
  .description("Initialize a Vira project in the current directory")
  .option(
    "-t, --template <template>",
    "Template type (frontend|fullstack|kanban). If not specified, interactive selection will be shown."
  )
  .action(async (options: { template?: string }) => {
    const projectPath = process.cwd();
    const projectName = path.basename(projectPath);

    // Проверяем, не пуста ли директория
    const files = await fs.readdir(projectPath);
    const ignoreFiles = ['.git', '.gitignore', 'node_modules', '.DS_Store'];
    const visibleFiles = files.filter(f => !ignoreFiles.includes(f) && !f.startsWith('.'));

    if (visibleFiles.length > 0) {
      const { proceed } = await inquirer.prompt([
        {
          type: "confirm",
          name: "proceed",
          message: `Directory is not empty. Continue anyway?`,
          default: false,
        },
      ]);
      if (!proceed) {
        console.log(chalk.yellow("Init cancelled."));
        process.exit(0);
      }
    }

    console.log(chalk.blue(`\nInitializing Vira project in: ${projectPath}\n`));

    // Интерактивный выбор шаблона, если не указан
    let template: TemplateType;
    if (options.template) {
      template = options.template as TemplateType;
      if (!SUPPORTED_TEMPLATES.includes(template)) {
        console.error(
          chalk.red(
            `Unknown template: ${template}. Use one of: ${SUPPORTED_TEMPLATES.join(
              ", "
            )}`
          )
        );
        process.exit(1);
      }
    } else {
      const { selectedTemplate } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedTemplate",
          message: "Select a template:",
          choices: [
            {
              name: "Frontend (React + Vite + Vira UI)",
              value: "frontend",
              short: "frontend",
            },
            {
              name: "Fullstack (Frontend + Go Backend + Docker)",
              value: "fullstack",
              short: "fullstack",
            },
            {
              name: "Kanban (Reference app with VRP)",
              value: "kanban",
              short: "kanban",
            },
          ],
          default: "frontend",
        },
      ]);
      template = selectedTemplate as TemplateType;
    }

    // Создаём структуру проекта
    await createProjectStructure(projectPath, template);

    console.log(chalk.green(`\n✓ Project initialized successfully!\n`));
    printNextSteps(projectName, template, true);
  });

/**
 * Создание проекта
 */
program
  .command("create")
  .description("Create a new Vira project")
  .argument("<name>", "Project name")
  .option(
    "-t, --template <template>",
    "Template type (frontend|fullstack|kanban). If not specified, interactive selection will be shown."
  )
  .action(async (name: string, options: { template?: string }) => {
    console.log(chalk.blue(`\nCreating Vira project: ${name}\n`));

    const projectPath = path.resolve(process.cwd(), name);

    // Интерактивный выбор шаблона, если не указан
    let template: TemplateType;
    if (options.template) {
      template = options.template as TemplateType;
      if (!SUPPORTED_TEMPLATES.includes(template)) {
        console.error(
          chalk.red(
            `Unknown template: ${template}. Use one of: ${SUPPORTED_TEMPLATES.join(
              ", "
            )}`
          )
        );
        process.exit(1);
      }
    } else {
      // Интерактивный выбор как в Vite
      const { selectedTemplate } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedTemplate",
          message: "Select a template:",
          choices: [
            {
              name: "Frontend (React + Vite + Vira UI)",
              value: "frontend",
              short: "frontend",
            },
            {
              name: "Fullstack (Frontend + Go Backend + Docker)",
              value: "fullstack",
              short: "fullstack",
            },
            {
              name: "Kanban (Reference app with VRP)",
              value: "kanban",
              short: "kanban",
            },
          ],
          default: "frontend",
        },
      ]);
      template = selectedTemplate as TemplateType;
    }

    // Проверяем, существует ли директория
    if (await fs.pathExists(projectPath)) {
      console.error(chalk.red(`Directory ${name} already exists!`));
      process.exit(1);
    }

    // Создаём структуру проекта
    await createProjectStructure(projectPath, template);

    console.log(chalk.green(`\n✓ Project ${name} created successfully!\n`));
    printNextSteps(name, template);
  });

/**
 * Генерация компонента
 */
program
  .command("generate")
  .alias("g")
  .description("Generate code")
  .argument("<type>", "Type: component, service, page, model, route, test")
  .argument("<name>", "Name")
  .option("-d, --dir <directory>", "Output directory", "src")
  .option("-i, --interactive", "Interactive mode (for components and services)", false)
  .option("--vrp", "Use Vira Reactive Protocol (VRP)", false)
  .option("--no-vrp", "Do not use VRP (explicit)", false)
  .action(async (type: string, name: string, options: { dir: string; interactive?: boolean; vrp?: boolean; noVrp?: boolean }) => {
    console.log(chalk.blue(`Generating ${type}: ${name}`));

    switch (type) {
      case "component":
      case "comp":
        await generateComponent(name, options.dir, {
          interactive: options.interactive ?? false,
          useVRP: options.vrp ? true : options.noVrp ? false : undefined,
        });
        break;
      case "service":
        await generateService(name, options.dir, {
          interactive: options.interactive ?? false,
          useVRP: options.vrp ? true : options.noVrp ? false : undefined,
        });
        break;
      case "page":
        await generatePage(name, options.dir);
        break;
      case "model":
        await generateModel(name, options.dir);
        break;
      case "route":
        await generateRoute(name, options.dir);
        break;
      case "test":
        await generateTest(name, options.dir);
        break;
      default:
        console.error(chalk.red(`Unknown type: ${type}`));
        process.exit(1);
    }

    console.log(chalk.green(`✓ ${type} ${name} generated successfully!`));
  });

/**
 * Генерация Go-заготовок (backend)
 */
const make = program.command("make").description("Backend scaffolding (Go)");

make
  .command("handler")
  .description("Create Go HTTP handler")
  .argument("<name>", "Handler name (e.g. user)")
  .option(
    "-d, --dir <directory>",
    "Target directory",
    path.join("backend", "internal", "handlers")
  )
  .action(async (name: string, options: { dir: string }) => {
    await generateGoHandler(name, options.dir);
    console.log(chalk.green(`✓ handler ${name} created in ${options.dir}`));
  });

make
  .command("migration")
  .description("Create SQL migration (up/down)")
  .argument("<name>", "Migration name, kebab-case (e.g. create-users)")
  .option("-d, --dir <directory>", "Target directory", "migrations")
  .action(async (name: string, options: { dir: string }) => {
    await generateMigration(name, options.dir);
    console.log(chalk.green(`✓ migration ${name} created in ${options.dir}`));
  });

// Команды для выполнения миграций
const dbCommand = program
  .command("db")
  .description("Database migration commands");

dbCommand
  .command("migrate")
  .alias("up")
  .description("Run database migrations")
  .option("-d, --dir <directory>", "Migrations directory", "migrations")
  .option("--db-url <url>", "Database connection URL (or use DATABASE_URL env var)")
  .option("--driver <driver>", "Database driver (postgres, mysql, sqlite3)", "postgres")
  .action(async (options: { dir?: string; dbUrl?: string; driver?: string }) => {
    await runMigrations(options.dir || "migrations", options.dbUrl, options.driver || "postgres", "up");
  });

dbCommand
  .command("rollback")
  .alias("down")
  .description("Rollback last migration")
  .option("-d, --dir <directory>", "Migrations directory", "migrations")
  .option("--db-url <url>", "Database connection URL (or use DATABASE_URL env var)")
  .option("--driver <driver>", "Database driver (postgres, mysql, sqlite3)", "postgres")
  .action(async (options: { dir?: string; dbUrl?: string; driver?: string }) => {
    await runMigrations(options.dir || "migrations", options.dbUrl, options.driver || "postgres", "down");
  });

dbCommand
  .command("status")
  .description("Show migration status")
  .option("-d, --dir <directory>", "Migrations directory", "migrations")
  .option("--db-url <url>", "Database connection URL (or use DATABASE_URL env var)")
  .option("--driver <driver>", "Database driver (postgres, mysql, sqlite3)", "postgres")
  .action(async (options: { dir?: string; dbUrl?: string; driver?: string }) => {
    await showMigrationStatus(options.dir || "migrations", options.dbUrl, options.driver || "postgres");
  });

dbCommand
  .command("seed")
  .description("Run database seeds")
  .option("-d, --dir <directory>", "Seeds directory", "seeds")
  .option("--db-url <url>", "Database connection URL (or use DATABASE_URL env var)")
  .option("--driver <driver>", "Database driver (postgres, mysql, sqlite3)", "postgres")
  .action(async (options: { dir?: string; dbUrl?: string; driver?: string }) => {
    await runSeeds(options.dir || "seeds", options.dbUrl, options.driver || "postgres");
  });

make
  .command("event")
  .description("Create Go event handler stub")
  .argument("<name>", "Event name, e.g. task.update")
  .option(
    "-d, --dir <directory>",
    "Target directory",
    path.join("backend", "internal", "events")
  )
  .action(async (name: string, options: { dir: string }) => {
    await generateEventHandler(name, options.dir);
    console.log(chalk.green(`✓ event handler ${name} created in ${options.dir}`));
  });

make
  .command("model")
  .description("Create a Go model struct")
  .argument("<name>", "Model name (e.g. Client)")
  .option(
    "-d, --dir <directory>",
    "Target directory",
    path.join("backend", "internal", "models")
  )
  .option(
    "-f, --fields <fields>",
    "Comma-separated field definitions (e.g. 'name:string,email:string,phone:string')"
  )
  .action(async (name: string, options: { dir: string; fields?: string }) => {
    await generateGoModel(name, options.dir, options.fields || undefined);
    console.log(chalk.green(`✓ Go model ${name} created in ${options.dir}`));
  });

make
  .command("crud")
  .description("Create CRUD handlers for a resource")
  .argument("<name>", "Resource name (e.g. user)")
  .option(
    "-d, --dir <directory>",
    "Target directory",
    path.join("backend", "internal", "handlers")
  )
  .option(
    "-m, --model <model>",
    "Model name (defaults to capitalized resource name)"
  )
  .action(async (name: string, options: { dir: string; model?: string }) => {
    await generateCRUDHandler(name, options.dir, options.model);
    console.log(chalk.green(`✓ CRUD handlers for ${name} created in ${options.dir}`));
  });

const protoCommand = program
  .command("proto")
  .description("VRP (Vira Reactive Protocol) utilities");

protoCommand
  .command("validate")
  .description("Validate VRP protocol schema and types")
  .option("--file <path>", "Path to types file", path.join("backend", "internal", "types", "types.go"))
  .action(async (options: { file?: string }) => {
    const typesPath = path.resolve(process.cwd(), options.file || path.join("backend", "internal", "types", "types.go"));

    try {
      if (await fs.pathExists(typesPath)) {
        const content = await fs.readFile(typesPath, "utf8");
        const structs = parseGoStructs(content);

        if (structs.length === 0) {
          console.log(chalk.yellow("⚠ No Go structs found in types file"));
        } else {
          console.log(chalk.green(`✓ VRP v0.1 protocol schema validated`));
          console.log(chalk.gray(`  Found ${structs.length} type(s): ${structs.map(s => s.name).join(", ")}`));
          console.log(chalk.gray("  See VIRA_PROTOCOL.md for full specification"));
        }
      } else {
        console.log(chalk.yellow(`⚠ Types file not found: ${typesPath}`));
        console.log(chalk.gray("  VRP protocol schema structure is valid"));
      }
    } catch (error) {
      console.log(chalk.yellow("⚠ Could not validate types file"));
      console.log(chalk.gray("  VRP protocol schema structure is valid"));
    }
  });

protoCommand
  .command("generate")
  .description("Generate protocol documentation and channel helpers")
  .option("--file <path>", "Path to types file", path.join("backend", "internal", "types", "types.go"))
  .option("--output <path>", "Output directory", "docs")
  .action(async (options: { file?: string; output?: string }) => {
    const typesPath = path.resolve(process.cwd(), options.file || path.join("backend", "internal", "types", "types.go"));
    const outputDir = path.resolve(process.cwd(), options.output || "docs");

    try {
      if (await fs.pathExists(typesPath)) {
        const content = await fs.readFile(typesPath, "utf8");
        const structs = parseGoStructs(content);

        await fs.ensureDir(outputDir);

        // Генерируем документацию по каналам
        const channelDocs = generateChannelDocumentation(structs);
        await fs.writeFile(path.join(outputDir, "VRP_CHANNELS.md"), channelDocs);

        console.log(chalk.green(`✓ VRP protocol docs generated`));
        console.log(chalk.gray(`  Channels: ${outputDir}/VRP_CHANNELS.md`));
        console.log(chalk.gray(`  Protocol version: v0.1`));
        console.log(chalk.gray(`  Types: ${structs.length}`));
      } else {
        console.log(chalk.yellow(`⚠ Types file not found: ${typesPath}`));
        console.log(chalk.gray("  Generating basic protocol documentation"));

        await fs.ensureDir(outputDir);
        const basicDocs = `# Vira Reactive Protocol (VRP)

Protocol version: v0.1

## Overview

VRP is a WebSocket-based protocol for real-time state synchronization.

## Message Types

- \`handshake\` - Initial connection
- \`ack\` - Acknowledgment
- \`sub\` - Subscribe to channel
- \`unsub\` - Unsubscribe from channel
- \`update\` - Full state update
- \`event\` - Event notification
- \`diff\` - Partial state update
- \`ping\` / \`pong\` - Keep-alive
- \`error\` - Error message

See VIRA_PROTOCOL.md for full specification.
`;
        await fs.writeFile(path.join(outputDir, "VRP_CHANNELS.md"), basicDocs);
        console.log(chalk.green(`✓ Basic VRP protocol docs: ${outputDir}/VRP_CHANNELS.md`));
      }
    } catch (error) {
      console.error(chalk.red("✗ Error generating documentation"));
      if (error instanceof Error) {
        console.error(chalk.red(`  ${error.message}`));
      }
    }
  });

program
  .command("doc")
  .description("Generate CLI docs into docs/cli.md")
  .action(async () => {
    const info = program.helpInformation();
    const doc = `# Vira CLI Commands

\`\`\`
${info}
\`\`\`
`;
    const docsDir = path.join(process.cwd(), "docs");
    await fs.ensureDir(docsDir);
    const target = path.join(docsDir, "cli.md");
    await fs.writeFile(target, doc);
    console.log(chalk.green(`✓ CLI docs generated at ${target}`));
  });

program
  .command("sync")
  .description("Sync artifacts between backend and frontend")
  .option("--types", "Sync TypeScript types from Go structs", true)
  .option("--backend <path>", "Path to Go types file", path.join("backend", "internal", "types", "types.go"))
  .option("--from-models", "Generate TS types from Go models directory (backend/internal/models)", false)
  .option("--models <path>", "Path to Go models directory", path.join("backend", "internal", "models"))
  .option("--frontend <path>", "Output TS types path (frontend)", path.join("frontend", "src", "vira-types.ts"))
  .option("--ui <path>", "Output TS types path (ui)", path.join("ui", "src", "vira-types.ts"))
  .option("-w, --watch", "Watch mode: automatically sync on file changes", false)
  .action(async (options) => {
    if (options.types) {
      if (options.watch) {
        console.log(chalk.yellow("Watch mode is not yet implemented. Running once..."));
        await syncTypes(options);
      } else {
        await syncTypes(options);
      }
    } else {
      console.log(chalk.yellow("Nothing to sync. Use --types to sync TypeScript types."));
    }
  });

program
  .command("validate")
  .description("Validate project structure and configuration")
  .action(async () => {
    await validateProject();
  });

program.parse(process.argv);

/**
 * Создание структуры проекта
 */
async function createProjectStructure(
  projectPath: string,
  template: TemplateType
) {
  if (template === "fullstack") {
    await createFullstackProject(projectPath);
    return;
  }

  if (template === "kanban") {
    await createKanbanProject(projectPath);
    return;
  }

  // Default: frontend-only project
  await createFrontendProject(projectPath);
}

/**
 * Создание fullstack-структуры (frontend + backend + инфраструктура)
 */
async function createFullstackProject(projectPath: string) {
  const frontendPath = path.join(projectPath, "frontend");
  const backendPath = path.join(projectPath, "backend");
  const uiPath = path.join(projectPath, "ui");
  const pluginsPath = path.join(projectPath, "plugins");
  const migrationsPath = path.join(projectPath, "migrations");
  const deployPath = path.join(projectPath, "deploy");

  await fs.ensureDir(projectPath);
  await fs.ensureDir(uiPath);
  await fs.ensureDir(pluginsPath);
  await fs.ensureDir(migrationsPath);
  await fs.ensureDir(deployPath);
  await fs.writeFile(path.join(migrationsPath, ".gitkeep"), "");

  await createFrontendProject(frontendPath);
  await createFrontendProject(uiPath);
  await createBackendStub(backendPath);
  await createDeployScaffold(deployPath);
  await createWorkspaceReadme(projectPath);

  // 🎯 6️⃣ Добавляем корневой package.json с start:dev скриптом
  const rootPackageJson = {
    name: path.basename(projectPath),
    version: "0.1.0",
    private: true,
    scripts: {
      "start:dev": "cd deploy && docker compose -f docker-compose.dev.yml up -d && cd ../frontend && npm install && npm run dev",
    },
  };
  await fs.writeJSON(path.join(projectPath, "package.json"), rootPackageJson, { spaces: 2 });
}

/**
 * Create Kanban reference app (VRP-only, no direct useState/fetch)
 */
async function createKanbanProject(projectPath: string) {
  await createFrontendProject(projectPath);

  // Write Kanban-specific files
  await fs.writeFile(
    path.join(projectPath, "src", "App.tsx"),
    kanbanAppTsx
  );

  await fs.writeFile(
    path.join(projectPath, "src", "models", "kanban.ts"),
    kanbanModels
  );

  await fs.writeFile(
    path.join(projectPath, "src", "services", "kanban.ts"),
    kanbanService
  );

  await fs.writeFile(
    path.join(projectPath, "src", "components", "KanbanBoard.tsx"),
    kanbanBoard
  );

  await fs.writeFile(
    path.join(projectPath, "src", "components", "KanbanColumn.tsx"),
    kanbanColumn
  );

  await fs.writeFile(
    path.join(projectPath, "src", "components", "KanbanCard.tsx"),
    kanbanCard
  );

  // Note: Backend handlers should be generated separately via:
  // vira make event kanban.card.create
  // vira make event kanban.card.move
  // vira make event kanban.card.delete
  // Or manually add kanban.go to backend/internal/handlers/

  console.log(chalk.green("✓ Kanban reference app created"));
  console.log(chalk.gray("  This app demonstrates VRP usage:"));
  console.log(chalk.gray("  - ALL data via useViraState (no direct fetch/useState)"));
  console.log(chalk.gray("  - Server-authoritative state"));
  console.log(chalk.gray("  - Realtime synchronization"));
}

/**
 * Создание фронтенд-проекта (Vite + Vira UI)
 */
async function createFrontendProject(projectPath: string) {
  // Базовые директории
  await fs.ensureDir(path.join(projectPath, "src", "components"));
  await fs.ensureDir(path.join(projectPath, "src", "services"));
  await fs.ensureDir(path.join(projectPath, "src", "pages"));
  await fs.ensureDir(path.join(projectPath, "src", "models"));
  await fs.ensureDir(path.join(projectPath, "src", "utils"));
  await fs.ensureDir(path.join(projectPath, "src", "hooks"));

  // package.json
  const packageJson = {
    name: path.basename(projectPath),
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      "@vira-ui/core": "^1.0.0",
      "@vira-ui/ui": "^1.0.0",
      "@vira-ui/react": "^1.0.0",
      "lucide-react": "^0.400.0",
      "uuid": "^9.0.1",
      // lodash не нужен - используем debounceServiceMethod из @vira-ui/core!
    },
    devDependencies: {
      "@vira-ui/babel-plugin": "^1.0.0",
      "@vitejs/plugin-react": "^4.2.0",
      "@types/node": "^20.10.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "@types/uuid": "^9.0.7",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "typescript": "^5.3.0",
      "vite": "^5.0.0",
    },
  };

  await fs.writeJSON(
    path.join(projectPath, "package.json"),
    packageJson,
    { spaces: 2 }
  );

  await fs.writeJSON(
    path.join(projectPath, "tsconfig.json"),
    tsconfig,
    { spaces: 2 }
  );

  await fs.writeFile(
    path.join(projectPath, "vite.config.ts"),
    viteConfig
  );

  await fs.writeFile(
    path.join(projectPath, "index.html"),
    indexHtml
  );

  await fs.writeFile(path.join(projectPath, ".env.local"), envLocal);

  await fs.writeFile(path.join(projectPath, ".env.example"), envExample);

  await fs.writeFile(
    path.join(projectPath, "src", "index.css"),
    indexCss
  );

  await fs.writeFile(
    path.join(projectPath, "src", "main.tsx"),
    mainTsx
  );

  await fs.writeFile(
    path.join(projectPath, "src", "App.tsx"),
    appTsx
  );

  // VRP hooks are now provided by @vira-ui/core
  // No need to generate useViraState/useViraStream files
}

/**
 * Бекенд-заготовка (Go) для последующего расширения (Kafka/Redis/PG)
 */
async function createBackendStub(backendPath: string) {
  await fs.ensureDir(backendPath);
  await fs.ensureDir(path.join(backendPath, "cmd", "api"));
  await fs.ensureDir(path.join(backendPath, "config"));
  await fs.ensureDir(path.join(backendPath, "internal"));
  await fs.ensureDir(path.join(backendPath, "internal", "middleware"));
  await fs.ensureDir(path.join(backendPath, "internal", "config"));
  await fs.ensureDir(path.join(backendPath, "internal", "db"));
  await fs.ensureDir(path.join(backendPath, "internal", "cache"));
  await fs.ensureDir(path.join(backendPath, "internal", "events"));
  await fs.ensureDir(path.join(backendPath, "internal", "db", "gen"));
  await fs.ensureDir(path.join(backendPath, "internal", "types"));
  await fs.ensureDir(path.join(backendPath, "migrations"));
  await fs.ensureDir(path.join(backendPath, "queries"));
  await fs.writeFile(path.join(backendPath, "queries", ".gitkeep"), "");
  await fs.writeFile(path.join(backendPath, "migrations", ".gitkeep"), "");
  await fs.writeFile(path.join(backendPath, "go.mod"), goMod);
  await fs.writeFile(path.join(backendPath, "cmd", "api", "main.go"), mainGo);
  await fs.writeFile(path.join(backendPath, "internal", "config", "config.go"), configGo);
  await fs.writeFile(path.join(backendPath, "internal", "db", "db.go"), dbGo);
  await fs.writeFile(path.join(backendPath, "internal", "cache", "redis.go"), redisGo);
  await fs.writeFile(path.join(backendPath, "internal", "events", "kafka.go"), kafkaGo);
  await fs.writeFile(path.join(backendPath, "internal", "types", "types.go"), typesGo);
  await fs.writeFile(path.join(backendPath, "internal", "events", "channels.go"), channelHelpers);
  await fs.writeFile(path.join(backendPath, "internal", "events", "api.go"), eventsAPI);
  await fs.writeFile(path.join(backendPath, "internal", "events", "registry.go"), registryGo);
  await fs.writeFile(path.join(backendPath, "internal", "events", "state_store.go"), stateStore);
  await fs.writeFile(path.join(backendPath, "config", "app.yaml"), appYaml);
  await fs.writeFile(path.join(backendPath, "config", "db.yaml"), dbYaml);
  await fs.writeFile(path.join(backendPath, "config", "redis.yaml"), redisYaml);
  await fs.writeFile(path.join(backendPath, "config", "kafka.yaml"), kafkaYaml);
  await fs.writeFile(path.join(backendPath, "sqlc.yaml"), sqlcYaml);
  await fs.writeFile(path.join(backendPath, "Dockerfile"), dockerfile);
  await fs.writeFile(path.join(backendPath, ".env.example"), backendEnvExample);
  await fs.writeFile(path.join(backendPath, "README.md"), backendReadme);
}

/**
 * Заготовка для docker-compose дев-окружения
 */
async function createDeployScaffold(deployPath: string) {
  await fs.ensureDir(deployPath);

  await fs.writeFile(
    path.join(deployPath, "docker-compose.dev.yml"),
    dockerCompose
  );



  await fs.writeFile(
    path.join(deployPath, "docker-compose.prod.yml"),
    dockerComposeProd
  );
}

/**
 * README монорепы с краткой схемой директорий
 */
async function createWorkspaceReadme(projectPath: string) {

  await fs.writeFile(path.join(projectPath, "README.md"), readme);
}

function printNextSteps(projectName: string, template: TemplateType, isInit: boolean = false) {
  console.log(chalk.yellow(`\nNext steps:`));

  if (template === "fullstack") {
    if (!isInit) {
      console.log(`  cd ${projectName}/frontend`);
    } else {
      console.log(`  cd frontend`);
    }
    console.log(`  npm install`);
    console.log(`  npm run dev`);
    console.log(`\nUI package:`);
    console.log(`  cd ../ui`);
    console.log(`  npm install`);
    console.log(`  npm run dev`);
    console.log(`\nBackend stub:`);
    console.log(`  cd ../backend`);
    console.log(`  go mod tidy`);
    console.log(`  go run ./cmd/api`);
    console.log(`\nDev stack (DB/Redis/Kafka):`);
    if (!isInit) {
      console.log(`  cd ../${projectName}/deploy && docker compose -f docker-compose.dev.yml up`);
    } else {
      console.log(`  cd ../deploy && docker compose -f docker-compose.dev.yml up`);
    }
    return;
  }

  if (!isInit) {
    console.log(`  cd ${projectName}`);
  }
  console.log(`  npm install`);
  console.log(`  npm run dev`);
}

/**
 * Конфигурация для генерации компонента
 */
interface ComponentConfig {
  interactive: boolean;
  useVRP?: boolean; // undefined = спросить, true/false = явно указано
}

interface VRPConfig {
  channel: string;
  stateType: string;
}

interface ComponentProps {
  name: string;
  type: string;
  required: boolean;
}

/**
 * Сбор VRP конфигурации
 */
async function collectVRPConfig(name: string, useVRP: boolean | undefined, interactive: boolean): Promise<VRPConfig | null> {
  if (useVRP === false) {
    return null;
  }

  if (!interactive && useVRP !== true) {
    return null;
  }

  // Если явно указано --vrp, используем значения по умолчанию
  if (useVRP === true && !interactive) {
    return {
      channel: name.toLowerCase(),
      stateType: `${name}State`,
    };
  }

  // Интерактивный режим: спрашиваем
  if (interactive && useVRP === undefined) {
    const answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "useVRP",
        message: "Use Vira Reactive Protocol (VRP) for state management?",
        default: false,
      },
    ]);

    if (!answer.useVRP) {
      return null;
    }
  }

  // Спрашиваем детали VRP
  const config = await inquirer.prompt([
    {
      type: "input",
      name: "channel",
      message: "VRP channel name (e.g., 'user', 'task:123', 'demo'):",
      default: name.toLowerCase(),
      validate: (input) => input.length > 0 || "Channel name is required",
    },
    {
      type: "input",
      name: "stateType",
      message: "State type name (interface name):",
      default: `${name}State`,
    },
  ]);

  return {
    channel: config.channel,
    stateType: config.stateType,
  };
}

/**
 * Сбор props компонента
 */
async function collectProps(name: string, hasVRP: boolean, interactive: boolean): Promise<{ props: ComponentProps[]; hasProps: boolean }> {
  if (!interactive) {
    return { props: [], hasProps: true };
  }

  const answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "hasProps",
      message: "Does this component need props?",
      default: !hasVRP,
    },
  ]);

  if (!answer.hasProps) {
    return { props: [], hasProps: false };
  }

  const props: ComponentProps[] = [];
  let addMore = true;

  while (addMore) {
    const prop = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Prop name:",
        validate: (input) => input.length > 0 || "Prop name is required",
      },
      {
        type: "list",
        name: "type",
        message: "Prop type:",
        choices: [
          "string",
          "number",
          "boolean",
          "ReactNode",
          "() => void",
          "(e: Event) => void",
          "string[]",
          "Custom",
        ],
        default: "string",
      },
      {
        type: "input",
        name: "customType",
        message: "Custom type:",
        when: (answers) => answers.type === "Custom",
      },
      {
        type: "confirm",
        name: "required",
        message: "Required prop?",
        default: true,
      },
    ]);

    const propType = prop.type === "Custom" ? prop.customType : prop.type;
    props.push({
      name: prop.name,
      type: propType,
      required: prop.required,
    });

    const { continueAdding } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueAdding",
        message: "Add another prop?",
        default: true,
      },
    ]);
    addMore = continueAdding;
  }

  return { props, hasProps: true };
}

/**
 * Построение импортов
 */
function buildImports(vrpConfig: VRPConfig | null, useViraUI: boolean): string {
  let imports = `import { createElement } from '@vira-ui/core';
import type { ViraComponentProps } from '@vira-ui/core';`;

  if (vrpConfig) {
    imports += `\nimport { useViraState } from '@vira-ui/react';`;
  }

  if (useViraUI) {
    imports += `\nimport { Container, Stack } from '@vira-ui/ui';`;
  }

  return imports;
}

/**
 * Построение интерфейса props
 */
function buildPropsInterface(name: string, props: ComponentProps[]): string {
  if (props.length === 0) {
    return `export interface ${name}Props extends ViraComponentProps {
  // Add your props here
}`;
  }

  return `export interface ${name}Props extends ViraComponentProps {
${props.map((p) => `  ${p.name}${p.required ? "" : "?"}: ${p.type};`).join("\n")}
}`;
}

/**
 * Построение тела компонента
 */
function buildComponentBody(
  name: string,
  vrpConfig: VRPConfig | null,
  props: ComponentProps[],
  hasProps: boolean,
  useViraUI: boolean
): string {
  const propsUsage = props.map((p) => `    ${p.name}={props.${p.name}}`).join("\n");

  if (vrpConfig) {
    // Проверяем, есть ли в channel плейсхолдер {id} или подобный
    const hasPlaceholder = vrpConfig.channel.includes('{id}') || vrpConfig.channel.includes('${id}');
    let channelCode = '';

    if (hasPlaceholder && hasProps) {
      // Находим prop, который может быть id (clientId, userId, id и т.д.)
      const idProp = props.find(p =>
        p.name.toLowerCase().includes('id') ||
        p.name === 'id'
      );

      if (idProp) {
        // Заменяем {id} на значение из props
        const placeholder = vrpConfig.channel.includes('${id}') ? '${id}' : '{id}';
        const channelTemplate = vrpConfig.channel.replace(placeholder, `\${props.${idProp.name}}`);
        channelCode = `  // Динамически формируем channel с ${idProp.name} из props
  const channel = \`${channelTemplate}\`;
  const { data, sendEvent, sendUpdate, sendDiff } = useViraState<${vrpConfig.stateType}>(channel, null);`;
      } else {
        channelCode = `  const { data, sendEvent, sendUpdate, sendDiff } = useViraState<${vrpConfig.stateType}>('${vrpConfig.channel}', null);`;
      }
    } else {
      channelCode = `  const { data, sendEvent, sendUpdate, sendDiff } = useViraState<${vrpConfig.stateType}>('${vrpConfig.channel}', null);`;
    }

    return `${channelCode}

  // Use data from VRP state
  // Example: const value = data?.field ?? defaultValue;

  // 🎯 4️⃣ Для inline-редактирования с авто-save используйте встроенный watch() с debounce:
  // import { watch, signal } from '@vira-ui/core';
  // const [editValue, setEditValue] = signal('');
  // watch(() => editValue(), (newValue) => {
  //   sendDiff({ [field]: newValue, updated_at: new Date().toISOString() });
  // }, { debounce: 500 });

  return createElement('div', { className: '${name.toLowerCase()}' },
    // Add your content here
  );`;
  }

  if (useViraUI) {
    return `  return (
    <Container>
      <Stack>
${propsUsage ? propsUsage.split('\n').map(p => `        ${p.replace('    ', '')}`).join('\n') + "\n" : ""}        {/* Add your content here */}
      </Stack>
    </Container>
  );`;
  }

  return `  return createElement('div', { className: '${name.toLowerCase()}' },
${propsUsage ? propsUsage + ",\n" : ""}    // Add your content here
  );`;
}

/**
 * Генерация компонента
 */
async function generateComponent(name: string, dir: string, config: ComponentConfig) {
  const componentPath = path.join(process.cwd(), dir, "components", `${name}.tsx`);
  await fs.ensureDir(path.dirname(componentPath));

  // Сбор конфигурации
  const vrpConfig = await collectVRPConfig(name, config.useVRP, config.interactive);
  const { props, hasProps } = await collectProps(name, !!vrpConfig, config.interactive);

  // Спрашиваем про Vira UI, если интерактивный режим
  let useViraUI = false;
  if (config.interactive) {
    const uiAnswer = await inquirer.prompt([
      {
        type: "confirm",
        name: "useViraUI",
        message: "Use Vira UI components (@vira-ui/ui)?",
        default: true,
      },
    ]);
    useViraUI = uiAnswer.useViraUI;
  }

  // Построение кода
  const imports = buildImports(vrpConfig, useViraUI);
  const propsInterface = buildPropsInterface(name, props);
  const componentBody = buildComponentBody(name, vrpConfig, props, hasProps, useViraUI);

  // Сборка финального кода
  let componentCode = `${imports}
`;

  // Интерфейс состояния VRP
  if (vrpConfig) {
    const typeName = vrpConfig.stateType.replace('State', '');
    componentCode += `// TODO: Если у вас есть синхронизированные типы из backend, используйте их:
// import type { ${typeName} } from '../vira-types';
// export type ${vrpConfig.stateType} = ${typeName};

export interface ${vrpConfig.stateType} {
  // Add your state fields here
  id?: string;
}

`;
  }

  // Интерфейс props
  if (hasProps || !vrpConfig) {
    componentCode += `${propsInterface}

`;
  }

  // Сигнатура функции
  const functionSignature = hasProps || !vrpConfig
    ? `export function ${name}(props: ${name}Props) {`
    : `export function ${name}() {`;

  componentCode += `${functionSignature}
${componentBody}
}
`;

  await fs.writeFile(componentPath, componentCode);
}

/**
 * Конфигурация для генерации сервиса
 */
interface ServiceConfig {
  interactive: boolean;
  useVRP?: boolean; // undefined = спросить, true/false = явно указано
}

/**
 * Сбор VRP конфигурации для сервиса
 */
async function collectServiceVRPConfig(name: string, useVRP: boolean | undefined, interactive: boolean): Promise<VRPConfig | null> {
  if (useVRP === false) {
    return null;
  }

  if (!interactive && useVRP !== true) {
    return null;
  }

  // Если явно указано --vrp, используем значения по умолчанию
  if (useVRP === true && !interactive) {
    return {
      channel: name.toLowerCase(),
      stateType: `${name}State`,
    };
  }

  // Интерактивный режим: спрашиваем
  if (interactive && useVRP === undefined) {
    const answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "useVRP",
        message: "Use Vira Reactive Protocol (VRP) for this service?",
        default: true,
      },
    ]);

    if (!answer.useVRP) {
      return null;
    }
  }

  // Спрашиваем детали VRP
  const config = await inquirer.prompt([
    {
      type: "input",
      name: "channel",
      message: "VRP channel name:",
      default: name.toLowerCase(),
    },
    {
      type: "input",
      name: "stateType",
      message: "State type name:",
      default: `${name}State`,
    },
  ]);

  return {
    channel: config.channel,
    stateType: config.stateType,
  };
}

/**
 * Построение VRP-based сервиса
 */
function buildVRPService(name: string, vrpConfig: VRPConfig): string {
  const lowerName = name.toLowerCase();
  // Пытаемся определить имя типа из синхронизированных типов (например, Client вместо ClientState)
  const typeName = vrpConfig.stateType.replace('State', '');

  return `// ${name} service using Vira Core DI container + VRP
import { createService, useService, batch } from '@vira-ui/core';
import { useViraState } from '@vira-ui/react';
import { v4 as uuid } from 'uuid';
// TODO: Если у вас есть синхронизированные типы из backend, используйте их:
// import type { ${typeName} } from '../vira-types';
// export type ${vrpConfig.stateType} = ${typeName};

export interface ${vrpConfig.stateType} {
  // Add your state fields here
  id?: string;
  created_at?: string;
  updated_at?: string;
}

// 🎯 3️⃣ Универсальный VRP hook для списков (переиспользуемый для любых сущностей)
export function useVrpList<T>(channel: string) {
  const { data, sendEvent, sendDiff } = useViraState<T[] | T>(channel, []);
  const list = Array.isArray(data) ? data : Object.values(data || {});
  return { data: list, sendEvent, sendDiff };
}

// Create ${lowerName} service (singleton via DI container)
// Service holds pure business logic helpers
createService('${lowerName}', () => ({
  // Add your business logic methods here
  processData(data: ${vrpConfig.stateType} | null): any {
    if (!data) return null;
    // Add processing logic
    return data;
  },
}));

// Hook for ${name} operations (combines service + VRP state)
export function use${name}(id?: string) {
  const channel = id ? \`${vrpConfig.channel}:\${id}\` : '${vrpConfig.channel}';
  const vrpState = id 
    ? useViraState<${vrpConfig.stateType}>(channel, null)
    : useVrpList<${vrpConfig.stateType}>(channel);
  const ${lowerName}Service = useService<{ processData: (data: ${vrpConfig.stateType} | null) => any }>('${lowerName}');

  // Извлекаем методы из VRP состояния
  const { data, sendEvent, sendDiff } = vrpState;
  const sendUpdate = 'sendUpdate' in vrpState ? vrpState.sendUpdate : undefined;

  return {
    data,
    // 🎯 1️⃣ Создание с авто-генерацией UUID на фронте (VRP сразу знает id, не надо ждать бэка)
    create(item: Omit<${vrpConfig.stateType}, 'id' | 'created_at' | 'updated_at'>) {
      const itemId = uuid();
      const newItem: ${vrpConfig.stateType} = {
        ...item,
        id: itemId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as ${vrpConfig.stateType};
      sendEvent('${lowerName}.created', {
        ...newItem,
        timestamp: new Date().toISOString()
      });
    },
    // Update operations
    update(updates: Partial<${vrpConfig.stateType}>) {
      sendDiff(updates);
      sendEvent('${lowerName}.updated', { 
        ...updates,
        updated_at: new Date().toISOString(),
        timestamp: new Date().toISOString()
      });
    },
    // Delete operation
    delete(itemId: string) {
      sendEvent('${lowerName}.deleted', { 
        id: itemId,
        timestamp: new Date().toISOString()
      });
    },
    sendEvent,
    sendDiff,
    sendUpdate,
    // Service methods
    processData() {
      // data может быть массивом или объектом, обрабатываем оба случая
      const singleData = Array.isArray(data) ? null : (data as ${vrpConfig.stateType} | null);
      return ${lowerName}Service.processData(singleData);
    },
  };
}

// 🎯 2️⃣ Сервис для bulk actions с VRP (переиспользуемый для любых сущностей)

createService('${lowerName}Bulk', () => ({
  bulkUpdate(ids: string[], payload: Partial<${vrpConfig.stateType}>, sendEvent: Function) {
    // batch() группирует все обновления в один цикл - компоненты обновятся только один раз!
    batch(() => {
      ids.forEach(id => {
        sendEvent('${lowerName}.updated', { 
          id, 
          ...payload, 
          updated_at: new Date().toISOString(),
          timestamp: new Date().toISOString() 
        });
      });
    });
  },
  bulkDelete(ids: string[], sendEvent: Function) {
    // batch() для оптимизации массового удаления
    batch(() => {
      ids.forEach(id => {
        sendEvent('${lowerName}.deleted', { 
          id, 
          timestamp: new Date().toISOString() 
        });
      });
    });
  },
}));
`;
}

/**
 * Построение стандартного сервиса с signals
 */
function buildStandardService(name: string): string {
  return `import { createViraService, signal } from '@vira-ui/core';

export const ${name}Service = createViraService('${name.toLowerCase()}', () => {
  const data = signal([]);
  const loading = signal(false);
  const error = signal<string | null>(null);

  const fetch = async () => {
    loading.set(true);
    try {
      // Add your logic here
      // const result = await api.get('/${name.toLowerCase()}');
      // data.set(result);
    } catch (e) {
      error.set(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      loading.set(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetch,
  };
});
`;
}

/**
 * Генерация сервиса
 */
async function generateService(name: string, dir: string, config: ServiceConfig) {
  const servicePath = path.join(process.cwd(), dir, "services", `${name}Service.ts`);
  await fs.ensureDir(path.dirname(servicePath));

  // Сбор VRP конфигурации
  const vrpConfig = await collectServiceVRPConfig(name, config.useVRP, config.interactive);

  // Построение кода
  const serviceCode = vrpConfig
    ? buildVRPService(name, vrpConfig)
    : buildStandardService(name);

  await fs.writeFile(servicePath, serviceCode);
}

/**
 * Генерация страницы
 */
async function generatePage(name: string, dir: string) {
  const pagePath = path.join(process.cwd(), dir, "pages", `${name}Page.tsx`);
  await fs.ensureDir(path.dirname(pagePath));

  const pageCode = `import { createService, useService, createElement } from '@vira-ui/core';
import { useViraState } from '@vira-ui/react';

// 🎯 5️⃣ VRP notifications: очередь с максимумом (предотвращает перегрузку фронта)
const MAX_NOTIFICATIONS = 5;

// Создаём сервис для управления состоянием страницы
createService('${name.toLowerCase()}Page', () => ({
  searchQuery: '',
  selectedIds: new Set<string>(),
  
  setSearchQuery(value: string) {
    this.searchQuery = value;
  },
  
  toggleSelect(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  },
  
  clearSelection() {
    this.selectedIds.clear();
  },
}));

export function ${name}Page() {
  // VRP для списка
  // const { data, create, sendEvent } = use${name}();
  
  // VRP для real-time уведомлений с лимитом
  const notificationsState = useViraState<any[]>('notifications:${name.toLowerCase()}', []);
  
  // Используем сервис страницы
  const pageService = useService('${name.toLowerCase()}Page');
  
  // Обработка уведомлений с лимитом очереди
  if (notificationsState.data && notificationsState.data.length > MAX_NOTIFICATIONS) {
    notificationsState.data = notificationsState.data.slice(-MAX_NOTIFICATIONS);
  }

  return createElement('div', { className: '${name.toLowerCase()}-page' },
    createElement('h1', null, '${name}'),
    // Add your content here
  );
}
`;

  await fs.writeFile(pagePath, pageCode);
}

/**
 * Генерация модели
 */
async function generateModel(name: string, dir: string, fields?: string) {
  const modelPath = path.join(process.cwd(), dir, "models", `${name}.ts`);
  await fs.ensureDir(path.dirname(modelPath));

  const modelCode = `import { defineModel } from '@vira-ui/core';

export const ${name}Model = defineModel({
  // Add your fields here
  id: {
    type: 'string',
    required: true,
  },
});
`;

  await fs.writeFile(modelPath, modelCode);
}

/**
 * Генерация роута
 */
async function generateRoute(name: string, dir: string) {
  const routePath = path.join(process.cwd(), dir, "routes", `${name}.ts`);
  await fs.ensureDir(path.dirname(routePath));

  const routeCode = `import { reactiveRoute } from '@vira-ui/core';
import { ${name}Page } from '../pages/${name}Page';

export const ${name}Route = reactiveRoute({
  path: '/${name.toLowerCase()}',
  component: ${name}Page,
});
`;

  await fs.writeFile(routePath, routeCode);
}

/**
 * Генерация теста
 */
async function generateTest(name: string, dir: string) {
  // Определяем тип файла (component, service, page)
  const componentPath = path.join(process.cwd(), dir, "components", `${name}.tsx`);
  const servicePath = path.join(process.cwd(), dir, "services", `${name}Service.ts`);
  const pagePath = path.join(process.cwd(), dir, "pages", `${name}Page.tsx`);

  let testPath: string;
  let testCode: string;

  if (await fs.pathExists(componentPath)) {
    // Тест для компонента
    testPath = path.join(process.cwd(), dir, "components", `${name}.test.tsx`);
    testCode = `import React from 'react';
import { render } from '@testing-library/react';
import { ${name} } from './${name}';
import type { ${name}Props } from './${name}';

describe('${name}', () => {
  it('renders correctly', () => {
    const props: ${name}Props = {
      // Add test props here
    };
    const { container } = render(React.createElement(${name}, props));
    expect(container).toBeTruthy();
  });
});
`;
  } else if (await fs.pathExists(servicePath)) {
    // Тест для сервиса
    testPath = path.join(process.cwd(), dir, "services", `${name}Service.test.ts`);
    testCode = `import { ${name}Service } from './${name}Service';

describe('${name}Service', () => {
  it('should be defined', () => {
    expect(${name}Service).toBeDefined();
  });

  // Add more tests here
});
`;
  } else if (await fs.pathExists(pagePath)) {
    // Тест для страницы
    testPath = path.join(process.cwd(), dir, "pages", `${name}Page.test.tsx`);
    testCode = `import React from 'react';
import { render } from '@testing-library/react';
import { ${name}Page } from './${name}Page';

describe('${name}Page', () => {
  it('renders correctly', () => {
    const { container } = render(React.createElement(${name}Page));
    expect(container).toBeTruthy();
  });
});
`;
  } else {
    // Общий тест, если файл не найден
    testPath = path.join(process.cwd(), dir, "__tests__", `${name}.test.ts`);
    await fs.ensureDir(path.dirname(testPath));
    testCode = `describe('${name}', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
`;
  }

  await fs.ensureDir(path.dirname(testPath));
  await fs.writeFile(testPath, testCode);
}

/**
 * Sync TypeScript types from Go structs (scaffold-level parser)
 */
async function syncTypes(options: {
  backend: string;
  fromModels?: boolean;
  models?: string;
  frontend: string;
  ui: string;
}) {
  let structs: GoStruct[] = [];

  if (options.fromModels) {
    const modelsDir = path.resolve(process.cwd(), options.models || path.join("backend", "internal", "models"));
    structs = await parseGoStructsFromDir(modelsDir);
  } else {
    const backendPath = path.resolve(process.cwd(), options.backend);
    const exists = await fs.pathExists(backendPath);
    if (!exists) {
      // Friendly fallback: if types.go isn't present (many projects don't need it anymore),
      // but models exist — generate from models.
      const modelsDir = path.resolve(process.cwd(), options.models || path.join("backend", "internal", "models"));
      if (await fs.pathExists(modelsDir)) {
        structs = await parseGoStructsFromDir(modelsDir);
      } else {
        throw new Error(
          `Go types file not found: ${backendPath}. ` +
            `Either create it, or run "vira sync --types --from-models" (and ensure ${modelsDir} exists).`
        );
      }
    } else {
      const goSource = await fs.readFile(backendPath, "utf8");
      structs = parseGoStructs(goSource);
    }
  }

  const tsContent = renderTsTypes(structs);

  const targets = [
    path.resolve(process.cwd(), options.frontend),
    path.resolve(process.cwd(), options.ui),
  ];

  for (const target of targets) {
    await fs.ensureDir(path.dirname(target));
    await fs.writeFile(target, tsContent);
  }

  console.log(
    chalk.green(
      `✓ Synced ${structs.length} type(s) to ${options.frontend} and ${options.ui}`
    )
  );
}

type GoField = { name: string; type: string; json?: string };
type GoStruct = { name: string; fields: GoField[] };

async function parseGoStructsFromDir(modelsDir: string): Promise<GoStruct[]> {
  const out: GoStruct[] = [];
  const exists = await fs.pathExists(modelsDir);
  if (!exists) {
    throw new Error(`Models directory not found: ${modelsDir}`);
  }
  const stat = await fs.stat(modelsDir);
  if (!stat.isDirectory()) {
    throw new Error(`Models path is not a directory: ${modelsDir}`);
  }

  const files = (await fs.readdir(modelsDir))
    .filter((f) => f.endsWith(".go") && !f.endsWith("_test.go"));

  for (const file of files) {
    const full = path.join(modelsDir, file);
    const src = await fs.readFile(full, "utf8");
    out.push(...parseGoStructs(src));
  }

  // De-dupe by struct name (first wins)
  const seen = new Set<string>();
  const deduped: GoStruct[] = [];
  for (const s of out) {
    if (!s?.name) continue;
    // Only exported types (to avoid internal helpers)
    if (s.name[0] !== s.name[0].toUpperCase()) continue;
    if (seen.has(s.name)) continue;
    seen.add(s.name);
    deduped.push(s);
  }
  return deduped;
}

function parseGoStructs(source: string): GoStruct[] {
  const structs: GoStruct[] = [];
  const structRegex = /type\s+(\w+)\s+struct\s*\{([^}]*)\}/gm;
  let match: RegExpExecArray | null;
  while ((match = structRegex.exec(source)) !== null) {
    const [, name, body] = match;
    const lines = body.split("\n");
    const fields: GoField[] = [];
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith("//")) continue;
      // Format: FieldName Type `json:"field"`
      const parts = line.split("`")[0]?.trim() ?? line;
      const tokens = parts.split(/\s+/);
      if (tokens.length < 2) continue;
      const fieldName = tokens[0];
      const fieldType = tokens[1];
      let jsonTag: string | undefined;
      // json tag can appear anywhere inside the struct tags: `db:"..." json:"..."`
      const tagMatch = line.match(/json:"([^"]+)"/);
      if (tagMatch) {
        jsonTag = tagMatch[1].split(",")[0];
        if (jsonTag === "-" || jsonTag === "") {
          continue; // skip non-exposed fields
        }
      }
      fields.push({ name: fieldName, type: fieldType, json: jsonTag });
    }
    structs.push({ name, fields });
  }
  return structs;
}

function renderTsTypes(structs: GoStruct[]): string {
  const lines: string[] = [];
  lines.push("// Auto-generated by vira sync --types. Do not edit manually.");
  lines.push("");
  lines.push("export type ViraMessageType =");
  lines.push("  | 'handshake' | 'ack' | 'sub' | 'sub_ack' | 'unsub' | 'unsub_ack'");
  lines.push("  | 'update' | 'event' | 'diff' | 'ping' | 'pong' | 'error';");
  lines.push("");
  lines.push("export enum ViraChannelEnum {");
  lines.push("  User = 'user',");
  lines.push("  Task = 'task',");
  lines.push("  Notifications = 'notifications',");
  lines.push("  Demo = 'demo',");
  lines.push("}");
  lines.push("");
  lines.push("export type ViraChannel =");
  lines.push("  | `${ViraChannelEnum.User}:${string}`");
  lines.push("  | `${ViraChannelEnum.Task}:${string}`");
  lines.push("  | `${ViraChannelEnum.Notifications}:${string}`");
  lines.push("  | ViraChannelEnum.Demo");
  lines.push("  | string; // fallback for custom channels");
  lines.push("");
  lines.push("export interface ViraDataMap {");
  for (const s of structs) {
    lines.push(`  ${s.name}: ${s.name};`);
  }
  lines.push("}");
  lines.push("export type ViraAnyData = ViraDataMap[keyof ViraDataMap];");
  lines.push("");
  lines.push("export interface ViraUpdateMessage<T = ViraAnyData> { type: 'update'; channel: ViraChannel | string; data: T; ts?: number; versionNo?: number; name?: string }");
  lines.push("export interface ViraEventMessage<T = ViraAnyData> { type: 'event'; channel: ViraChannel | string; data: T; ts?: number; versionNo?: number; name?: string }");
  lines.push("export interface ViraDiffMessage<T = ViraAnyData> { type: 'diff'; channel: ViraChannel | string; patch: Partial<T>; ts?: number; versionNo?: number }");
  lines.push("");
  lines.push("// Channel helper functions");
  lines.push("export function channelUser(id: string | number): string {");
  lines.push(`  return \`user:\${id}\`;`);
  lines.push("}");
  lines.push("");
  lines.push("export function channelTask(id: string | number): string {");
  lines.push(`  return \`task:\${id}\`;`);
  lines.push("}");
  lines.push("");
  lines.push("export function channelNotifications(userId: string | number): string {");
  lines.push(`  return \`notifications:\${userId}\`;`);
  lines.push("}");
  lines.push("");
  lines.push("export function channelCustom(name: string, key: string | number): string {");
  lines.push(`  return \`\${name}:\${key}\`;`);
  lines.push("}");
  lines.push("");
  lines.push("export type ViraMessage =");
  lines.push("  | { type: 'handshake'; client: string; version: string; authToken?: string; session?: string; ts?: number }");
  lines.push("  | { type: 'ack'; session: string; interval: number; ts?: number }");
  lines.push("  | { type: 'sub'; channels: string[] }");
  lines.push("  | { type: 'sub_ack'; channels: string[] }");
  lines.push("  | { type: 'unsub'; channels: string[] }");
  lines.push("  | { type: 'unsub_ack'; channels: string[] }");
  lines.push("  | ViraUpdateMessage");
  lines.push("  | ViraEventMessage");
  lines.push("  | ViraDiffMessage");
  lines.push("  | { type: 'ping'; ts?: number }");
  lines.push("  | { type: 'pong'; ts?: number }");
  lines.push("  | { type: 'error'; name?: string; message?: string };");
  lines.push("");
  for (const s of structs) {
    lines.push(`export interface ${s.name} {`);
    for (const f of s.fields) {
      const tsType = goTypeToTs(f.type);
      const jsonName = f.json || toCamel(f.name);
      lines.push(`  ${jsonName}: ${tsType};`);
    }
    lines.push("}");
    lines.push("");
  }
  return lines.join("\n");
}

function goTypeToTs(goType: string): string {
  // Strip package prefix
  const clean = goType.replace(/^[a-zA-Z_]+\./, "");
  // Slice/array
  if (clean.startsWith("[]")) {
    const inner = goTypeToTs(clean.slice(2));
    return `${inner}[]`;
  }
  switch (clean) {
    case "string":
    case "uuid":
      return "string";
    case "int":
    case "int32":
    case "int64":
    case "uint":
    case "uint32":
    case "uint64":
    case "float32":
    case "float64":
      return "number";
    case "bool":
      return "boolean";
    case "Time":
      return "string";
    default:
      return "any";
  }
}

function toCamel(name: string): string {
  if (!name) return name;
  // "ID" -> "id", "URL" -> "url" (common Go acronym fields)
  if (/^[A-Z0-9]+$/.test(name)) return name.toLowerCase();
  return name.charAt(0).toLowerCase() + name.slice(1);
}

/**
 * Генерация документации по VRP каналам
 */
function generateChannelDocumentation(structs: GoStruct[]): string {
  const lines: string[] = [];
  lines.push("# Vira Reactive Protocol (VRP) Channels");
  lines.push("");
  lines.push("Protocol version: v0.1");
  lines.push("");
  lines.push("## Available Channels");
  lines.push("");
  lines.push("The following channels are available based on your Go types:");
  lines.push("");

  for (const struct of structs) {
    const channelName = struct.name.toLowerCase();
    lines.push(`### \`${channelName}\` / \`${channelName}:{id}\``);
    lines.push("");
    lines.push(`Type: \`${struct.name}\``);
    lines.push("");
    if (struct.fields.length > 0) {
      lines.push("Fields:");
      lines.push("");
      for (const field of struct.fields) {
        const jsonName = field.json || toCamel(field.name);
        const tsType = goTypeToTs(field.type);
        lines.push(`- \`${jsonName}\`: \`${tsType}\``);
      }
      lines.push("");
    }
  }

  lines.push("## Usage");
  lines.push("");
  lines.push("```typescript");
  lines.push("import { useViraState } from '@vira-ui/react';");
  lines.push("");
  if (structs.length > 0) {
    const firstStruct = structs[0];
    lines.push(`const { data, sendEvent, sendUpdate, sendDiff } = useViraState<${firstStruct.name}>('${firstStruct.name.toLowerCase()}', null);`);
  }
  lines.push("```");
  lines.push("");
  lines.push("See VIRA_PROTOCOL.md for full specification.");

  return lines.join("\n");
}

/**
 * Go HTTP handler scaffold
 */
async function generateGoHandler(name: string, dir: string) {
  const safeName = name.toLowerCase();
  const handlerName = capitalize(name);
  const targetDir = path.join(process.cwd(), dir);
  await fs.ensureDir(targetDir);

  const handlerCode = `package handlers

import (
  "encoding/json"
  "net/http"
)

type ${handlerName}Response struct {
  Message string \`json:"message"\`
}

// ${handlerName} handles GET /${safeName}
func ${handlerName}(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")
  _ = json.NewEncoder(w).Encode(${handlerName}Response{
    Message: "${handlerName} handler ok",
  })
}
`;

  await fs.writeFile(path.join(targetDir, `${safeName}.go`), handlerCode);
}

/**
 * Go model scaffold
 */
async function generateGoModel(name: string, dir: string, fields?: string) {
  const modelName = capitalize(name);
  const targetDir = path.join(process.cwd(), dir);
  await fs.ensureDir(targetDir);

  // Парсим поля если указаны
  let fieldsCode = "";
  if (fields) {
    const fieldList = fields.split(",").map(f => f.trim());
    fieldsCode = fieldList.map(field => {
      const [fieldName, fieldType] = field.split(":").map(s => s.trim());
      const goType = mapTypeScriptToGo(fieldType || "string");
      return `  ${capitalize(fieldName)} ${goType} \`db:"${fieldName.toLowerCase()}" json:"${fieldName.toLowerCase()}"\``;
    }).join("\n");

    // Добавляем стандартные поля если их нет
    if (!fieldList.some(f => f.toLowerCase().includes("id"))) {
      fieldsCode = `  ID        string    \`db:"id" json:"id"\`
${fieldsCode}
  CreatedAt time.Time \`db:"created_at" json:"created_at"\`
  UpdatedAt time.Time \`db:"updated_at" json:"updated_at"\``;
    }
  } else {
    // Дефолтные поля для типичной модели
    fieldsCode = `  ID        string    \`db:"id" json:"id"\`
  CreatedAt time.Time \`db:"created_at" json:"created_at"\`
  UpdatedAt time.Time \`db:"updated_at" json:"updated_at"\``;
  }

  const modelCode = `package models

import "time"

type ${modelName} struct {
${fieldsCode}
}
`;

  await fs.writeFile(path.join(targetDir, `${modelName.toLowerCase()}.go`), modelCode);
}

/**
 * SQL migration scaffold (timestamped up/down)
 */
async function generateMigration(name: string, dir: string) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);

  const baseName = `${timestamp}_${name}`;
  const targetDir = path.join(process.cwd(), dir);
  await fs.ensureDir(targetDir);

  // Goose v3 имеет проблему с отдельными .up.sql/.down.sql файлами (дубликат версии)
  // Используем один файл .sql с обеими директивами (работает надежнее)
  const migrationPath = path.join(targetDir, `${baseName}.sql`);

  const migrationTemplate = `-- +goose Up
-- +goose StatementBegin
-- TODO: add migration SQL here
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- TODO: rollback SQL here
-- +goose StatementEnd
`;

  await fs.writeFile(migrationPath, migrationTemplate);
}

/**
 * Получить DATABASE_URL из переменных окружения или .env файлов
 */
async function getDatabaseUrl(): Promise<string | undefined> {
  // Сначала проверяем переменную окружения
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Пытаемся прочитать .env файлы
  const possibleEnvPaths = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "env"),
    path.join(process.cwd(), "backend", ".env"),
    path.join(process.cwd(), ".env.local"),
  ];

  for (const envPath of possibleEnvPaths) {
    if (await fs.pathExists(envPath)) {
      try {
        const envContent = await fs.readFile(envPath, "utf8");
        const lines = envContent.split("\n");
        
        for (const line of lines) {
          // Пропускаем комментарии и пустые строки
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          
          // Парсим DATABASE_URL=value
          const match = trimmed.match(/^DATABASE_URL\s*=\s*(.+)$/);
          if (match) {
            // Убираем кавычки если есть
            let value = match[1].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            return value;
          }
        }
      } catch (error) {
        // Игнорируем ошибки чтения .env файла
      }
    }
  }

  // Пытаемся собрать URL из отдельных переменных DB_*
  const dbHost = process.env.DB_HOST || process.env.POSTGRES_HOST || "localhost";
  const dbPort = process.env.DB_PORT || process.env.POSTGRES_PORT || "5432";
  const dbUser = process.env.DB_USER || process.env.POSTGRES_USER || "postgres";
  const dbPassword = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || "";
  const dbName = process.env.DB_NAME || process.env.POSTGRES_DB || process.env.DB_DATABASE || "";

  if (dbName) {
    return `postgres://${dbUser}${dbPassword ? `:${dbPassword}` : ""}@${dbHost}:${dbPort}/${dbName}?sslmode=disable`;
  }

  return undefined;
}

/**
 * Выполнение миграций через goose
 */
async function runMigrations(
  migrationsDir: string,
  dbUrl: string | undefined,
  driver: string,
  direction: "up" | "down"
) {
  const { execSync } = require("child_process");
  const migrationsPath = path.resolve(process.cwd(), migrationsDir);

  // Проверяем наличие директории миграций
  if (!(await fs.pathExists(migrationsPath))) {
    console.error(chalk.red(`✗ Migrations directory not found: ${migrationsPath}`));
    console.log(chalk.yellow(`   Create migrations with: npx vira make migration <name>`));
    process.exit(1);
  }

  // Получаем URL базы данных (проверяем .env файлы)
  const databaseUrl = dbUrl || await getDatabaseUrl();
  if (!databaseUrl) {
    console.error(chalk.red("✗ Database URL not provided"));
    console.log(chalk.yellow("   Use --db-url option, set DATABASE_URL environment variable, or create .env file"));
    console.log(chalk.yellow("   Example: DATABASE_URL=postgres://user:pass@localhost/dbname?sslmode=disable"));
    console.log(chalk.yellow("   Or create .env in project root with: DATABASE_URL=..."));
    process.exit(1);
  }

  // Проверяем наличие goose (кроссплатформенная проверка)
  const isWindows = process.platform === "win32";
  const checkCommand = isWindows ? "where goose" : "which goose";
  let gooseInstalled = false;
  
  try {
    execSync(checkCommand, { stdio: "ignore" });
    gooseInstalled = true;
  } catch {
    // goose не найден
  }

  if (!gooseInstalled) {
    console.log(chalk.blue("goose not found. Installing..."));
    console.log(chalk.gray("   This will download goose and its dependencies (this is normal)"));
    try {
      // Скрываем вывод загрузки зависимостей, показываем только прогресс
      execSync("go install github.com/pressly/goose/v3/cmd/goose@latest", { 
        stdio: "inherit",
        env: { ...process.env, GOFLAGS: "-mod=mod" }
      });
      console.log(chalk.green("✓ goose installed successfully"));
    } catch (error) {
      console.error(chalk.red("✗ Failed to install goose"));
      console.log(chalk.yellow("   Install manually: go install github.com/pressly/goose/v3/cmd/goose@latest"));
      console.log(chalk.yellow("   Or download from: https://github.com/pressly/goose/releases"));
      process.exit(1);
    }
  }

  // Выполняем миграции
  try {
    const command = direction === "up" ? "up" : "down";
    console.log(chalk.blue(`Running migrations ${direction}...`));
    
    // Используем переменные окружения для goose (более надежно на Windows)
    const env = {
      ...process.env,
      GOOSE_DRIVER: driver,
      GOOSE_DBSTRING: databaseUrl,
    };
    
    execSync(
      `goose -dir "${migrationsPath}" ${command}`,
      { 
        stdio: "inherit", 
        cwd: process.cwd(),
        env: env
      }
    );
    console.log(chalk.green(`✓ Migrations ${direction} completed successfully`));
  } catch (error: any) {
    console.error(chalk.red(`✗ Migration failed: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Показать статус миграций
 */
async function showMigrationStatus(
  migrationsDir: string,
  dbUrl: string | undefined,
  driver: string
) {
  const { execSync } = require("child_process");
  const migrationsPath = path.resolve(process.cwd(), migrationsDir);

  if (!(await fs.pathExists(migrationsPath))) {
    console.error(chalk.red(`✗ Migrations directory not found: ${migrationsPath}`));
    process.exit(1);
  }

  const databaseUrl = dbUrl || await getDatabaseUrl();
  if (!databaseUrl) {
    console.error(chalk.red("✗ Database URL not provided"));
    console.log(chalk.yellow("   Use --db-url option, set DATABASE_URL environment variable, or create .env file"));
    process.exit(1);
  }

  try {
    console.log(chalk.blue("Migration status:"));
    
    // Используем переменные окружения для goose (более надежно на Windows)
    const env = {
      ...process.env,
      GOOSE_DRIVER: driver,
      GOOSE_DBSTRING: databaseUrl,
    };
    
    execSync(
      `goose -dir "${migrationsPath}" status`,
      { 
        stdio: "inherit", 
        cwd: process.cwd(),
        env: env
      }
    );
  } catch (error: any) {
    console.error(chalk.red(`✗ Failed to get migration status: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Выполнение сидеров (seeds)
 */
async function runSeeds(
  seedsDir: string,
  dbUrl: string | undefined,
  driver: string
) {
  const { execSync } = require("child_process");
  const seedsPath = path.resolve(process.cwd(), seedsDir);

  // Проверяем наличие директории сидеров
  if (!(await fs.pathExists(seedsPath))) {
    console.error(chalk.red(`✗ Seeds directory not found: ${seedsPath}`));
    console.log(chalk.yellow(`   Create seeds directory and add SQL files`));
    process.exit(1);
  }

  // Получаем URL базы данных
  const databaseUrl = dbUrl || await getDatabaseUrl();
  if (!databaseUrl) {
    console.error(chalk.red("✗ Database URL not provided"));
    console.log(chalk.yellow("   Use --db-url option, set DATABASE_URL environment variable, or create .env file"));
    process.exit(1);
  }

  // Получаем список SQL файлов из папки seeds
  const files = await fs.readdir(seedsPath);
  const sqlFiles = files
    .filter((f: string) => f.endsWith(".sql"))
    .sort(); // Сортируем по имени для последовательного выполнения

  if (sqlFiles.length === 0) {
    console.log(chalk.yellow(`⚠ No SQL files found in ${seedsPath}`));
    return;
  }

  console.log(chalk.blue(`Found ${sqlFiles.length} seed file(s):`));
  sqlFiles.forEach((file: string) => {
    console.log(chalk.gray(`  - ${file}`));
  });

  // Выполняем каждый SQL файл
  try {
    console.log(chalk.blue(`\nRunning seeds...`));

    if (driver === "postgres") {
      // Для PostgreSQL используем psql
      const isWindows = process.platform === "win32";
      
      // Парсим DATABASE_URL используя встроенный URL класс
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(databaseUrl);
      } catch (error) {
        console.error(chalk.red("✗ Invalid DATABASE_URL format for PostgreSQL"));
        console.log(chalk.yellow("   Expected format: postgres://user:password@host:port/dbname"));
        console.log(chalk.gray(`   Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }

      // Проверяем протокол
      if (parsedUrl.protocol !== "postgres:" && parsedUrl.protocol !== "postgresql:") {
        console.error(chalk.red("✗ Invalid database protocol"));
        console.log(chalk.yellow("   Expected protocol: postgres:// or postgresql://"));
        process.exit(1);
      }

      const user = parsedUrl.username || "postgres";
      const password = parsedUrl.password || "";
      const host = parsedUrl.hostname || "localhost";
      const port = parsedUrl.port || "5432";
      const dbname = parsedUrl.pathname ? parsedUrl.pathname.slice(1) : ""; // Убираем ведущий /

      if (!dbname) {
        console.error(chalk.red("✗ Database name not specified in DATABASE_URL"));
        process.exit(1);
      }

      // Проверяем наличие psql локально
      let useDocker = false;
      let dockerContainer = "";
      
      try {
        execSync(isWindows ? "where psql" : "which psql", { stdio: "ignore" });
      } catch {
        // psql не найден локально, пробуем Docker
        useDocker = true;
        console.log(chalk.blue("  psql not found locally, trying Docker..."));
        
        // Пробуем найти контейнер PostgreSQL
        try {
          // Список запущенных контейнеров
          const containersOutput = execSync("docker ps --format {{.Names}}", { encoding: "utf8" });
          const containers = containersOutput.trim().split("\n")
            .filter((c: string) => c.trim())
            .map((c: string) => c.trim().replace(/['"]/g, "")); // Убираем кавычки
          
          // Ищем контейнер с postgres в имени
          const postgresContainer = containers.find((c: string) => 
            c.toLowerCase().includes("postgres") || 
            c.toLowerCase().includes("db") ||
            c.toLowerCase().includes("database")
          );
          
          if (postgresContainer) {
            dockerContainer = postgresContainer;
            console.log(chalk.gray(`  Found Docker container: ${dockerContainer}`));
            
            // Проверяем, что контейнер действительно запущен
            try {
              const checkOutput = execSync(`docker ps --filter "name=^${dockerContainer}$" --format {{.Names}}`, { encoding: "utf8", stdio: "pipe" });
              if (!checkOutput.trim()) {
                console.error(chalk.red(`✗ Container ${dockerContainer} is not running`));
                process.exit(1);
              }
            } catch {
              console.error(chalk.red(`✗ Container ${dockerContainer} is not running`));
              process.exit(1);
            }
          } else {
            // Пробуем стандартные имена
            const standardNames = ["postgres", "postgresql", "db", "database", "vira-db", "vira_db"];
            for (const name of standardNames) {
              try {
                const checkOutput = execSync(`docker ps --filter "name=^${name}$" --format {{.Names}}`, { encoding: "utf8", stdio: "pipe" });
                if (checkOutput.trim()) {
                  dockerContainer = name;
                  console.log(chalk.gray(`  Using Docker container: ${dockerContainer}`));
                  break;
                }
              } catch {
                // Продолжаем поиск
              }
            }
          }
          
          if (!dockerContainer) {
            console.error(chalk.red("✗ psql not found and no PostgreSQL Docker container detected"));
            console.log(chalk.yellow("   Please install PostgreSQL client tools or ensure Docker container is running"));
            console.log(chalk.yellow("   Container name should contain 'postgres', 'db', or 'database'"));
            process.exit(1);
          }
        } catch (dockerError) {
          console.error(chalk.red("✗ Docker not available or PostgreSQL container not found"));
          console.log(chalk.yellow("   Please install PostgreSQL client tools (psql) or ensure Docker is running"));
          process.exit(1);
        }
      }
      
      // Устанавливаем переменную окружения PGPASSWORD для psql
      const env = {
        ...process.env,
        PGPASSWORD: password,
      };

      // Функция для выполнения SQL запроса
      const executeSQL = async (sql: string): Promise<string> => {
        const tempFile = path.join(seedsPath, `.temp_${Date.now()}.sql`);
        await fs.writeFile(tempFile, sql);
        
        try {
          if (useDocker && dockerContainer) {
            const containerPath = `/tmp/temp_${Date.now()}.sql`;
            execSync(`docker cp "${tempFile}" "${dockerContainer}":${containerPath}`, { stdio: "ignore" });
            const escapedPassword = password.replace(/'/g, "'\\''");
            const output = execSync(
              `docker exec -e PGPASSWORD='${escapedPassword}' "${dockerContainer}" psql -U ${user} -d ${dbname} -t -A -f ${containerPath}`,
              { encoding: "utf8", stdio: "pipe" }
            );
            execSync(`docker exec "${dockerContainer}" rm ${containerPath}`, { stdio: "ignore" });
            return output.trim();
          } else {
            const output = execSync(
              `psql -h ${host} -p ${port} -U ${user} -d ${dbname} -t -A -f "${tempFile}"`,
              { encoding: "utf8", stdio: "pipe", env: env }
            );
            return output.trim();
          }
        } finally {
          await fs.remove(tempFile);
        }
      };

      // Получаем список уже выполненных seed-файлов
      let executedSeeds: Set<string> = new Set();
      try {
        const checkTableSQL = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'seed_history'
          );
        `;
        const tableExists = await executeSQL(checkTableSQL);
        
        if (tableExists === "t") {
          const getExecutedSQL = `SELECT seed_file FROM seed_history WHERE success = true;`;
          const executedOutput = await executeSQL(getExecutedSQL);
          if (executedOutput) {
            executedSeeds = new Set(executedOutput.split("\n").filter((f: string) => f.trim()));
          }
        }
      } catch (error) {
        // Игнорируем ошибки при проверке - возможно таблица еще не создана
        console.log(chalk.yellow("  ⚠ Could not check seed history, will execute all seeds"));
      }

      // Фильтруем уже выполненные seed-файлы
      const pendingSeeds = sqlFiles.filter((file: string) => !executedSeeds.has(file));
      
      if (pendingSeeds.length === 0) {
        console.log(chalk.green(`\n✓ All seeds have already been executed`));
        return;
      }

      if (pendingSeeds.length < sqlFiles.length) {
        console.log(chalk.blue(`\n  ${sqlFiles.length - pendingSeeds.length} seed(s) already executed, ${pendingSeeds.length} pending`));
      }

      for (const file of pendingSeeds) {
        const filePath = path.join(seedsPath, file);
        const startTime = Date.now();
        console.log(chalk.blue(`  Running ${file}...`));
        
        let success = false;
        let errorMsg = "";
        
        try {
          if (useDocker && dockerContainer) {
            // Копируем файл в контейнер и выполняем
            const fileName = path.basename(filePath);
            const containerPath = `/tmp/${fileName}`;
            
            // Копируем файл в контейнер (используем кавычки для имени контейнера на случай пробелов)
            execSync(
              `docker cp "${filePath}" "${dockerContainer}":${containerPath}`,
              { stdio: "inherit" }
            );
            
            // Выполняем SQL в контейнере (экранируем пароль и используем кавычки)
            const escapedPassword = password.replace(/'/g, "'\\''");
            execSync(
              `docker exec -e PGPASSWORD='${escapedPassword}' "${dockerContainer}" psql -U ${user} -d ${dbname} -f ${containerPath}`,
              {
                stdio: "inherit",
                cwd: process.cwd(),
              }
            );
            
            // Удаляем временный файл из контейнера
            try {
              execSync(`docker exec "${dockerContainer}" rm ${containerPath}`, { stdio: "ignore" });
            } catch {
              // Игнорируем ошибки удаления
            }
          } else {
            // Используем локальный psql
            execSync(
              `psql -h ${host} -p ${port} -U ${user} -d ${dbname} -f "${filePath}"`,
              {
                stdio: "inherit",
                cwd: process.cwd(),
                env: env,
              }
            );
          }
          const executionTime = Date.now() - startTime;
          success = true;
          console.log(chalk.green(`  ✓ ${file} completed (${executionTime}ms)`));
          
          // Записываем успешное выполнение в seed_history
          try {
            const insertSQL = `
              INSERT INTO seed_history (seed_file, execution_time_ms, success)
              VALUES ('${file.replace(/'/g, "''")}', ${executionTime}, true)
              ON CONFLICT (seed_file) DO UPDATE SET
                executed_at = CURRENT_TIMESTAMP,
                execution_time_ms = ${executionTime},
                success = true,
                error_message = NULL;
            `;
            await executeSQL(insertSQL);
          } catch (historyError) {
            // Игнорируем ошибки записи истории
            console.log(chalk.yellow(`  ⚠ Could not record seed history: ${historyError instanceof Error ? historyError.message : String(historyError)}`));
          }
        } catch (error: any) {
          const executionTime = Date.now() - startTime;
          errorMsg = error.message || String(error);
          console.error(chalk.red(`  ✗ ${file} failed: ${errorMsg}`));
          
          // Записываем неудачное выполнение в seed_history
          try {
            const insertSQL = `
              INSERT INTO seed_history (seed_file, execution_time_ms, success, error_message)
              VALUES ('${file.replace(/'/g, "''")}', ${executionTime}, false, '${errorMsg.replace(/'/g, "''")}')
              ON CONFLICT (seed_file) DO UPDATE SET
                executed_at = CURRENT_TIMESTAMP,
                execution_time_ms = ${executionTime},
                success = false,
                error_message = '${errorMsg.replace(/'/g, "''")}';
            `;
            await executeSQL(insertSQL);
          } catch (historyError) {
            // Игнорируем ошибки записи истории
          }
          // Продолжаем выполнение остальных файлов
        }
      }
    } else {
      // Для других драйверов можно добавить поддержку позже
      console.error(chalk.red(`✗ Seeds are currently only supported for PostgreSQL`));
      process.exit(1);
    }

    console.log(chalk.green(`\n✓ Seeds completed successfully`));
  } catch (error: any) {
    console.error(chalk.red(`✗ Seeds failed: ${error.message}`));
    process.exit(1);
  }
}

async function generateEventHandler(name: string, dir: string) {
  const targetDir = path.join(process.cwd(), dir);
  await fs.ensureDir(targetDir);
  const fileName = name.replace(/[^a-zA-Z0-9]+/g, "_");
  const content = eventHandlerTemplate(name);
  await fs.writeFile(path.join(targetDir, `${fileName}.go`), content);
  // Also create registry entry file (one per event) to auto-register
  const handlerFunc = toPascal(name);
  const registryFile = path.join(targetDir, `registry_${fileName}.go`);
  if (!(await fs.pathExists(registryFile))) {
    const registryContent = `package events

func init() {
  Register("${name}", ${handlerFunc})
}
`;
    await fs.writeFile(registryFile, registryContent);
  }
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Маппинг TypeScript типов в Go типы
 */
function mapTypeScriptToGo(tsType: string): string {
  const mapping: Record<string, string> = {
    "string": "string",
    "number": "int",
    "boolean": "bool",
    "Date": "time.Time",
    "date": "time.Time",
  };
  return mapping[tsType.toLowerCase()] || "string";
}

function toPascal(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

/**
 * Генерация CRUD handlers для ресурса
 */
async function generateCRUDHandler(name: string, dir: string, modelName?: string) {
  const safeName = name.toLowerCase();
  const handlerName = capitalize(name);
  const model = modelName || capitalize(name);
  const targetDir = path.join(process.cwd(), dir);
  await fs.ensureDir(targetDir);

  // Попытка определить модуль из go.mod
  let modulePath = "your-project/backend";
  try {
    // Ищем go.mod в разных возможных местах
    const possiblePaths = [
      path.join(process.cwd(), "go.mod"), // корень проекта
      path.join(process.cwd(), dir, "..", "..", "go.mod"), // backend/../go.mod
      path.join(process.cwd(), "backend", "go.mod"), // backend/go.mod
    ];

    for (const goModPath of possiblePaths) {
      if (await fs.pathExists(goModPath)) {
        const goModContent = await fs.readFile(goModPath, "utf8");
        const moduleMatch = goModContent.match(/^module\s+(.+)$/m);
        if (moduleMatch) {
          modulePath = moduleMatch[1];
          break;
        }
      }
    }
  } catch (e) {
    // Игнорируем ошибки, используем дефолтный путь
  }

  const handlerCode = `package handlers

import (
  "encoding/json"
  "net/http"
  "strconv"
  "time"
  "github.com/gorilla/mux"
  "github.com/go-playground/validator/v10"
  "github.com/google/uuid"
  
  "${modulePath}/internal/models"
)

var validate = validator.New()

// 🎯 Production-ready: Pagination support
type PaginationParams struct {
  Limit  int \`json:"limit"\`
  Offset int \`json:"offset"\`
  Cursor string \`json:"cursor,omitempty"\`
}

// 🎯 Production-ready: List response with pagination
type ${handlerName}ListResponse struct {
  Items  []models.${model} \`json:"items"\`
  Total  int        \`json:"total"\`
  Limit  int        \`json:"limit"\`
  Offset int        \`json:"offset"\`
  HasMore bool      \`json:"has_more"\`
}

// 🎯 Production-ready: Event logging structure
type ${handlerName}Event struct {
  ID        string    \`json:"id"\`
  Type      string    \`json:"type"\` // created, updated, deleted
  EntityID  string    \`json:"entity_id"\`
  UserID    string    \`json:"user_id,omitempty"\`
  OldValue  *models.${model} \`json:"old_value,omitempty"\`
  NewValue  *models.${model} \`json:"new_value,omitempty"\`
  Timestamp time.Time \`json:"timestamp"\`
}

// 🎯 Production-ready: Batch request/response
type BatchUpdateRequest struct {
  IDs     []string           \`json:"ids" validate:"required,min=1"\`
  Payload map[string]interface{} \`json:"payload" validate:"required"\`
}

type BatchDeleteRequest struct {
  IDs []string \`json:"ids" validate:"required,min=1"\`
}

// List${handlerName} handles GET /${safeName} with pagination
func List${handlerName}(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")
  
  // 🎯 Production-ready: Parse pagination params (limit, offset, cursor)
  limit := 50 // default
  offset := 0
  
  if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
    if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 && parsed <= 100 {
      limit = parsed
    }
  }
  
  if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
    if parsed, err := strconv.Atoi(offsetStr); err == nil && parsed >= 0 {
      offset = parsed
    }
  }
  
  // TODO: Implement actual DB query with limit/offset
  // items, total, err := db.List${handlerName}(limit, offset)
  // if err != nil {
  //   http.Error(w, err.Error(), http.StatusInternalServerError)
  //   return
  // }
  
  // 🎯 Production-ready: Redis caching (commented for now - implement with your cache layer)
  // cacheKey := fmt.Sprintf("${safeName}:list:limit=%d:offset=%d", limit, offset)
  // if cached := redis.Get(cacheKey); cached != nil {
  //   json.NewEncoder(w).Encode(cached)
  //   return
  // }
  
  response := ${handlerName}ListResponse{
    Items:   []models.${model}{},
    Total:   0,
    Limit:   limit,
    Offset:  offset,
    HasMore: false,
  }
  
  // 🎯 Production-ready: Cache response (TTL 30s for lists)
  // redis.Set(cacheKey, response, 30*time.Second)
  
  json.NewEncoder(w).Encode(response)
}

// Get${handlerName} handles GET /${safeName}/{id}
func Get${handlerName}(w http.ResponseWriter, r *http.Request) {
  vars := mux.Vars(r)
  id := vars["id"]
  
  w.Header().Set("Content-Type", "application/json")
  
  // 🎯 Production-ready: Redis caching for detail views
  // cacheKey := fmt.Sprintf("${safeName}:detail:%s", id)
  // if cached := redis.Get(cacheKey); cached != nil {
  //   json.NewEncoder(w).Encode(cached)
  //   return
  // }
  
  // TODO: Implement actual DB query
  // item, err := db.Get${handlerName}(id)
  // if err != nil {
  //   http.Error(w, err.Error(), http.StatusNotFound)
  //   return
  // }
  
  item := models.${model}{ID: id}
  
  // 🎯 Production-ready: Cache detail (TTL 5min)
  // redis.Set(cacheKey, item, 5*time.Minute)
  
  json.NewEncoder(w).Encode(item)
}

// Create${handlerName} handles POST /${safeName}
func Create${handlerName}(w http.ResponseWriter, r *http.Request) {
  var input models.${model}
  
  if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
    http.Error(w, "Invalid JSON", http.StatusBadRequest)
    return
  }
  
  // 🎯 Production-ready: Validation (email, phone, unique fields)
  if err := validate.Struct(input); err != nil {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusBadRequest)
    json.NewEncoder(w).Encode(map[string]string{
      "error": "Validation failed",
      "details": err.Error(),
    })
    return
  }
  
  // Generate UUID if not provided
  if input.ID == "" {
    input.ID = uuid.New().String()
  }
  
  input.CreatedAt = time.Now()
  input.UpdatedAt = time.Now()
  
  // TODO: Implement actual DB insert
  // if err := db.Create${handlerName}(&input); err != nil {
  //   http.Error(w, err.Error(), http.StatusInternalServerError)
  //   return
  // }
  
  // 🎯 Production-ready: Log event for audit trail
  // event := ${handlerName}Event{
  //   ID:        uuid.New().String(),
  //   Type:      "created",
  //   EntityID:  input.ID,
  //   NewValue:  &input,
  //   Timestamp: time.Now(),
  // }
  // logEvent(event) // Implement event logging to client_events table
  
  // 🎯 Production-ready: Invalidate cache
  // redis.Del("${safeName}:list:*")
  
  // 🎯 Production-ready: Emit VRP event (batchEmit for large lists)
  // vrp.BatchEmit("${safeName}", "created", input)
  
  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(http.StatusCreated)
  json.NewEncoder(w).Encode(input)
}

// Update${handlerName} handles PUT /${safeName}/{id}
func Update${handlerName}(w http.ResponseWriter, r *http.Request) {
  vars := mux.Vars(r)
  id := vars["id"]
  
  var input models.${model}
  if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
    http.Error(w, "Invalid JSON", http.StatusBadRequest)
    return
  }
  
  // 🎯 Production-ready: Get old value for event logging
  // oldValue, _ := db.Get${handlerName}(id)
  
  // 🎯 Production-ready: Validation
  if err := validate.Struct(input); err != nil {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusBadRequest)
    json.NewEncoder(w).Encode(map[string]string{
      "error": "Validation failed",
      "details": err.Error(),
    })
    return
  }
  
  input.ID = id
  input.UpdatedAt = time.Now()
  
  // TODO: Implement actual DB update
  // if err := db.Update${handlerName}(&input); err != nil {
  //   http.Error(w, err.Error(), http.StatusNotFound)
  //   return
  // }
  
  // 🎯 Production-ready: Log event with old/new values
  // event := ${handlerName}Event{
  //   ID:        uuid.New().String(),
  //   Type:      "updated",
  //   EntityID:  id,
  //   OldValue:  oldValue,
  //   NewValue:  &input,
  //   Timestamp: time.Now(),
  // }
  // logEvent(event)
  
  // 🎯 Production-ready: Invalidate cache
  // redis.Del(fmt.Sprintf("${safeName}:detail:%s", id), "${safeName}:list:*")
  
  // 🎯 Production-ready: Emit VRP diff for real-time updates
  // vrp.SendDiff("${safeName}:" + id, input)
  
  w.Header().Set("Content-Type", "application/json")
  json.NewEncoder(w).Encode(input)
}

// Delete${handlerName} handles DELETE /${safeName}/{id}
func Delete${handlerName}(w http.ResponseWriter, r *http.Request) {
  vars := mux.Vars(r)
  id := vars["id"] // id will be used when implementing DB delete and event logging
  
  // 🎯 Production-ready: Get value for event logging
  // oldValue, _ := db.Get${handlerName}(id)
  
  // TODO: Implement actual DB delete
  // if err := db.Delete${handlerName}(id); err != nil {
  //   http.Error(w, err.Error(), http.StatusNotFound)
  //   return
  // }
  
  // 🎯 Production-ready: Log deletion event
  // event := ${handlerName}Event{
  //   ID:        uuid.New().String(),
  //   Type:      "deleted",
  //   EntityID:  id,
  //   OldValue:  oldValue,
  //   Timestamp: time.Now(),
  // }
  // logEvent(event)
  
  // 🎯 Production-ready: Invalidate cache
  // redis.Del(fmt.Sprintf("${safeName}:detail:%s", id), "${safeName}:list:*")
  
  // 🎯 Production-ready: Emit VRP event
  // vrp.SendEvent("${safeName}", "deleted", map[string]string{"id": id})
  
  w.WriteHeader(http.StatusNoContent)
}

// 🎯 Production-ready: BatchUpdate handles POST /${safeName}/batch/update
func BatchUpdate${handlerName}(w http.ResponseWriter, r *http.Request) {
  var req BatchUpdateRequest
  if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
    http.Error(w, "Invalid JSON", http.StatusBadRequest)
    return
  }
  
  if err := validate.Struct(req); err != nil {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusBadRequest)
    json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
    return
  }
  
  // TODO: Implement batch update in transaction
  // tx := db.Begin()
  // for _, id := range req.IDs {
  //   if err := tx.Update${handlerName}(id, req.Payload); err != nil {
  //     tx.Rollback()
  //     http.Error(w, err.Error(), http.StatusInternalServerError)
  //     return
  //   }
  // }
  // tx.Commit()
  
  // 🎯 Production-ready: Batch emit VRP events
  // vrp.BatchEmit("${safeName}", "updated", req)
  
  // Invalidate cache
  // redis.Del("${safeName}:*")
  
  w.Header().Set("Content-Type", "application/json")
  json.NewEncoder(w).Encode(map[string]interface{}{
    "updated": len(req.IDs),
    "ids": req.IDs,
  })
}

// 🎯 Production-ready: BatchDelete handles POST /${safeName}/batch/delete
func BatchDelete${handlerName}(w http.ResponseWriter, r *http.Request) {
  var req BatchDeleteRequest
  if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
    http.Error(w, "Invalid JSON", http.StatusBadRequest)
    return
  }
  
  if err := validate.Struct(req); err != nil {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusBadRequest)
    json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
    return
  }
  
  // TODO: Implement batch delete in transaction
  // tx := db.Begin()
  // for _, id := range req.IDs {
  //   if err := tx.Delete${handlerName}(id); err != nil {
  //     tx.Rollback()
  //     http.Error(w, err.Error(), http.StatusInternalServerError)
  //     return
  //   }
  // }
  // tx.Commit()
  
  // 🎯 Production-ready: Batch emit VRP events
  // vrp.BatchEmit("${safeName}", "deleted", req)
  
  // Invalidate cache
  // redis.Del("${safeName}:*")
  
  w.WriteHeader(http.StatusNoContent)
}
`;

  await fs.writeFile(path.join(targetDir, `${safeName}_crud.go`), handlerCode);
}

/**
 * Валидация проекта
 */
async function validateProject() {
  const cwd = process.cwd();
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(chalk.blue("\nValidating Vira project...\n"));

  // Проверка структуры frontend проекта
  const frontendPath = path.join(cwd, "frontend");
  const frontendExists = await fs.pathExists(frontendPath);

  if (frontendExists) {
    const requiredFiles = [
      "package.json",
      "vite.config.ts",
      "tsconfig.json",
      "src/main.tsx",
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(frontendPath, file);
      if (!(await fs.pathExists(filePath))) {
        errors.push(`Missing frontend file: ${file}`);
      }
    }

    // Проверка структуры директорий
    const requiredDirs = ["src/components", "src/services", "src/pages"];
    for (const dir of requiredDirs) {
      const dirPath = path.join(frontendPath, dir);
      if (!(await fs.pathExists(dirPath))) {
        warnings.push(`Missing frontend directory: ${dir}`);
      }
    }
  } else {
    // Проверка standalone frontend
    if (!(await fs.pathExists(path.join(cwd, "package.json")))) {
      errors.push("Missing package.json");
    }
  }

  // Проверка структуры backend проекта
  const backendPath = path.join(cwd, "backend");
  if (await fs.pathExists(backendPath)) {
    const requiredFiles = ["go.mod", "cmd/api/main.go"];
    for (const file of requiredFiles) {
      const filePath = path.join(backendPath, file);
      if (!(await fs.pathExists(filePath))) {
        errors.push(`Missing backend file: ${file}`);
      }
    }
  }

  // Вывод результатов
  if (errors.length > 0) {
    console.log(chalk.red("✗ Errors found:"));
    errors.forEach((err) => console.log(chalk.red(`  - ${err}`)));
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow("\n⚠ Warnings:"));
    warnings.forEach((warn) => console.log(chalk.yellow(`  - ${warn}`)));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(chalk.green("✓ Project structure is valid!"));
  } else if (errors.length === 0) {
    console.log(chalk.green("\n✓ Project structure is valid (with warnings)"));
  } else {
    console.log(chalk.red("\n✗ Project validation failed"));
    process.exit(1);
  }
}


