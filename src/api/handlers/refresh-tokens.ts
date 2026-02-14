import { Request, Response } from "express";
import { getBearerToken, makeJWT } from "../auth.js";
import {
  getRefreshToken,
  revokeRefreshToken,
} from "../../db/queries/refresh-tokens.js";
import { DBError, UnauthorizedError } from "../errors.js";
import { respondWithJSON } from "../json.js";
import { RefreshToken } from "../../db/schema.js";
import { getUserById } from "../../db/queries/users.js";
import { config } from "../../config.js";

export async function handlerRefreshToken(
  req: Request,
  res: Response,
): Promise<void> {
  const dbToken = await getDBToken(req);

  const user = await getUserById(dbToken.userId);
  if (!user) throw new DBError("User not found");

  const newJWT = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret,
  );

  respondWithJSON(res, 200, {
    token: newJWT,
  });
}

async function getDBToken(req: Request): Promise<RefreshToken> {
  const refreshToken = getBearerToken(req);
  const dbToken = await getRefreshToken(refreshToken);

  if (!dbToken || Date.now() > dbToken.expiresAt.getTime() || dbToken.revokedAt)
    throw new UnauthorizedError("Invalid refresh token");

  return dbToken;
}

export async function handlerRevokeToken(
  req: Request,
  res: Response,
): Promise<void> {
  const dbToken = await getDBToken(req);
  revokeRefreshToken(new Date(Date.now()), dbToken.token);

  respondWithJSON(res, 204, {});
}
