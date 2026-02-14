import { Request, Response } from "express";
import {
  BadRequestError,
  DBError,
  NotFoundError,
  UnauthorizedError,
} from "../errors.js";
import { respondWithJSON } from "../json.js";
import { addChirp, getChirp, getChirps } from "../../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../../config.js";

export async function handleGetChirps(
  _: Request,
  res: Response,
): Promise<void> {
  const chirps = await getChirps();

  if (!chirps) {
    throw new DBError("There are no chirps");
  }

  respondWithJSON(res, 200, chirps);
}

export async function handleGetChirp(
  req: Request,
  res: Response,
): Promise<void> {
  const chirpId = req.params.chirpId;
  if (!chirpId || Array.isArray(chirpId)) {
    throw new BadRequestError("Chirp id should be a string not an array");
  }

  const chirp = await getChirp(chirpId);
  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  respondWithJSON(res, 200, chirp);
}

export async function handlerAddChirp(
  req: Request,
  res: Response,
): Promise<void> {
  type Params = {
    body: string;
  };

  const token = getBearerToken(req)
  const userId = validateJWT(token, config.jwt.secret)

  const params: Params = req.body;
  const cleaned = validateChirpParams(params.body, userId);

  const newChirp = await addChirp({ body: cleaned, userId });
  if (!newChirp) {
    throw new DBError("Can't find user with the given id");
  }

  respondWithJSON(res, 201, {
    id: newChirp.id,
    createdAt: newChirp.createdAt,
    updatedAt: newChirp.updatedAt,
    body: newChirp.body,
    userId: newChirp.userId,
  });
}

function validateChirpParams(body: string, userId: string): string {
  if (!userId) {
    throw new UnauthorizedError("You are not authorized. Invalid credentials");
  }

  if (!body) {
    throw new BadRequestError(
      "Where is your chirp? Please enter the chirp and try again.",
    );
  }

  const maxLength = 140;
  if (body.length > maxLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const profanity = new Set(["kerfuffle", "sharbert", "fornax"]);
  return getCleanedBody(body, profanity);
}

function getCleanedBody(body: string, profanity: Set<string>) {
  const words = body.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (profanity.has(word.toLowerCase())) {
      words[i] = "****";
    }
  }

  const cleaned = words.join(" ");
  return cleaned;
}