import { Request, Response, NextFunction } from "express";
import { config } from "../../config.js";
import { respondWithError, respondWithGenericError } from "../json.js";
import {
  BadRequestError,
  DBError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors.js";
import jwt from "jsonwebtoken";

export function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      console.log(
        `[NON-OK] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`,
      );
    }
  });

  next();
}

export function middlewareMetricsInc(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  config.api.fileserverHits += 1;
  next();
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const message = "OHHHH NOOOOO";
  console.error(message);

  let statusCode = 500;
  const { TokenExpiredError } = jwt 

  switch (true) {
    case err instanceof BadRequestError:
      statusCode = 400;
      break;
    case err instanceof NotFoundError:
      statusCode = 404;
      break;
    case err instanceof UnauthorizedError || err instanceof TokenExpiredError:
      statusCode = 401;
      break;
    case err instanceof ForbiddenError:
      statusCode = 403;
      break;
    case err instanceof DBError:
      statusCode = 409;
      break;
  }

  if (statusCode === 500) {
    return respondWithGenericError(
      res,
      statusCode,
      `Internal Server Error: ${err.message}`,
    );
  }

  respondWithError(res, statusCode, err.message);
}