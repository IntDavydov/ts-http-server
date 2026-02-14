import { Request, Response } from "express";
import { getBearerToken, makeJWT } from "../auth.js";
import {
  revokeRefreshToken,
  userForRefreshToken,
} from "../../db/queries/refresh-tokens.js";
import { UnauthorizedError } from "../errors.js";
import { respondWithJSON } from "../json.js";
import { config } from "../../config.js";

export async function handlerRefreshToken(
  req: Request,
  res: Response,
): Promise<void> {
  const refreshToken = getBearerToken(req);

  const result = await userForRefreshToken(refreshToken);
  if (!result) throw new UnauthorizedError("Invalid refresh token");

  const user = result.user;
  const newJWT = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret,
  );

  type response = {
    token: string;
  };

  respondWithJSON(res, 200, {
    token: newJWT,
  } satisfies response);
}

export async function handlerRevokeToken(
  req: Request,
  res: Response,
): Promise<void> {
  const refreshToken = getBearerToken(req);
  revokeRefreshToken(refreshToken);

  respondWithJSON(res, 204, {});
}
