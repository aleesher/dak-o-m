import * as _ from "lodash";

import { Prisma, MomentCreateInput } from "../../generated/prisma-client";
import { MOMENTS } from "../../helpers/actionHelper/constants";

export const createMoments = async (prisma: Prisma) => {
  console.log(" start creation of the logmoments ")
  await Promise.all(_.map(MOMENTS, (moment, i) => {
    const num = i+1;
    return prisma.createMoment({
      code: moment.internalCode,
      navisionCode: moment.navisionCode,
      status: moment.status,
      type: "WO",
      actionId: `${num}`,
    } as MomentCreateInput);
  }));

  console.log(" end creation of the logmoments ")
}
