import { performMomentAction } from "./helpers";
import {
  MomentActionInput,
  MomentAction,
  MomentEntityTypes,
  MomentActionTypes,
  EntityKeys
} from "./models";

export const STATUS = {
  workOrder: {
    created: "Openstaand / Order aangemaakt",
    planned: "Order gepland",
    sentToDakApp: "Order verzonden naar de dakapp",
    availableOnDakApp: "Order aanwezig op de Dak-app",
    refused: "Order geweigerd door de monteur",
    accepted: "Geaccepteerd",
    journeyStarted: "Start heenreis",
    started: "Start of hervat uitvoer",
    interrupted: "Onderbroken",
    replanning1: "Herplannen, bewoners niet thuis",
    replanning2: "Herplannen, kan niet op dak komen",
    reschedule1: "Herplannen, kan gebruik niet vinden",
    reschedule2: "Herplannen, materiaal bestellen",
    emergencyEquipmentOrder: "Noodreparatie uitgevoerd, materieel bestellen",
    executed: "Uitgevoerd",
    emergencyRepairPerformed: "Noodreparatie uitgevoerd, aanvullende order nodig",
    notCompleted1: "Niet afgerond, aanvullende order nodig",
    notCompleted2: "Niet afgerond, ander bedrijf nodig",
    emergencyRepairDone: "Noodreparatie uitgevoerd, ander bedrijf nodig",
    reviewed: "Beoordeeld",
    administrativeReady: "Administratief gereed",
    statedToBeFinished: "Gereed gemeld",
    cancelled: "Vervallen"
  },
  serviceOrder: {
    created: "Open",
    inProgress: "In_Process",
    technicallyReady: "Technical_Finished",
    administrativeReady: "Administrative_Finished",
    statedToBeFinished: "Finished",
    cancelled: "Cancelled"
  },
  serviceAppointment: {
    created: "Openstaand",
    planned: "Gepland",
    executed: "Uitgevoerd"
  },
  planning: {
    unplanned: "Ongepland",
    planned: "Gepland",
    sent: "Verzonden",
    arrived: "Aangekomen",
    denied: "Geweigerd",
    accepted: "Accepteerd",
    toTravel: "Reizen",
    perfomance: "Uitvoering",
    interrupted: "Onderbroken",
    reschedule: "Herplannen",
    ready: "Gereed",
    sequel: "Vervolg",
    techicallyReady: "Technisch Gereed",
    administrativeReady: "Administratief Gereed",
    statedToBeFinished: "Gereed gemeld",
    cancelled: "Vervallen"
  }
}

export const actions ={
  changeSOStatus(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.SO,
      actionType: MomentActionTypes.STATUS_CHANGE,
      key: "hasSoStatusChange",
      ...momentAction
    });
  },
  changeSAStatus(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.SA,
      actionType: MomentActionTypes.STATUS_CHANGE,
      key: "hasScStatusChange",
      ...momentAction
    });
  },
  changePlanningStatus(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.PLANNING,
      actionType: MomentActionTypes.STATUS_CHANGE,
      key: "hasWoPlanningStatusChange",
      ...momentAction
    });
  },
  blockWO(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.WO,
      actionType: MomentActionTypes.BLOCK,
      key: "isWOBlocked",
      ...momentAction
    });
  },
  blockSO(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.SO,
      actionType: MomentActionTypes.BLOCK,
      key: "isSOBlocked",
      ...momentAction
    });
  },
  blockSA(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.SA,
      actionType: MomentActionTypes.BLOCK,
      key: "isSCBlocked",
      ...momentAction
    });
  },
  blockPlanning(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.PLANNING,
      actionType: MomentActionTypes.BLOCK,
      key: "isWOPlanningBlocked",
      ...momentAction
    });
  },
  blockExport(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.WO,
      actionType: MomentActionTypes.BLOCK_EXPORT,
      key: "isExportBlocked",
      ...momentAction
    });
  },
  unlockWO(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.WO,
      actionType: MomentActionTypes.UNLOCK,
      key: "isWOBlocked",
      ...momentAction
    });
  },
  unlockSO(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.SO,
      actionType: MomentActionTypes.UNLOCK,
      key: "isSOBlocked",
      ...momentAction
    });
  },
  unlockSA(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.SA,
      actionType: MomentActionTypes.UNLOCK,
      key: "isSCBlocked",
      ...momentAction
    });
  },
  unlockPlanning(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.PLANNING,
      actionType: MomentActionTypes.UNLOCK,
      key: "isWOPlanningBlocked",
      ...momentAction
    });
  },
  unlockExport(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.WO,
      actionType: MomentActionTypes.UNLOCK_EXPORT,
      key: "isExportBlocked",
      ...momentAction
    });
  },
  hideWorkOrder(momentAction: MomentActionInput) {
    return performMomentAction({ 
      entityType: MomentEntityTypes.PLANNING,
      actionType: MomentActionTypes.HIDE,
      key: null,
      ...momentAction
    });
  },
};

