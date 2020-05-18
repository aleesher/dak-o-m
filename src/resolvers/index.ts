import Query from './Query';
import Mutation from './Mutation';
import Subscription from './Subscription';
import customResolvers from './customResolvers';

export default {
  Query,
  Mutation,
  Subscription,
  Node: {
    __resolveType() {
      return null;
    }
  },
  ...customResolvers
};
