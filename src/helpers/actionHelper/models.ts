export enum MomentEntityTypes {
  SO = "SO", // service order
  SA = "SA", // service appointment
  WO = "WO", // work order
  PLANNING = "PLANNING"
}

export enum MomentActionTypes {
  EMAIL = "EMAIL",
  SMS = "SMS",
  STATUS_CHANGE = "STATUS_CHANGE",
  HIDE = "HIDE",
  BLOCK = "BLOCK",
  BLOCK_EXPORT = "BLOCK_EXPORT",
  UNLOCK = "UNLOCK",
  UNLOCK_EXPORT = "UNLOCK_EXPORT"
}

export type MomentEntityType = keyof typeof MomentEntityTypes;
export type MomentActionType = keyof typeof MomentActionTypes;

export interface MomentEvent {
  id: string;
  name: string;
  actionId: string
}

export interface MomentAction {
  id: string;
  actions: any[];
}

export interface MomentActionInput {
  id: string;
  hasSoStatusChange: boolean;
  hasWoPlanningStatusChange: boolean;
  hasScStatusChange: boolean;
  isWOPlanningBlocked: boolean;
  isSCBlocked: boolean;
  isSOBlocked: boolean;
  isExportBlocked: boolean;
  status: string;
  woId: string; // work order id
  saId?: string; // service appointment id
  soId?: string; // service order id
}

export interface MomentInput {
  entityType: string;
  status: string;
  woId: string;
  soId?: string;
  saId?: string;
  soCode?: string
}

export interface EntityKeys {
  mutationKey: string;
  entity: string;
  entityKey: string;
  idKey: string;
}