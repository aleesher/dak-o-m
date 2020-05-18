import { EVENTS } from "../lib/dakota-services-common/helpers/subscriptions/constants";
import { configureChainOfSubscribers } from "../lib/dakota-services-common/helpers/subscriptions/subscriber";
import { TDefaultEventData } from "../lib/dakota-services-common/helpers/subscriptions/schema";

export const subscribeToLogEvents = () =>
  configureChainOfSubscribers({
  listenTo: [EVENTS.IMPORT_LOGS.SEED],
  event: EVENTS.IMPORT_LOGS.SEEDED,
  next: async (data: TDefaultEventData): Promise<TDefaultEventData> => {
      return Promise.resolve(data);
  },
  listeners: []
});