export const momentActions = (momentAction: MomentActionInput): MomentAction[] => {
  return [
    {
      id: "1",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.created }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.unplanned}),
        actions.changeSAStatus({...momentAction, status: STATUS.serviceAppointment.created }),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "2",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.created }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.sent }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.created }),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "3",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.created }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.planned }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.created }),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "4",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.created }),
        actions.changePlanningStatus({ ...momentAction, status:  STATUS.planning.arrived }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.created }),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "5",
      actions: [
        actions.changeSOStatus( { ...momentAction, status: STATUS.serviceOrder.created }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.denied }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.created }),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "6",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.created }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.accepted }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.planned }),
        actions.blockExport(momentAction),
        actions.unlockPlanning(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "7",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.inProgress }),
        actions.changePlanningStatus({ ...momentAction, status:  STATUS.planning.toTravel }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.planned }),
        actions.blockPlanning(momentAction),
        actions.blockExport(momentAction),
        actions.blockSO(momentAction),
        actions.blockWO(momentAction),
        actions.blockSA(momentAction),
      ]
    },
    {
      id: "8",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.inProgress }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.perfomance }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.planned }),
        actions.blockPlanning(momentAction),
        actions.blockExport(momentAction),
        actions.blockSO(momentAction),
        actions.blockWO(momentAction),
        actions.blockSA(momentAction),
      ]
    },
    {
      id: "9",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.inProgress }),
        actions.changePlanningStatus({ ...momentAction , status: STATUS.planning.interrupted }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.planned }),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "10",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.created }),
        actions.changePlanningStatus({ ...momentAction , status: STATUS.planning.reschedule }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.created }),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "11",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.created }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.reschedule }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.created }),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "12",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.created }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.reschedule }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.created }),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "13",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.created }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.reschedule }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.created }),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "14",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.created }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.reschedule }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.created }),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
    {
      id: "15",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.technicallyReady }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.ready }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.executed }),
        actions.blockPlanning(momentAction),
        actions.blockExport(momentAction),
        actions.blockSO(momentAction),
        actions.blockWO(momentAction),
        actions.blockSA(momentAction),
      ]
    },
    {
      id: "16",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.technicallyReady }),
        actions.changePlanningStatus({ ...momentAction , status: STATUS.planning.sequel }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.executed }),
        actions.blockPlanning(momentAction),
        actions.blockExport(momentAction),
        actions.blockSO(momentAction),
        actions.blockWO(momentAction),
        actions.blockSA(momentAction),
      ]
    },
    {
      id: "17",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.technicallyReady }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.sequel }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.executed }),
        actions.blockPlanning(momentAction),
        actions.blockExport(momentAction),
        actions.blockSO(momentAction),
        actions.blockWO(momentAction),
        actions.blockSA(momentAction),
      ]
    },
    {
      id: "18",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.technicallyReady }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.ready }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.executed }),
        actions.blockPlanning(momentAction),
        actions.blockExport(momentAction),
        actions.blockSO(momentAction),
        actions.blockWO(momentAction),
        actions.blockSA(momentAction),
      ]
    },
    {
      id: "19",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.technicallyReady }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.ready }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.executed }),
        actions.blockPlanning(momentAction),
        actions.blockExport(momentAction),
        actions.blockSO(momentAction),
        actions.blockWO(momentAction),
        actions.blockSA(momentAction),
      ]
    },
    {
      id: "20",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.technicallyReady }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.techicallyReady }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.executed }),
        actions.blockPlanning(momentAction),
        actions.blockExport(momentAction),
        actions.blockSO(momentAction),
        actions.blockWO(momentAction),
        actions.blockSA(momentAction),
      ]
    },
    {
      id: "21",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.administrativeReady }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.administrativeReady }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.executed }),
        actions.blockPlanning(momentAction),
        actions.blockExport(momentAction),
        actions.blockSO(momentAction),
        actions.blockWO(momentAction),
        actions.blockSA(momentAction),
      ]
    },
    {
      id: "22",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.statedToBeFinished }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.statedToBeFinished }),
        actions.changeSAStatus({ ...momentAction, status: STATUS.serviceAppointment.executed }),
        actions.blockPlanning(momentAction),
        actions.blockExport(momentAction),
        actions.blockSO(momentAction),
        actions.blockWO(momentAction),
        actions.blockSA(momentAction),
      ]
    },
    {
      id: "23",
      actions: [
        actions.changeSOStatus({ ...momentAction, status: STATUS.serviceOrder.cancelled }),
        actions.changePlanningStatus({ ...momentAction, status: STATUS.planning.cancelled }),
        actions.hideWorkOrder(momentAction),
        actions.unlockPlanning(momentAction),
        actions.unlockExport(momentAction),
        actions.unlockSO(momentAction),
        actions.unlockWO(momentAction),
        actions.unlockSA(momentAction),
      ]
    },
  ];
}

