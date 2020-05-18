import { forwardTo } from "prisma-binding";

// Forwards to prisma-bindings
export const forwardToPrisma = name => forwardTo(name);

export const wait = (n) => new Promise(resolve => setTimeout(resolve, n));

export const getContextDataFromHeader = (req) => {
  try {
    const context = JSON.parse(req.headers.context);

    return {
      authToken: context.authToken,
      currentUser: context.currentUser,
      app: context.app,
      relationCodes: context.relationCodes,
    }
  } catch(e) {
    console.error(e.message);

    return {
      authToken: '',
      currentUser: null,
      app: '',
      relationCodes: []
    }
  }
}
