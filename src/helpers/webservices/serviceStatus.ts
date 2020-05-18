import { Prisma, ServiceStatusCreateInput } from "../../generated/prisma-client";
import { getDataRecursively } from "../../lib/dakota-services-common/helpers/webservices";
import { WEBSERVICE_PAGES, DEFAULT_COMPANY_NAME } from "./constants";
import { wait } from "..";

interface WSResult {
  Key: string,
  Type: string,
  Code: string,
  Description: string,
}

const mapWSEntities = (wsResul: WSResult): ServiceStatusCreateInput => ({
  type: wsResul.Type,
  code: wsResul.Code,
  description: wsResul.Description,
});

export const syncServiceStatuses = async (prisma: Prisma, filters = {}) => {
  console.log("Started serviceStatuses sync...");
  console.time('syncServiceStatuses');

  const total = await getDataRecursively(
    WEBSERVICE_PAGES.SERVICE_STATUS,
    DEFAULT_COMPANY_NAME,
    async (data) => {
      const serviceStatuses: ServiceStatusCreateInput[] = (data as WSResult[]).map(
        (entity) => mapWSEntities(entity)
      );

      console.time('createServiceStatus');

      const tasks = serviceStatuses.map(async (entity) => {
        try {
          await wait(100);
          const res = await prisma.createServiceStatus(entity);
          return res.id;
        } catch(e) {
          console.error(e.message);
          return null;
        }

      });

      await Promise.all(tasks);

      console.timeEnd('createServiceStatus');
    },
    filters,
  );

  console.timeEnd('syncServiceStatuses');
  console.log("Sync serviceStatuses ended. Total:", total);

  return total;
}
