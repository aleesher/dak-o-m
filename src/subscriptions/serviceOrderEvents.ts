import { EVENTS } from "../lib/dakota-services-common/helpers/subscriptions/constants";
import { configureChainOfSubscribers } from "../lib/dakota-services-common/helpers/subscriptions/subscriber";
import { TDefaultEventData } from "../lib/dakota-services-common/helpers/subscriptions/schema";

export const subscribeToServiceOrderEvents = () =>
  configureChainOfSubscribers({
  listenTo: [EVENTS.SERVICE_ORDER.UPDATE],
  event: EVENTS.SERVICE_ORDER.UPDATED,
  next: async (data: TDefaultEventData): Promise<TDefaultEventData> => {
    // send sms here

    return Promise.resolve(data);
  },
  listeners: []
});