export const MOMENTS = [
  { internalCode: 5, navisionCode: 10, status: STATUS.workOrder.created },
  { internalCode: 10, navisionCode: 12, status: STATUS.workOrder.planned },
  { internalCode: 15, navisionCode: 15, status: STATUS.workOrder.sentToDakApp },
  { internalCode: 25, navisionCode: 20, status: STATUS.workOrder.availableOnDakApp },
  { internalCode: 30, navisionCode: 30, status: STATUS.workOrder.refused },
  { internalCode: 35, navisionCode: 40, status: STATUS.workOrder.accepted },
  { internalCode: 45, navisionCode: 50, status: STATUS.workOrder.journeyStarted },
  { internalCode: 50, navisionCode: 60, status: STATUS.workOrder.started },
  { internalCode: 55, navisionCode: 90, status: STATUS.workOrder.interrupted },
  { internalCode: 60, navisionCode: 65, status: STATUS.workOrder.replanning1 },
  { internalCode: 65, navisionCode: 65, status: STATUS.workOrder.replanning2 },
  { internalCode: 70, navisionCode: 65, status: STATUS.workOrder.reschedule1 },
  { internalCode: 75, navisionCode: 65, status: STATUS.workOrder.reschedule2 },
  { internalCode: 80, navisionCode: 65, status: STATUS.workOrder.emergencyEquipmentOrder },
  { internalCode: 85, navisionCode: 70, status: STATUS.workOrder.executed },
  { internalCode: 90, navisionCode: 70, status: STATUS.workOrder.emergencyRepairPerformed },
  { internalCode: 95, navisionCode: 70, status: STATUS.workOrder.notCompleted1 },
  { internalCode: 100, navisionCode: 70, status: STATUS.workOrder.notCompleted2 },
  { internalCode: 105, navisionCode: 70, status: STATUS.workOrder.emergencyRepairDone },
  { internalCode: 110, navisionCode: 95, status: STATUS.workOrder.reviewed },
  { internalCode: 115, navisionCode: 105, status: STATUS.workOrder.administrativeReady },
  { internalCode: 120, navisionCode: 110, status: STATUS.workOrder.statedToBeFinished },
  { internalCode: 125, navisionCode: 120, status: STATUS.workOrder.cancelled }
]

export const FIELDS_TO_OMIT = ["type", "code", "navisionCode", "actionId"];

export const ENTITY_KEYS = {
  serviceOrder: {
    entity: "SERVICE_ORDER",
    entityKey: "serviceOrdersIds",
    mutationKey: "updateServiceOrder",
    idKey: "soId"
  } as EntityKeys,
  serviceAppointment: {
    entity: "SERVICE_APPOINTMENT",
    entityKey: "serviceAppointments",
    mutationKey: "updateServiceAppointment",
    idKey: "saId"
  } as EntityKeys,
  workOrder: {
    entity: "WORK_ORDER",
    entityKey: "workOrdersIds",
    mutationKey: "updateWorkOrder",
    idKey: "woId"
  } as EntityKeys,
  planning: {
    entity: "PLANNING",
    entityKey: "workOrdersIds",
    mutationKey: "updateWorkOrder",
    idKey: "woId"
  } as EntityKeys
}