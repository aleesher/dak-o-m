import _ = require("lodash");
import { PubSub } from "apollo-server-express";
import { v4 as uuid } from "uuid";
import { TEventData } from "./helper";

export const pubSub = new PubSub();

export function getPubSub() {
  return {
    asyncIterator: async (eventName) => pubSub.asyncIterator(eventName),
    
    publish: (eventName: string, eventData: TEventData) => {
      const key = uuid();
      
      // publish only data with unique ids
      const data = _.mapValues(eventData, _.uniq);
      
      pubSub.publish(eventName, {
        key,
        data
      });
    },
  
    publishNext: (eventName: string, key: string, eventData: TEventData) => {
      // publish only data with unique ids
      const data = _.mapValues(eventData, _.uniq);
    
      pubSub.publish(eventName, {
        key,
        data
      });
    },
  }
}
