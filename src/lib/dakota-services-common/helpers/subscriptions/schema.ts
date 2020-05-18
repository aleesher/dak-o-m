
export type TDefaultEventData = {
  logs?: string[];
  roofsIds?: string[];
  addressesIds?: string[];
  housesIds?: string[];
  subComplexesIds?: string[];
  complexesIds?: string[];
  roofUpdatesIds?: string[];
  serviceOrdersIds?: string[];
  serviceContractsIds?: string[];
  workOrdersIds?: string[];
  serviceAppointmentsIds?: string[];
  entityType?: string;
  status?: string;
  woId?: string;
  soId?: string;
  saId?: string;
  onlyExportIsBlocked?: boolean;
  exportBlockedWOIds?: string[];
}

export const DEFAULT_SUBSCRIPTION_DATA = `
  logs
  roofsIds
  addressesIds
  housesIds
  subComplexesIds
  complexesIds
  roofUpdatesIds
  serviceOrdersIds
  serviceContractsIds
  serviceAppointmentsIds
  workOrdersIds
  entityType
  status
  woId
  soId
  saId
  onlyExportIsBlocked
  exportBlockedWOIds
`;

export const DEFAULT_EVENT_DATA = `{
  logs: [String!]
  roofsIds: [String!]
  addressesIds: [String!]
  housesIds: [String!]
  subComplexesIds: [String!]
  complexesIds: [String!]
  roofUpdatesIds: [String!]
  serviceOrdersIds: [String!]
  serviceContractsIds: [String!]
  serviceAppointmentsIds: [String!]
  workOrdersIds: [String!]
  entityType: String
  status: String
  woId: String
  soId: String
  saId: String
  onlyExportIsBlocked: Boolean
  exportBlockedWOIds: [String!]
}`;
