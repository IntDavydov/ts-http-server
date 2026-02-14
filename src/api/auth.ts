import crypto from "node:crypto";
import argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { Request } from "express";

const { JsonWebTokenError, TokenExpiredError } = jwt;

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function checkPasswordHash(
  hash: string,
  password: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function makeJWT(
  userId: string,
  expiresIn: number,
  secret: string,
): string {
  const iat = Math.floor(Date.now() / 1000);

  const payload: payload = {
    iss: "chirpy",
    sub: userId,
    iat,
    exp: iat + expiresIn,
  };

  return jwt.sign(payload, secret);
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function validateJWT(tokenString: string, secret: string): string {
  let decoded: payload;

  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (err) {
    handleJWTError(err);
  }

  if (typeof decoded.sub !== "string") {
    throw new BadRequestError("Subject claim must be a string");
  }

  return decoded.sub;
}

function handleJWTError(err: unknown): never {
  if (err instanceof TokenExpiredError)
    throw new UnauthorizedError(`Token expired at ${err.expiredAt}`);

  if (err instanceof JsonWebTokenError)
    throw new UnauthorizedError(`Wrong input: ${err.message}`);

  throw new UnauthorizedError("Token validation failed");
}

export function getBearerToken(req: Request): string {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    throw new UnauthorizedError("Malformed authorization header");
  }

  return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
  const split = header.split(" ");
  if (split.length < 2 || split[0] !== "Bearer")
    throw new BadRequestError("Malformed authorization header");

  return split[1];
}

export function makeRefreshToken(): string {
  const buffer = crypto.randomBytes(32);
  return buffer.toString("hex");
}

// 1796a1bb4e3bcd6a032983fcb035826a919f19553420b94395b26a0550721881
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaGlycHkiLCJzdWIiOiI4YWY5Y2JjYy0yNTg5LTRjNGYtOWRlYy1kNmUyOWI2ZTkxZjciLCJpYXQiOjE3NzEwMTYzNTcsImV4cCI6MTc3MTAxOTk1N30.5VYGW9aVNih3CTfnXiXgDizSDDvuPysVYTHLjQrHrYY