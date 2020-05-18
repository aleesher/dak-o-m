import { EVENTS } from "../../lib/dakota-services-common/helpers/subscriptions/constants";
import pubSub from "../../lib/dakota-services-common/helpers/subscriptions/pubSub";

import { prisma } from "../../generated/prisma-client";

import {
  MomentEntityType,
  MomentActionTypes as actions,
  MomentEntityTypes as entities,
  EntityKeys
} from "./models";
import { 
  ENTITY_KEYS
} from "./constants";

export const performMomentAction = ({ entityType, actionType, status, key, ...rest}) =>
  async () => {
    if((!key || !!rest[key]) || key == "isWOBlocked") {
      if(actionType === actions.STATUS_CHANGE && !!status) {
        await changeEntityStatus({ ...rest, status, entityType });
      } else if(actionType === actions.BLOCK) {
        await lockEntity({ ...rest, entityType, isEntityLocked: true });
      } else if(actionType === actions.BLOCK_EXPORT) {
        await blockExport(rest.woId, true)
      } else if(actionType === actions.UNLOCK) {
        await lockEntity({ ...rest, entityType, isEntityLocked: false });
      } if(actionType === actions.UNLOCK_EXPORT) {
        await blockExport(rest.woId, false);
      }
    }
}

async function lockEntity ({ entityType, isEntityLocked, ...rest }) {
  try {
    const { entity, entityKey, idKey, mutationKey } = getEntityData(entityType);
    const id = rest[idKey];
    if(!!id && prisma[mutationKey]) {
      const lockKey = isEntityLocked ? "LOCK" : "UNLOCK";
      await prisma[mutationKey]({ data: { isLocked: isEntityLocked, lockedBy: "system" }, where: { id } });
      pubSub.publish(EVENTS[entity][lockKey], { [entityKey]: [id] });
    }
  } catch(err) {
    console.error(err.message);
  }
}

async function blockExport(id: string, isExportBlocked: boolean) {
  try {
    if(!!id) {
      await prisma.updateWorkOrder({ data: { isExportBlocked }, where: { id } });
      const lockKey = isExportBlocked ? "LOCK_EXPORT" : "UNLOCK_EXPORT";
      pubSub.publish(EVENTS.WORK_ORDER[lockKey], { exportBlockedWOIds: [id] });
    }
  } catch(err) {
    console.error(err.message);
  }
}

async function changeEntityStatus ({ entityType, status, ...rest }) {
  try {
    const { entity, entityKey, idKey, mutationKey } = getEntityData(entityType);
    const id = rest[idKey];
    if(prisma[mutationKey] && !!id) {
      await prisma[mutationKey]({ data: { status }, where: { id } });
      if(entity === ENTITY_KEYS.serviceOrder.entity) {
        await updateWorkOrderSOStatuses(status, id);
      }
      pubSub.publish(EVENTS[entity].STATUS_UPDATE, { [entityKey]: [id] });
    }
  } catch(err) {
    console.error(err.message);
  }
}

function getEntityData (entityType: MomentEntityType): EntityKeys {
  return entityType === entities.SO ? ENTITY_KEYS.serviceOrder 
    // : entityType === entities.SA ? ENTITY_KEYS.serviceAppointment // todo: add ability to lock appointments
    : entityType === entities.WO ? ENTITY_KEYS.workOrder
    : ENTITY_KEYS.planning;
}


async function updateWorkOrderSOStatuses (status: string, soId: string) {
  try {
    await prisma.updateManyWorkOrders({
      where: { serviceOrder: { id: soId }},
      data: { soStatus: status }
    });
  } catch(err) {
    console.error(err.message);
  }
}