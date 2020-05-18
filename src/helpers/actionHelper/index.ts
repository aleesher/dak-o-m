import * as _get from "lodash/get";
import * as _omit from "lodash/omit";

import { prisma } from "../../generated/prisma-client";

import { momentActions, FIELDS_TO_OMIT } from "./constants";
import { MomentInput } from "./models";

const fetchMoments = async (status, type)  => {
  try {
    const moments = await prisma.moments({ where: { status, type }});
    return moments;
  } catch(err) {
    console.log(err.message);
    return [];
  }
}

export const executeActions = async ({
  status, entityType, woId, soId, saId
}: MomentInput) => {
  try {
    const moments = await fetchMoments(status, entityType);
    (moments || []).map(async (moment) => {
      const action = momentActions({ woId, soId, saId, ..._omit(moment, FIELDS_TO_OMIT) }).find((a) => a.id === moment.actionId);
      for(const func of action.actions) {
        await func(moment);
      }
    });
  } catch(err) {
    console.log(err.message);
  }
}
