import express from "express";
import {
  handlerReadiness,
  handlerMetrics,
  handlerReset,
  handlerValidate,
} from "./api/handlers.js";
import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middlewares.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerValidate);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
