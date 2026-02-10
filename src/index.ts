import express from "express";
import {
  handlerReadiness,
  handlerRequestsNum,
  handlerReset,
} from "./api/handlers.js";
import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middlewares.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerRequestsNum);
app.get("/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
