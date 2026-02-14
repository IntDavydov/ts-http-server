import { describe, it, expect, beforeAll } from "vitest";
import {
  extractBearerToken,
  getBearerToken,
  makeJWT,
  validateJWT,
} from "../auth.js";

import { hashPassword, checkPasswordHash } from "../auth.js";
import { BadRequestError, UnauthorizedError } from "../errors.js";

import httpMocks from "node-mocks-http";

describe("Password Hashing", () => {
  const password1 = "qwerty123";
  const passwrod2 = "qwerty1234";

  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(passwrod2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(hash1, password1);
    expect(result).toBe(true);
  });
});

describe("JWT validation", () => {
  const secret = "I love dogs and cats";
  const makeJWTArgs = ["ad2vlqows14c2", 5, secret] as const; // in seconds
  let token: string; // token is mutable !!!

  beforeAll(() => {
    token = makeJWT(...makeJWTArgs);
  });

  it("should return jwt string", () => {
    expect(token).toBeTypeOf("string");
  });

  it("should return user id decoded from JWT", () => {
    expect(validateJWT(token, secret)).toEqual(makeJWTArgs[0]);
  });

  it("should throw token expired error", async () => {
    token = makeJWT(makeJWTArgs[0], -2, makeJWTArgs[2]);
    expect(() => validateJWT(token, secret)).toThrow(UnauthorizedError);
    expect(() => validateJWT(token, secret)).toThrow(/Token expired at/);
  });

  it("should throw token validation error", () => {
    token = makeJWT(makeJWTArgs[0], makeJWTArgs[1], "ching chang hon chi");
    expect(() => validateJWT(token, secret)).toThrow(UnauthorizedError);
    expect(() => validateJWT(token, secret)).toThrow(/Wrong input:/);
  });
});

describe("extractBearerToken", () => {
  const token = "sijfoj384hgdndn893r";
  const req = httpMocks.createRequest({
    method: "GET",
    url: "/user/123",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  it("should extract a token from auth header", () => {
    const result = getBearerToken(req);
    expect(result).toBe(token);
  });

  it("should extract the token even if there ara extra parts", () => {
    const header = `Bearer ${token} gibberish`;
    expect(extractBearerToken(header)).toBe(token);
  });

  it("should throw a BadRequestError if the header does not contain at least two parts", () => {
    const header = "Bearer";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it('should throw a BadRequestError if the header does not start with "Bearer"', () => {
    const header = "Basic mySecretToken";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it("should throw a BadRequestError if the header is an empty string", () => {
    const header = "";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });
});

// write test for refresh tokens