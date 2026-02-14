import type { MigrationConfig } from "drizzle-orm/migrator";
import { NotDefinedError } from "./api/errors.js";

process.loadEnvFile(); // load env to process

type APIConfig = {
  dbURL: string;
  fileserverHits: number;
  platform: string;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type JWTConfig = {
  defaultDuration: number;
  secret: string;
  issuer: string;
};

type Config = {
  api: APIConfig;
  db: DBConfig;
  jwt: JWTConfig;
};

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
    platform: envOrThrow("PLATFORM"),
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig,
  },
  jwt: {
    defaultDuration: 60 * 60,
    secret: envOrThrow("JWT_SECRET"),
    issuer: "chirpy",
  },
};
