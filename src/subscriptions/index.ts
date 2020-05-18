import * as ws from 'ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getPubSub } from './pubSub';

export const pubSub = getPubSub();


export default (path) => {
  const client = new SubscriptionClient(path, {
    reconnect: true,
  }, ws);
}
