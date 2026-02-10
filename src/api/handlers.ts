import { Request, Response } from "express";
import { config } from "../config.js";

export function handlerReadiness(req: Request, res: Response): void {
  res.set({
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.status(200).send("OK");
}

export function handlerRequestsNum(req: Request, res: Response): void {
  res.set({
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.status(200).send(`Hits: ${config.fileserverHits}`);
}

export function handlerReset(req: Request, res: Response): void {
  res.set({
    "Content-Type": "text/plain; charset=utf-8",
  });

  config.fileserverHits = 0;

  res.status(200).send("Hits reseted");
}
