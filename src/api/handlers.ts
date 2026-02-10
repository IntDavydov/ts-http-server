import { Request, Response } from "express";
import { config } from "../config.js";
import { respondWithError, respondWithJSON } from "./json.js";
export function handlerReadiness(req: Request, res: Response): void {
  res.set({
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.status(200).send("OK");
}

export function handlerMetrics(req: Request, res: Response): void {
  res.set({
    "Content-Type": "text/html; charset=utf-8",
  });

  res.status(200).send(`
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.fileserverHits} times!</p>
      </body>
    </html>
  `);
}

export function handlerReset(req: Request, res: Response): void {
  res.set({
    "Content-Type": "text/plain; charset=utf-8",
  });

  config.fileserverHits = 0;

  res.status(200).send("Hits reseted");
}

export function handlerValidate(req: Request, res: Response): void {
  type Params = {
    body: string;
  };

  const params: Params = req.body;
  const { body: chirp } = params;
  const maxLength = 140;

  if (chirp.length > maxLength) {
    respondWithError(res, 400, "Chirp is too long");
    return;
  }

  const profanity = new Set(["kerfuffle", "sharbert", "fornax"]);
  const words = chirp.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    if (profanity.has(word.toLowerCase())) {
      words[i] = "****";
    }
  }

  respondWithJSON(res, 200, { cleanedBody: words.join(" ") });
}
