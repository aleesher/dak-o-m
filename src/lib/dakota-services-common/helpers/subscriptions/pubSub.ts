import _mapValues = require("lodash/mapValues");
import _uniq = require("lodash/uniq");
import { v4 as uuid } from "uuid";
import client from "./client";
import { TDefaultEventData } from "./schema";

const pubSub = {

  publish: async (eventName: string, eventData: TDefaultEventData) => {
    const key = uuid();

    // publish only data with unique ids
    const data = _mapValues(eventData, _uniq);

    await client.publishEvent(eventName, {
      key,
      data
    });
  },

  publishNext: async (eventName: string, key: string, eventData: TDefaultEventData) => {
    // publish only data with unique ids
    const data = _mapValues(eventData, _uniq);

    await client.publishEvent(eventName, {
      key,
      data
    });
  },
};

export default pubSub;
