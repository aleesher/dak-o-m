import _get = require('lodash/get');
import { gql } from 'apollo-server';
import pubSub from "./pubSub";
import { DEFAULT_SUBSCRIPTION_DATA, TDefaultEventData } from "./schema";
import subscriptionClient from "./subscriptionClient";

interface IListener {
  next: (data: TDefaultEventData) => Promise<TDefaultEventData>
  event: string;
  listeners?: IListener[];
}

interface IRootListener extends IListener {
  listenTo: string[];
}


export function makeRequestOptions(eventName: string) {
  return {
    query: gql`
      subscription {
        ${eventName} {
          key
          data {
            ${DEFAULT_SUBSCRIPTION_DATA}
          }
        }
      }
    `,
  }
}

export function makeObserver(eventName: string, options: IListener) {
  const { event, next } = options;

  return {
    next: async (args) => {
      const { data, errors } = args;
      const eventData = _get(data, `${eventName}.data`);
      const key = _get(data, `${eventName}.key`);

      if (errors) {
        console.error(event, { data, errors });
        return;
      }

      const nextData = await next(eventData);

      await pubSub.publishNext(event, key, nextData);
    },
    error: (error) => {
      console.error(event, { error });
    },
    complete: () => {
      console.log(`${event} completed`);
    }
  }
}

export function configureSubscriber(options: IRootListener) {
  const { listenTo, ...observerOptions } = options;

  for (const eventName of listenTo) {
    subscriptionClient
      .request(makeRequestOptions(eventName))
      .subscribe(makeObserver(eventName, observerOptions));
  }
}

export function configureChainOfSubscribers(rootListener: IRootListener) {

  // configure root listener
  configureSubscriber(rootListener);

  // configure next listeners
  if (rootListener.listeners && rootListener.listeners.length > 0) {
    for (const listener of rootListener.listeners) {
      configureChainOfSubscribers({
        listenTo: [rootListener.event],
        ...listener,
      })
    }
  }
}

