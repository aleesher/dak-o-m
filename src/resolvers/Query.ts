import {
  addPerPageLimit,
  filterByOwner
} from "../lib/dakota-services-common/helpers/common";
import { addFragmentToInfo } from "graphql-binding";

import { forwardToPrisma } from "../helpers";
import { projectQueries } from "./project";
import {
  getCompany,
  getCorrectiveMaintenances,
  getRoofActivities,
  getUser
} from "../helpers/external";
import { Context } from "../";
import { serviceOrderQueries } from "./serviceOrder";
import importQueries from "./imports/Query";

const forwardResolver = forwardToPrisma("prismaBindings");

const forwardedQueries = {
  serviceOrder: forwardResolver,
  serviceOrdersConnection: forwardResolver,

  serviceContract: forwardResolver,
  serviceContractsConnection: forwardResolver,

  serviceContractIndex: forwardResolver,
  serviceContractIndexConnection: forwardResolver,

  serviceAppointment: forwardResolver,
  serviceAppointmentsConnection: forwardResolver,

  serviceContractTerm: forwardResolver,
  serviceContractTerms: forwardResolver,
  ServiceContractsTermsConnection: forwardResolver,

  workOrder: forwardResolver,
  workOrdersConnection: forwardResolver,

  serviceText: forwardResolver,
  serviceTextsConnection: forwardResolver,

  serviceStatus: forwardResolver,
  serviceStatusesConnection: forwardResolver,

  activityLog: forwardResolver,
  activityLogsConnection: forwardResolver,

  kimInformation: forwardResolver,
  kimInformationsConnection: forwardResolver,

  project: forwardResolver,
  projectsConnection: forwardResolver,

  customerFeedbacks: forwardResolver,
  customerFeedbacksConnection: forwardResolver,

  serviceOrderUpdateNotificationsConnection: forwardResolver,
  serviceOrderUpdateNotification: forwardResolver,

  faq: forwardResolver,
  faqConnection: forwardResolver,

  activityLogHistory: forwardResolver,
  activityLogHistories: forwardResolver,
  activityLogHistoryConnection: forwardResolver,

  serviceOrderComment: forwardResolver,
  serviceOrderComments: forwardResolver,
  serviceOrderCommentConnection: forwardResolver,

  reporter: forwardResolver,
  reportersConnection: forwardResolver,

  moment: forwardResolver,
  momentsConnection: forwardResolver,

  event: forwardResolver,
  eventsConnection: forwardResolver,

  action: forwardResolver,
  actionsConnection: forwardResolver,
};

