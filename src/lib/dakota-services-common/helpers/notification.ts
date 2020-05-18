import * as _ from "lodash";
import { gql } from 'apollo-server';

import { apolloClient } from "./subscriptions/client";


export enum NOTIFICATION_TYPE {
  Quality_Warning = "Quality_Warning",
  Feedback = "Feedback",
  Deferred_Maintenance = "Deferred_Maintenance",
  Settings = "Settings",
};
export enum NOTIFICATION_REASON {
  DeficiencyOfInsulation = "DeficiencyOfInsulation",
  RoofCondition = "RoofCondition",
  FeedbackNotSatisfied = "FeedbackNotSatisfied",
  FeedbackCreated = "FeedbackCreated",
  OpenCorrectiveMaintenance = "OpenCorrectiveMaintenance",
  LeakageCreated = "LeakageCreated",
  ClientAccess = "ClientAccess",
};

const CREATE_NOTIFICATION = gql`
  mutation createNotification($data: NotificationCreateInput!) {
    createNotification(data: $data) {
      id
    }
  }
`;

const createQualityNotification = async (prisma, data: any, reason: NOTIFICATION_REASON) => {
  const roofId = _.get(data, 'roofId', '');

  if (!roofId) {
    console.error("createQualityNotification: roofId is empty");
  }
  const roof = await prisma.roof({id: roofId});

  let notification = {
    description: "",
    type: NOTIFICATION_TYPE.Quality_Warning,
    reson: reason,
    entityId: roof.id,
    ownerCode: roof.ownerCode,
    entityName: "Roof",
    isArchived: false,
    isDeleted: false,
  };

  switch(reason) {
    case NOTIFICATION_REASON.DeficiencyOfInsulation: {
      notification.description = "De isolatie in deze dakbedekking is nat";
      break;
    }
    case NOTIFICATION_REASON.RoofCondition: {
      notification.description = `De kwaliteit van dak ${roof.code} op complex ${roof.complexCode} is vermoedelijk beneden niveau.`;
      break;
    }
  }

  try {
    await apolloClient.mutate({
      mutation: CREATE_NOTIFICATION,
      variables: {
        data: notification,
      }
    });
  } catch(e) {
    console.log(e);
  }
}

export const createFeedbackNotification = async (prisma, data: any, reason: NOTIFICATION_REASON) => {
  const { feedback } = data;

  const serviceOrder = await prisma.serviceOrder({id: feedback.serviceOrderId}).$fragment(`{
    id
    ownerCode
    complex {
      id
    }
  }`);

  let notification = {
    description: "",
    type: NOTIFICATION_TYPE.Feedback,
    reson: reason,
    entityId: _.get(serviceOrder, 'complex.id', ''),
    ownerCode: _.get(serviceOrder, 'ownerCode', ''),
    entityName: "Complex",
    isArchived: false,
    isDeleted: false,
  };

  switch(reason) {
    case NOTIFICATION_REASON.FeedbackNotSatisfied: {
      notification.description = "Recent hebben we een negatieve beoordeling gekregen.";
      break;
    }
    case NOTIFICATION_REASON.FeedbackCreated: {
      let average = 0;
      const allServiceOrders = await prisma.serviceOrders({
        where: {
          ownerCode: serviceOrder.ownerCode
        }
      }).$fragment(`{
        ownerCode
        ktoFiture
      }`);

      if (allServiceOrders.length) {
        allServiceOrders.forEach(so => {
          average += _.get(so, "ktoFiture", 0);
        });

        average = average / allServiceOrders.length
      }

      notification.description = `Het afgelopen halfjaar hebben uw klanten onze dienstverlening gewaardeerd met een ${average.toFixed(1)}`;

      break;
    }
  }

  try {
    await apolloClient.mutate({
      mutation: CREATE_NOTIFICATION,
      variables: {
        data: notification,
      }
    });
  } catch(e) {
    console.log(e);
  }
}

export const createMaintenanceNotification = async (prisma, data: any, reason: NOTIFICATION_REASON) => {
  const { complexCode, roofId, ownerCode } = data;

  let notification = {
    description: "",
    type: NOTIFICATION_TYPE.Deferred_Maintenance,
    reson: reason,
    entityId: roofId,
    ownerCode: ownerCode,
    entityName: "Roof",
    isArchived: false,
    isDeleted: false,
  };

  switch(reason) {
    case NOTIFICATION_REASON.OpenCorrectiveMaintenance: {
      notification.description = `Op complex ${complexCode} is mogelijk sprake van achterstallig onderhoud. Een aantal adviezen voor correctief onderhoud staan nog open.`;
      break;
    }
  }

  try {
    await apolloClient.mutate({
      mutation: CREATE_NOTIFICATION,
      variables: {
        data: notification,
      }
    });
  } catch(e) {
    console.log(e);
  }
}

export const createNotification = async (prisma, data: any, type: NOTIFICATION_TYPE, reason: NOTIFICATION_REASON) => {
  switch(type) {
    case NOTIFICATION_TYPE.Quality_Warning: {
      await createQualityNotification(prisma, data, reason);
      break;
    }
    case NOTIFICATION_TYPE.Feedback: {
      await createFeedbackNotification(prisma, data, reason);
      break;
    }
    case NOTIFICATION_TYPE.Deferred_Maintenance: {
      await createMaintenanceNotification(prisma, data, reason);
      break;
    }
  }
};
