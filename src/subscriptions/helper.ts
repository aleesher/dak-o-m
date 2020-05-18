import _ = require('lodash');
import { gql } from 'apollo-server-express';
import { OperationOptions, SubscriptionClient } from "subscriptions-transport-ws";
import { pubSub } from "./index";

export function makeRequestOptions(eventName: string): OperationOptions {
  return {
    query: gql`
      subscription {
        ${eventName} {
          key
          data {
            logs
            roofsIds
            addressesIds
            housesIds
            subComplexesIds
            complexesIds
            serviceOrdersIds
            serviceContractsIds
            workOrdersIds
            serviceAppointmentsIds
            entityType
            status
            woId
            soId
            saId
            exportBlockedWOIds
          }
        }
      }
    `,
  }
}

export type TEventData = {
  logs?: string[];
  roofsIds?: string[];
  addressesIds?: string[];
  housesIds?: string[];
  subComplexesIds?: string[];
  complexesIds?: string[];
  serviceOrdersIds?: string[];
  serviceContractsIds?: string[];
  workOrdersIds?: string[];
  serviceAppointmentsIds?: string[];
  entityType?: string;
  status?: string;
  woId?: string;
  soId?: string;
  saId?: string;
  exportBlockedWOIds?: string[];
}

interface IListener {
  next: (data: TEventData) => Promise<TEventData>
  event: string;
  listeners?: IListener[];
}

interface IRootListener extends IListener {
  client: SubscriptionClient;
  listenTo: string[];
}

function makeObserver(eventName: string, options: IListener) {
  const { event, next } = options;
  
  return {
    next: async (args) => {
      const { data, errors } = args;
      const eventData = _.get(data, `${eventName}.data`);
      const key = _.get(data, `${eventName}.key`);
  
      if (errors) {
        console.error(event, { data, errors });
        return;
      }
    
      const nextData = await next(eventData);
    
      pubSub.publishNext(event, key, nextData);
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
  const { client, listenTo, ...observerOptions } = options;

  for (const eventName of listenTo) {
    client
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
        client: rootListener.client,
        listenTo: [rootListener.event],
        ...listener,
      })
    }
  }
}

