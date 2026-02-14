import { Request, Response } from "express";
import { config } from "../../config.js";
import { respondWithJSON } from "../json.js";
import { ForbiddenError } from "../errors.js";
import { deleteUsers } from "../../db/queries/users.js";
export function handlerReadiness(_: Request, res: Response): void {
  res.set({
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.status(200).send("OK");
}

export function handlerMetrics(_: Request, res: Response): void {
  res.set({
    "Content-Type": "text/html; charset=utf-8",
  });

  res.status(200).send(`
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
      </body>
    </html>
  `);
}

export async function handlerReset(_: Request, res: Response): Promise<void> {
  if (config.api.platform !== "dev") {
    console.log(config.api.platform);
    throw new ForbiddenError("Reset allowed only in dev environment");
  }

  config.api.fileserverHits = 0;
  const count = await deleteUsers(); // return count of deleted rows

  respondWithJSON(res, 200, {
    message: `${count} users were deleted from db, hits reset to 0`,
  });
}
