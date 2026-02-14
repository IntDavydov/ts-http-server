import { Request, Response } from "express";
import { BadRequestError, DBError, UnauthorizedError } from "../errors.js";
import { createUser, getUserByEmail } from "../../db/queries/users.js";
import { respondWithJSON } from "../json.js";
import {
  checkPasswordHash,
  hashPassword,
  makeJWT,
  makeRefreshToken,
} from "../auth.js";
import { config } from "../../config.js";
import { UserResponse } from "../../db/schema.js";
import { addRefreshToken } from "../../db/queries/refresh-tokens.js";

type LoginResponse = UserResponse & {
  token: string;
  refreshToken: string;
};

export async function handlerAddUser(
  req: Request,
  res: Response,
): Promise<void> {
  type Params = {
    password: string;
    email: string;
  };

  const params: Params = req.body;
  const { password, email } = params;

  if (!password || !email) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await createUser({ hashedPassword, email });

  if (!newUser) {
    throw new DBError(`${email} is already exist`);
  }

  respondWithJSON(res, 201, {
    id: newUser.id,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
    email: newUser.email,
  });
}

export async function handlerLoginUser(
  req: Request,
  res: Response,
): Promise<void> {
  type Params = {
    password: string;
    email: string;
  };

  const params: Params = req.body;
  const { password, email } = params;

  if (!password || !email) {
    throw new BadRequestError("Missed required fields");
  }

  const user = await getUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError("incorrect email");
  }

  const isValidated = await checkPasswordHash(user.hashedPassword, password);
  if (!isValidated) {
    throw new UnauthorizedError("incorrect password");
  }

  const duration = config.jwt.defaultDuration; // 3600mls
  const token = makeJWT(user.id, duration, config.jwt.secret);

  const sixtyDays = duration * 1000 * 24 * 60; // 60 days

  const refreshTokenBody = {
    token: makeRefreshToken(),
    userId: user.id,
    expiresAt: new Date(Date.now() + sixtyDays),
  };
  const refreshToken = await addRefreshToken(refreshTokenBody);

  if (!refreshToken) {
    throw new DBError("Cannot create new refresh token");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token,
    refreshToken: refreshToken.token,
  } satisfies LoginResponse);
}

// TODO: helper function
