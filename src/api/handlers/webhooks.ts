import { Request, Response } from "express";
import { respondWithJSON } from "../json.js";
import { BadRequestError, DBError, NotFoundError, UnauthorizedError } from "../errors.js";
import { getUserById, updateChirpyRed } from "#db/queries/users";
import { getAPIKey } from "../auth.js";
import { config } from "#config";

export async function handlerUpdateChirpyRed(
  req: Request,
  res: Response,
): Promise<void> {
  type Params = {
    event: string;
    data: {
      userId: string;
    };
  };

  const polkaKey = getAPIKey(req);
  if (!polkaKey || polkaKey !== config.webhook.polkaAPI)
    throw new UnauthorizedError("Access denied");

  const params: Params = req.body;
  const {
    event,
    data: { userId },
  } = params;

  if (!event || !userId) throw new BadRequestError("Malformed webhook request");

  const eventType = event.split(".")[1];
  if (eventType !== "upgraded") {
    respondWithJSON(res, 204, {});
    return;
  }

  const user = await getUserById(userId);
  if (!user) throw new NotFoundError("User not found");

  const updatedMembership = updateChirpyRed({ userId });
  if (!updatedMembership) throw new DBError("Cannot update membership");

  respondWithJSON(res, 204, {});
}

