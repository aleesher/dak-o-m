import * as _ from 'lodash';
import { rule } from 'graphql-shield';

export const USER_ROLE = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  EMPLOYEE: 'employee',
  API: 'api'
};

export const getRoles = (user) => _.flatMap(_.get(user, 'roles', []), (role) => _.get(role, 'role.name', ''));

export const isIntrospection = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return  info.operation.name.value === 'GetServiceDefinition';
  },
);

export const isService = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return !!ctx.authToken
  },
);

export const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return !!ctx.currentUser
  },
);

export const isAdmin = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    const roles = getRoles(ctx.currentUser);
    return roles.includes(USER_ROLE.ADMIN);
  },
);

export const isEmployee = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    const roles = getRoles(ctx.currentUser);
    return roles.includes(USER_ROLE.EMPLOYEE);
  },
);

export const isCustomer = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    const roles = getRoles(ctx.currentUser);
    return roles.includes(USER_ROLE.CUSTOMER);
  },
);

export const isQA = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    const roles = getRoles(ctx.currentUser);
    return roles.includes(USER_ROLE.API);
  },
);