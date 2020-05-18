import "dotenv/config";
import * as cors from "cors";
import * as express from "express";
import * as cron from "node-cron";
import { createServer } from "http";
import { ApolloServer } from "apollo-server-express";
import { Prisma as PrismaBinding } from "prisma-binding";
import { buildFederatedSchema } from "@apollo/federation";
import { applyMiddleware } from "graphql-middleware";

import { prisma, Prisma as PrismaType } from "./generated/prisma-client";
import { typeDefs } from "./generated/prisma-client/prisma-schema";
import schema from "./schema";
import resolvers from "./resolvers";
import { pubSub } from "./subscriptions";
import { getApiRoutes } from "./routes";
import { getContextDataFromHeader } from "./helpers";
import middlewares from "./middleware";
import { subscribeToLogEvents } from "./subscriptions/logEvents";
import { subscribeToServiceOrderEvents } from "./subscriptions/serviceOrderEvents";
import { checkServices } from "./helpers/notificationHelper";

export interface Context {
  request: any;
  prismaClient: PrismaType;
  prismaBindings: PrismaBinding;
  authToken?: string;
  currentUser?: object;
  app?: string;
  relationCodes?: string[];
}

const PORT = process.env.PORT || 8000;

const app = express();
app.use(cors());

cron.schedule("* 8 * * *", checkServices);

const server = new ApolloServer({
  schema: applyMiddleware(
    buildFederatedSchema([
      {
        typeDefs: schema,
        resolvers
      }
    ]),
    middlewares
  ),
  tracing: true,
  context: async ({ req }) =>
    ({
      request: req,

      pubSub: pubSub,

      // prisma client generated by `prisma generate`
      prismaClient: prisma as PrismaType,

      // prisma-bindings for gelegating resolvers to the prisma
      prismaBindings: new PrismaBinding({
        typeDefs,
        endpoint: process.env.PRISMA_ENDPOINT,
        secret: process.env.PRISMA_SECRET
      }),
      ...getContextDataFromHeader(req)
    } as Context)
});

server.applyMiddleware({ app, path: "/graphql" });

app.use("/api", getApiRoutes(prisma));

const httpServer = createServer(app);

httpServer.listen({ port: PORT }, () => {
  console.log(`server ready at http://localhost:${PORT}${server.graphqlPath}`);
  subscribeToLogEvents();
  subscribeToServiceOrderEvents();
});