const queries = {
  serviceOrders: (parent, args, context, info) => {
    const fragment = `fragment ensureId on ServiceOrder { id code }`;
    return context.prismaBindings.query.serviceOrders(addPerPageLimit(filterByOwner(args, context)), addFragmentToInfo(info, fragment));
  },
  serviceOrdersConnection: async (parent, args, context, info) => {
    return context.prismaBindings.query.serviceOrdersConnection(filterByOwner(args, context), info);
  },
  serviceContracts: (parent, args, context, info) => {
    const fragment = `fragment ensureId on ServiceContract { id code }`;
    return context.prismaBindings.query.serviceContracts(addPerPageLimit(filterByOwner(args, context)), addFragmentToInfo(info, fragment));
  },
  ServiceContractTerms: (parent, args, context, info) => {
    const fragment = `fragment ensureId on ServiceContractTerm { id }`;
    return context.prismaBindings.query.serviceContractTerms(addPerPageLimit(filterByOwner(args, context)), addFragmentToInfo(info, fragment));
  },
  serviceAppointments: (parent, args, context, info) => {
    const fragment = `fragment ensureId on ServiceAppointment { id code }`;
    return context.prismaBindings.query.serviceAppointments(addPerPageLimit(filterByOwner(args, context)), addFragmentToInfo(info, fragment));
  },
  workOrders: (parent, args, context, info) => {
    const fragment = `fragment ensureId on WorkOrder { id }`;
    return context.prismaBindings.query.workOrders(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  serviceTexts: (parent, args, context, info) => {
    const fragment = `fragment ensureId on ServiceText { id }`;
    return context.prismaBindings.query.serviceTexts(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  serviceStatuses: (parent, args, context, info) => {
    const fragment = `fragment ensureId on ServiceStatus { id }`;
    return context.prismaBindings.query.serviceStatuses(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  activityLogs: (parent, args, context, info) => {
    const fragment = `fragment ensureId on ActivityLog { id }`;
    return context.prismaBindings.query.activityLogs(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  activityLogHistories: (parent, args, context, info) => {
    const fragment = `fragment ensureId on ActivityLogHistory { id }`;
    return context.prismaBindings.query.activityLogHistories(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  kimInformations: (parent, args, context, info) => {
    const fragment = `fragment ensureId on KimInformation { id }`;
    return context.prismaBindings.query.kimInformations(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  projects: (parent, args, context, info) => {
    const fragment = `fragment ensureId on Project { id }`;
    return context.prismaBindings.query.projects(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  customerFeedback: (parent, args, context, info) => {
    const fragment = `fragment ensureId on CustomerFeedback { id serviceOrderId }`;
    return context.prismaBindings.query.customerFeedback(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  serviceOrderUpdateNotifications: (parent, args, context, info) => {
    const fragment = `fragment ensureId on ServiceOrderUpdateNotification { id serviceOrderId }`;
    return context.prismaBindings.query.serviceOrderUpdateNotifications(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  serviceOrderUpdateNotificationJson: async (parent, args, context, info) => {
    const son = await context.prismaBindings.query.serviceOrderUpdateNotification(args);

    if (son !== null) {
      const dated = new Date(son.updatedAt);
      const today = new Date();
      const millisecondsPerDay = 1000 * 60 * 60 * 24;
      const days = (today.getTime() - dated.getTime()) / millisecondsPerDay;
      if (days > 30) {
        return null;
      }
      const so = await context.prismaBindings.query.serviceOrder({
        where: {
          id: son.serviceOrderId
        }
      });

      if (!so.code) {
        return son;
      }
      const roofActivities = await getRoofActivities(so.code);
      let roofCorrectiveMaintenances = [];
      if (roofActivities.length !== 0) {
        roofCorrectiveMaintenances = await getCorrectiveMaintenances(roofActivities[0].roofActivityId);
      }
      const company = await getCompany(so.ownerCode);
      const customer = await getUser(so.customerCode);// FIXME: this is wrong, customer code is also a company
      return { ...son, serviceOrder: { ...so, roofActivities, roofCorrectiveMaintenances, company, customer } };
    }
    return son;
  },
  faqs: (parent, args, context, info) => {
    const fragment = `fragment ensureId on Faq { id }`;
    return context.prismaBindings.query.faqs(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  serviceOrdersPublic: (parent, args, context, info) => {
    const fragment = `fragment ensureId on ServiceOrder { id code }`;
    return context.prismaBindings.query.serviceOrders(addPerPageLimit(filterByOwner(args, context)), addFragmentToInfo(info, fragment));
  },

  getRoofingPartnerNames: async (parent, args, context: Context, info) => {
    const updatedArgs = filterByOwner(args, context);
    let data = await context.prismaClient.serviceOrders(updatedArgs).$fragment(`{
      roofingPartnerName
    }`) as any[];

    let roofingPartnerNamesSO = data.map(s => s.roofingPartnerName);
    roofingPartnerNamesSO = Array.from(new Set(roofingPartnerNamesSO)).filter(s => !!s);

    data = await context.prismaClient.projects(updatedArgs).$fragment(`{
      roofingPartnerName
    }`) as any[];

    let roofingPartnerNamesProject = data.map(s => s.roofingPartnerName);
    roofingPartnerNamesProject = Array.from(new Set(roofingPartnerNamesProject)).filter(s => !!s);

    return Array.from(new Set([...roofingPartnerNamesSO, ...roofingPartnerNamesProject]));
  },
  reporters: (parent, args, context, info) => {
    const fragment = `fragment ensureId on Reporter { id }`;
    return context.prismaBindings.query.reporters(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  moments: (parent, args, context, info) => {
    const fragment = `fragment ensureId on Moment { id }`;
    return context.prismaBindings.query.moments(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  events: (parent, args, context, info) => {
    const fragment = `fragment ensureId on Event { id }`;
    return context.prismaBindings.query.events(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  actions: (parent, args, context, info) => {
    const fragment = `fragment ensureId on Action { id }`;
    return context.prismaBindings.query.actions(addPerPageLimit(args), addFragmentToInfo(info, fragment));
  },
  allServiceContracts: (_, args, context, info) => {
    const fragment = `fragment ensureId on ServiceContract { id code }`;
    return context.prismaBindings.query.serviceContracts(filterByOwner(args, context), addFragmentToInfo(info, fragment));
  },
  allServiceOrders: (_, args, context, info) => {
    const fragment = `fragment ensureId on ServiceOrder { id code }`;
    return context.prismaBindings.query.serviceOrders(filterByOwner(args, context), addFragmentToInfo(info, fragment));

  },
};

export default {
  ...forwardedQueries,
  ...queries,
  ...projectQueries,
  ...serviceOrderQueries,
  ...importQueries,
};
