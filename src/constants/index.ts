
// service order statuses
export const SERVICE_ORDER_STATUS_UNPLANNED = ["10"];
export const SERVICE_ORDER_STATUS_PLANNED= ["12"];
export const SERVICE_ORDER_STATUS_MECHANIC_TRAVELLING = ["50"];
export const SERVICE_ORDER_STATUS_WORK_STARTED = ["60"];
export const SERVICE_ORDER_STATUS_WORK_COMPLETED = ["70", "75"];
export const SERVICE_ORDER_STATUS_MATERIAL_NEEDED_TO_COMPLETE = ["66"];
export const SERVICE_ORDER_STATUS_QUCKFIX_ADDITIONAL_ORDER_NEEDED = ["71"];
export const SERVICE_ORDER_STATUS_ADDITIONAL_ORDER_NEEDED = ["72"];
export const SERVICE_ORDER_STATUS_ANOTHER_COMPANY_NEEDED = ["73"];
export const SERVICE_ORDER_STATUS_QUCIKFIX_ANOTHER_COMPANY_NEEDED = ["74"];
export const SERVICE_ORDER_STATUS_POSTPONED_NOT_A_HOME = ["61"];
export const SERVICE_ORDER_STATUS_POSTPONED_NO_ROOF_ACCESS = ["62"];
export const SERVICE_ORDER_STATUS_POSTPONED_FAULT_NOT_FOUND = ["63"];
export const SERVICE_ORDER_STATUS_POSTPONED_NO_MATERIALS = ["64"];
export const SERVICE_ORDER_STATUS_POSTPONED = ["65"];

export const ORDER_STATUSES = [
  "Open",
  "In_Process",
  "Technical_Finished",
  "Administrative_Finished",
  "Finished",
  "Cancelled"
];

export const ENTITIES_TO_LOCK = {
  serviceOrder: {
    updateKey: 'updateServiceOrder',
    eventKey: 'SERVICE_ORDER',
    idKey: 'serviceOrdersIds'
  },
  serviceContract: {
    updateKey: 'updateServiceContract',
    eventKey: 'SERVICE_CONTRACT',
    idKey: 'serviceContractsIds'
  },
  workOrder: {
    updateKey: 'updateWorkOrder',
    eventKey: 'WORK_ORDER',
    idKey: 'workOrdersIds'
  },
};

export const DEFAULT_CUSTOMER_NAME = "ONBEKEND";