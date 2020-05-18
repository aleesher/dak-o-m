import { createHash } from "crypto";
import _ = require("lodash");

import { EVENTS } from "../lib/dakota-services-common/helpers/subscriptions/constants";
import {
  createNotification,
  NOTIFICATION_TYPE,
  NOTIFICATION_REASON
} from "../lib/dakota-services-common/helpers/notification";

import { forwardToPrisma } from "../helpers";
import { SERVICE_ORDER_STATUS_UNPLANNED, ENTITIES_TO_LOCK } from "../constants";
import { getMessage, sendNotification } from "../helpers/notificationHelper";
import { getCompany, getUser } from "../helpers/external";
import { projectMutations } from "./project";
import workOrderMutations from "./workOrder/mutation";
import { sendAskQuestionEmail } from "../helpers/mailHelpers";
import {ServiceContractIndex} from "../generated/prisma-client";
import { executeActions } from "../helpers/actionHelper";
import { getPubSub } from "../subscriptions/pubSub";
import pubSub from "../lib/dakota-services-common/helpers/subscriptions/pubSub";
// const pubSub = getPubSub();

const COMPANY_MAIL = "dakota@dakcalc.nl";

const forwardResolver = forwardToPrisma("prismaBindings");

const forwardedMutations = {
  updateServiceOrder: forwardResolver,
  updateManyServiceOrders: forwardResolver,
  upsertServiceOrder: forwardResolver,
  deleteServiceOrder: forwardResolver,
  deleteManyServiceOrders: forwardResolver,

  updateManyWorkOrders: forwardResolver,
  upsertWorkOrder: forwardResolver,
  deleteWorkOrder: forwardResolver,
  deleteManyWorkOrders: forwardResolver,

  createServiceText: forwardResolver,
  updateServiceText: forwardResolver,
  updateManyServiceTexts: forwardResolver,
  upsertServiceText: forwardResolver,
  deleteServiceText: forwardResolver,
  deleteManyServiceTexts: forwardResolver,

  createServiceStatus: forwardResolver,
  updateServiceStatus: forwardResolver,
  updateManyServiceStatuses: forwardResolver,
  upsertServiceStatus: forwardResolver,
  deleteServiceStatus: forwardResolver,
  deleteManyServiceStatuses: forwardResolver,

  createServiceContract: forwardResolver,
  updateServiceContract: forwardResolver,
  updateManyServiceContracts: forwardResolver,
  upsertServiceContract: forwardResolver,
  deleteServiceContract: forwardResolver,
  deleteManyServiceContracts: forwardResolver,

  createServiceAppointment: forwardResolver,
  updateServiceAppointment: forwardResolver,
  updateManyServiceAppointments: forwardResolver,
  upsertServiceAppointment: forwardResolver,
  deleteServiceAppointment: forwardResolver,
  deleteManyServiceAppointments: forwardResolver,

  createServiceContractTerm: forwardResolver,
  updateServiceContractTerm: forwardResolver,
  updateManyServiceContractTerms: forwardResolver,
  upsertServiceContractTerm: forwardResolver,
  deleteServiceContractTerm: forwardResolver,
  deleteManyServiceContractTerms: forwardResolver,

  createActivityLog: forwardResolver,
  updateActivityLog: forwardResolver,
  updateManyActivityLogs: forwardResolver,
  upsertActivityLog: forwardResolver,
  deleteActivityLog: forwardResolver,
  deleteManyActivityLogs: forwardResolver,

  createKimInformation: forwardResolver,
  updateKimInformation: forwardResolver,
  updateManyKimInformations: forwardResolver,
  upsertKimInformation: forwardResolver,
  deleteKimInformation: forwardResolver,
  deleteManyKimInformations: forwardResolver,

  updateProject: forwardResolver,
  deleteProject: forwardResolver,
  deleteManyProjects: forwardResolver,
  updateManyProjects: forwardResolver,

  updateCustomerFeedback: forwardResolver,
  deleteCustomerFeedback: forwardResolver,

  createServiceOrderUpdateNotification: forwardResolver,
  updateServiceOrderUpdateNotification: forwardResolver,
  deleteServiceOrderUpdateNotification: forwardResolver,

  createFaq: forwardResolver,
  updateFaq: forwardResolver,
  updateManyFaqs: forwardResolver,
  upsertFaq: forwardResolver,
  deleteFaq: forwardResolver,
  deleteFaqs: forwardResolver,

  createReporter: forwardResolver,
  updateReporter: forwardResolver,
  updateManyReporters: forwardResolver,
  upsertReporter: forwardResolver,
  deleteReporter: forwardResolver,
  deleteReporters: forwardResolver,

  createServiceOrderComment: forwardResolver,
  updateServiceOrderComment: forwardResolver,
  updateManyServiceOrderComments: forwardResolver,
  upsertServiceOrderComment: forwardResolver,
  deleteServiceOrderComment: forwardResolver,
  deleteServiceOrderComments: forwardResolver,

  updateServiceIndex: forwardResolver,
  updateManyServiceIndexes: forwardResolver,
  upsertServiceIndex: forwardResolver,
  deleteServiceIndex: forwardResolver,
  deleteServiceIndexes: forwardResolver,

  createMoment: forwardResolver,
  updateMoment: forwardResolver,
  updateManyMoments: forwardResolver,
  upsertMoment: forwardResolver,
  deleteMoment: forwardResolver,
  deleteManyMoments: forwardResolver,

  createEvent: forwardResolver,
  updateEvent: forwardResolver,
  updateManyEvents: forwardResolver,
  upsertEvent: forwardResolver,
  deleteEvent: forwardResolver,
  deleteManyEvents: forwardResolver,

  createAction: forwardResolver,
  updateAction: forwardResolver,
  updateManyActions: forwardResolver,
  upsertAction: forwardResolver,
  deleteAction: forwardResolver,
  deleteActions: forwardResolver,

  updateServiceContractEstimation: forwardResolver,
  updateManyServiceContractEstimation: forwardResolver,
  upsertServiceContractEstimation: forwardResolver,
  deleteServiceContractEstimation: forwardResolver,
  deleteServiceContractEstimations: forwardResolver,


  createCustomerFeedback: async (_, args, ctx) => {
    const feedBk = await ctx.prismaBindings.mutation.createCustomerFeedback(args);
    try {
      await ctx.prismaBindings.mutation.updateServiceOrderUpdateNotification({
        data: {
          customerFeedback: {
            connect: {
              id: feedBk.id
            }
          }
        },
        where: {
          id: feedBk.notificationId
        }
      });
      if (feedBk.rating <= 2) {
        await createNotification(
          ctx.prismaClient,
          {
            feedback: feedBk
          },
          NOTIFICATION_TYPE.Feedback,
          NOTIFICATION_REASON.FeedbackNotSatisfied
        );
      } else {
        await createNotification(
          ctx.prismaClient,
          {
            feedback: feedBk
          },
          NOTIFICATION_TYPE.Feedback,
          NOTIFICATION_REASON.FeedbackCreated
        );
      }
    } catch (e) {
      console.log(e);
    }

    return feedBk;
  },
  createServiceContractIndex: async (_, args, ctx) => {
    try {
      const index: ServiceContractIndex = await ctx.prismaBindings.mutation.createServiceContractIndex(args);

     //  const serviceContracts = await ctx.prismaBindings.query.serviceContracts({
     //    where: {
     //      terminationDate_gte: index.indexTime,
     //    }
     //  });
     //
     // const indexeren = serviceContracts.map(async serviceContract => {
     //    try {
     //      const terms = await ctx.prismaBindings.query.serviceContractTerms(
     //        {
     //          where: {
     //            serviceContractCode: serviceContract.code
     //          }
     //        }
     //      );
     //
     //      let billedAmount = terms.reduce((a, b) => {
     //        // TODO: use formula here
     //        return a + b.invoicedPrice;
     //      }, 0);
     //
     //      await ctx.prismaBindings.mutation.updateServiceContract({
     //        data: {
     //          billedAmount
     //        },
     //        where:{
     //          code: serviceContract.code
     //        }
     //      });
     //
     //    } catch (err) {
     //      console.log(err);
     //    }
     //  });
     //
     //  await Promise.all(indexeren);
      return index;
    } catch (err) {
      console.log(err);
    }
    return null;
  },
  createServiceOrder: async (_, args, ctx) => {
    const SO = await ctx.prismaBindings.mutation.createServiceOrder(args);
    const linkToken = createHash("sha1")
      .update(`${SO.id}|${SO.actualReferencePoint}`)
      .digest("hex");
    const msg = getMessage({
      so: SO,
      stage: SO.actualReferencePoint,
      token: linkToken,
      tel: process.env.SMS_SENDER
    });
    if (msg != "") {
      try {
        const customer = await getUser(SO.customerCode); // FIXME: this is wrong, customer code is also a company
        const company = await getCompany(SO.ownerCode);
        const notification = await ctx.prismaBindings.mutation.createServiceOrderUpdateNotification(
          {
            data: {
              serviceOrderId: SO.id,
              smsText: msg,
              emailHtmlBody: msg,
              orderOwnerPhone: customer.mobilePhone || customer.phone,
              emailSubject: "Service Order Update",
              companyEmail: company.email,
              stage:
                SO.actualReferencePoint != null
                  ? SO.actualReferencePoint
                  : SERVICE_ORDER_STATUS_UNPLANNED[0],
              linkToken,
              serviceOrder: {
                connect: {
                  id: SO.id
                }
              }
            }
          }
        );

        const sent = await sendNotification(notification);
        if (sent) {
          await ctx.prismaBindings.mutation.updateServiceOrderUpdateNotification(
            {
              data: {
                smsDeliveryStatus: true
              },
              where: {
                id: notification.id
              }
            }
          );
        }
      } catch (e) { }
    }
    return SO;
  },
  askQuestion: async (_, args, ctx) => {
    const note = await ctx.prismaBindings.query.serviceOrderUpdateNotification({
      where: {
        linkToken: args.linkToken
      }
    });

    if (note === null) {
      return { sent: false, message: "invalid reference" };
    }
    const serviceOrder = note.serviceOrder;
    if (!serviceOrder) {
      return { sent: false, message: "service order not found" };
    }

    const company = await getCompany(serviceOrder.ownerCode);
    const customer = await getUser(serviceOrder.customerCode); // FIXME: this is wrong, customer code is also a company
    if (company && customer) {
      if (customer.email) {
        try {
          await sendAskQuestionEmail(
            args.name,
            args.email,
            args.question,
            serviceOrder.code
          );
          return { sent: true, message: "question sent successfully." };
        } catch (e) { }
      }
    }
    return { sent: false, message: "unable to send message at the moment." };
  },
  updateServiceOrderStatus: async (_, args, ctx) => {
    const serviceOrder = await ctx.prismaBindings.mutation.updateServiceOrder({
      data: {
        actualReferencePoint: args.data.actualReferencePoint
      },
      where: args.where
    });

    const oldNotifications = await ctx.prismaBindings.query.serviceOrderUpdateNotifications(
      {
        where: {
          serviceOrderId: args.where.id,
          stage: args.data.actualReferencePoint
        }
      }
    );
    let notification;
    const company = await getCompany(serviceOrder.ownerCode);
    if (oldNotifications.length === 0 && company) {
      const linkToken = createHash("sha1")
        .update(`${serviceOrder.id}|${serviceOrder.actualReferencePoint}`)
        .digest("hex");
      const customer = await getUser(serviceOrder.customerCode); // FIXME: this is wrong, customer code is also a company
      const msg = getMessage({
        so: serviceOrder,
        stage: serviceOrder.actualReferencePoint,
        token: linkToken,
        tel: process.env.SMS_SENDER
      });
      notification = await ctx.prismaBindings.mutation.createServiceOrderUpdateNotification(
        {
          data: {
            smsText: msg,
            emailHtmlBody: msg,
            emailSubject: "Service Order Update",
            orderOwnerPhone: customer.mobilePhone || customer.phone,
            companyEmail: company.email,
            serviceOrder: {
              connect: {
                id: serviceOrder.id
              }
            },
            serviceOrderId: args.where.id,
            stage: args.data.actualReferencePoint,
            linkToken
          }
        }
      );

      const sent = await sendNotification(notification);
      if (sent) {
        try {
          await ctx.prismaBindings.mutation.updateServiceOrderUpdateNotification(
            {
              data: {
                smsDeliveryStatus: true
              },
              where: {
                id: notification.id
              }
            }
          );
        } catch (e) { }
      }
    } else if (oldNotifications.length > 0) {
      notification = oldNotifications[0];
    }
    // TODO: check if feedback already exist and don't send notification - DTTM-8
    if (
      serviceOrder.actualReferencePoint <= SERVICE_ORDER_STATUS_UNPLANNED[0] &&
      notification !== null
    ) {
      await ctx.prismaBindings.mutation.createCustomerFeedback({
        data: {
          serviceOrderId: args.where.id,
          stage: args.data.actualReferencePoint,
          notificationId: notification.id
        }
      });
    }
    pubSub.publish(EVENTS.SERVICE_ORDER.UPDATE, {
      serviceOrdersIds: [serviceOrder.id]
    });
    return serviceOrder;
  },
  lockEntityRecord: async (_, args, ctx) => {
    const { entityName } = args.data;
    const { updateKey, eventKey, idKey } = ENTITIES_TO_LOCK[entityName];

    const record = await ctx.prismaBindings.mutation[updateKey]({
      data: {
        isLocked: true,
        lockedBy: args.data.lockedBy
      },
      where: args.where
    });

    pubSub.publish(EVENTS[eventKey].LOCK, { [idKey]: [record.id] });

    return record;
  },
  unlockEntityRecord: async (_, args, ctx) => {
    const { entityName } = args.data;

    const { updateKey, eventKey, idKey } = ENTITIES_TO_LOCK[entityName];

    const record = await ctx.prismaBindings.mutation[updateKey]({
      data: {
        isLocked: false,
        lockedBy: ""
      },
      where: args.where
    });

    pubSub.publish(EVENTS[eventKey].UNLOCK, { [idKey]: [record.id] });

    return record;
  },
  createWorkOrder: async (__, args, ctx, info) => {
    try {
      const workOrder = await ctx.prismaBindings.mutation.createWorkOrder(args,`{
        id
        status
        serviceOrder {
          id
          serviceAppointment {
            id
          }
        }
      }`);

      const id = _.get(workOrder, "id");
      const status = _.get(workOrder, "status", "");
      const soId = _.get(workOrder, "serviceOrder.id");
      const saId = _.get(workOrder, "serviceOrder.serviceAppointment.id");
      executeActions({ status, entityType: "WO", woId: id, soId, saId });
      return workOrder;
    } catch(err) {
      console.log(err.message);
    }
  },
  updateWorkOrder: async (__, args, ctx, info) => {
    try {
      const workOrder = await ctx.prismaBindings.mutation.updateWorkOrder(args,`{
        id
        status
        serviceOrder {
          id
          serviceAppointment {
            id
          }
        }
      }`);

      const id = _.get(workOrder, "id");
      const status = _.get(workOrder, "status", "");
      const soId = _.get(workOrder, "serviceOrder.id");
      const saId = _.get(workOrder, "serviceOrder.serviceAppointment.id");
      executeActions({ status, entityType: "WO", woId: id, soId, saId });
      return workOrder;
    } catch(err) {
      console.log(err.message);
    }
  },
};

export default {
  ...forwardedMutations,
  ...projectMutations,
  ...workOrderMutations
};
