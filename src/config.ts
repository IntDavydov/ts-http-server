import type { MigrationConfig } from "drizzle-orm/migrator";
import { NotDefinedError } from "./api/erros.js";

process.loadEnvFile();

type APIConfig = {
    dbURL: string;
    fileserverHits: number;
};

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
};

type Config = {
  api: APIConfig,
  db: DBConfig
}

function envOrThrow(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new NotDefinedError(`The ${key} key is not defined in .env`);
  }

  return value;
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
  api: {
    fileserverHits: 0,
    dbURL: envOrThrow("DB_URL"),
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig,
  },
};