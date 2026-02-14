import express from "express";
import {
  handlerReadiness,
  handlerMetrics,
  handlerReset,
} from "./api/handlers/handlers.js";
import {
  errorMiddleware,
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middlewares/middlewares.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import {
  handlerAddUser,
  handlerLoginUser,
  handlerUpdateUser,
} from "./api/handlers/users.js";
import {
  handleGetChirp,
  handleGetChirps,
  handlerAddChirp,
  handlerDeleteChirp,
} from "./api/handlers/chirps.js";
import {
  handlerRefreshToken,
  handlerRevokeToken,
} from "./api/handlers/refresh-tokens.js";
import { handlerUpdateChirpyRed } from "./api/handlers/webhooks.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handleGetChirps(req, res)).catch(next);
});
app.get("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(handleGetChirp(req, res).catch(next));
});

app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});
app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerAddUser(req, res)).catch(next);
});
app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerAddChirp(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlerLoginUser(req, res)).catch(next);
});
app.post("/api/refresh", (req, res, next) => {
  Promise.resolve(handlerRefreshToken(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
  Promise.resolve(handlerRevokeToken(req, res)).catch(next);
});
app.post("/api/polka/webhooks", (req, res, next) => {
  Promise.resolve(handlerUpdateChirpyRed(req, res)).catch(next);
});

app.put("/api/users", (req, res, next) => {
  Promise.resolve(handlerUpdateUser(req, res)).catch(next);
});

app.delete("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(handlerDeleteChirp(req, res)).catch(next);
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
