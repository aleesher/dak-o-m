import * as _ from "lodash";
import { getRoles, USER_ROLE } from "./role";

export const MAX_RECORDS_PER_PAGE = process.env.MAX_RECORDS_PER_PAGE
  ? parseInt(process.env.MAX_RECORDS_PER_PAGE)
  : 100;

export const addPerPageLimit = (args) => {
  let elementsPerPage = _.get(args, 'first', MAX_RECORDS_PER_PAGE);
  elementsPerPage = elementsPerPage < MAX_RECORDS_PER_PAGE ? elementsPerPage : MAX_RECORDS_PER_PAGE;

  return {
    ...args,
    first: elementsPerPage,
  };
};

export const APPS = {
  EXTERNAL: 'customer-portal',
  // INTERNAL: "dakdata"
  // ...
};

export const filterByOwner = (args, ctx) => {
  const roles = getRoles(ctx.currentUser);
  if (roles.includes(USER_ROLE.ADMIN)) {
    return args;
  } else if (
    ctx.app === APPS.EXTERNAL &&
    Array.isArray(ctx.relationCodes)
  ) {
    return {
      ...args,
      where: {
        ...(args.where || {}),
        ownerCode_in: ctx.relationCodes
      }
    }
  } else {
    return args; // TODO: add checks if request is from app or internal portal
  }
};
