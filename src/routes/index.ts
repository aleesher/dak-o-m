import { Router } from "express";
import { Prisma } from "../generated/prisma-client";
import sync from "./sync";

export const getApiRoutes = (prisma: Prisma) => {
  const api = Router();

  api.use('/sync', sync(prisma));

  return api;
}
