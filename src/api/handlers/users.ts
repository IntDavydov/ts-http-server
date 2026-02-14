import { Request, Response } from "express";
import {
  BadRequestError,
  DBError,
  NotFoundError,
  UnauthorizedError,
} from "../errors.js";
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateChirpyRed,
  updateUserCreds,
} from "../../db/queries/users.js";
import { respondWithJSON } from "../json.js";
import {
  checkPasswordHash,
  getAPIKey,
  getBearerToken,
  hashPassword,
  makeJWT,
  makeRefreshToken,
  validateJWT,
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
    isChirpyRed: newUser.isChirpyRed,
  } satisfies UserResponse);
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

  const token = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);

  const refreshToken = makeRefreshToken();
  const saved = await addRefreshToken(user.id, refreshToken);

  if (!saved) {
    throw new DBError("Cannot create new refresh token");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token,
    refreshToken: saved.token,
    isChirpyRed: user.isChirpyRed,
  } satisfies LoginResponse);
}

export async function handlerUpdateUser(
  req: Request,
  res: Response,
): Promise<void> {
  type Params = {
    email: string;
    password: string;
  };

  const jwt = getBearerToken(req);
  const userId = validateJWT(jwt, config.jwt.secret);

  const params: Params = req.body;

  const { password, email } = params;

  if (!password || !email) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(password);
  const updatedUser = await updateUserCreds({ userId, email, hashedPassword });

  if (!updatedUser) {
    throw new DBError(`Email or password cannot be updated`);
  }

  const { hashedPassword: hp, ...other } = updatedUser;
  respondWithJSON(res, 200, {
    ...other,
  } satisfies UserResponse);
}


