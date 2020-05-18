import * as ws from "ws";
import { SubscriptionClient } from "subscriptions-transport-ws";

const SUBSCRIPTIONS_URL = process.env.SUBSCRIPTIONS_URL || 'ws://localhost:8080/graphql';

const subscriptionClient = new SubscriptionClient(SUBSCRIPTIONS_URL, {
  reconnect: true,
}, ws);

export default subscriptionClient;
