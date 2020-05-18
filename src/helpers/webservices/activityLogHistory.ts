import { Prisma } from "../../generated/prisma-client";
import { getDataRecursively } from "../../lib/dakota-services-common/helpers/webservices";
import { WEBSERVICE_PAGES, DEFAULT_COMPANY_NAME } from "./constants";
import { wait } from "..";

interface WSResult {
  Key: string,
  Type: string,
  Document_No: string,
  Date_Time_registrated: string,
  Reference_Point: string,
  Modified_by_Employee: string,
}

const mapWSEntities = (wsResult: WSResult, serviceOrdersCodes: string[]) => ({
  type: wsResult.Type,
  code: wsResult.Reference_Point,
  employeeCode: wsResult.Modified_by_Employee,
  registerDate: wsResult.Date_Time_registrated,

  serviceOrder: serviceOrdersCodes.includes(wsResult.Document_No)
    ? {
      connect: {
        code: wsResult.Document_No
      }
    } : null
});

export const syncActivityLogHistories = async (prisma: Prisma, filters = {}) => {
  console.log("Started activityLogHistories sync...");
  console.time('syncActivityLogHistories');

  const allServiceOrders = await prisma.serviceOrders().$fragment(`{
    code
  }`) as any[];
  const serviceOrdersCodes = allServiceOrders.map(s => s.code);

  const total = await getDataRecursively(
    WEBSERVICE_PAGES.ACTIVITY_LOG_HISTORY,
    DEFAULT_COMPANY_NAME,
    async (data: WSResult[]) => {
      const activityLogHistories = data.map(d => mapWSEntities(d, serviceOrdersCodes));

      console.time('createActivityLogHistory');

      const tasks = activityLogHistories.map(async (entity) => {
        try {
          await wait(100);
          const res = await prisma.createActivityLogHistory(entity);
          return res.id;
        } catch(e) {
          console.error(e.message);
          return null;
        }
      });

      await Promise.all(tasks);

      console.timeEnd('createActivityLogHistory');
    },
    filters,
  );

  console.timeEnd('syncActivityLogHistories');
  console.log("Sync activityLogHistories ended. Total:", total);

  return total;
}
