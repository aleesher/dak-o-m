import { Prisma } from "../../generated/prisma-client";
import { getDataRecursively } from "../../lib/dakota-services-common/helpers/webservices";
import { WEBSERVICE_PAGES, DEFAULT_COMPANY_NAME } from "./constants";
import { wait } from "..";
interface WSResult {
  Key: string;
  Service_Contract_No: string;
  Service_Object_No: string;
}

interface ServiceContractSO {
  serviceContractCode: string;
  serviceOrderCode: string;
}

const mapWSEntities = (wsResul: WSResult): ServiceContractSO => ({
  serviceContractCode: wsResul.Service_Contract_No,
  serviceOrderCode: wsResul.Service_Object_No
});

export const syncServiceContractSO = async (prisma: Prisma, filters = {}) => {
  console.log("Started ServiceContractSOMap sync...");
  console.time("syncServiceContractSOMap");

  console.log("Getting service contractMaps");
  console.time("getServiceContractMaps");
  const total = await getDataRecursively(
    WEBSERVICE_PAGES.SERVICE_COMPLEX,
    DEFAULT_COMPANY_NAME,
    async data => {
      const serviceContractSOs: ServiceContractSO[] = (data as WSResult[]).map(
        entity => mapWSEntities(entity)
      );

      console.time("ServiceContractSOMap");

      const tasks = serviceContractSOs.map(async entity => {
        try {
          await wait(100);
          let so;
          const serviceContract = await prisma.serviceContract({
            code: entity.serviceContractCode
          });
          if (serviceContract) {
            const serviceOrder = await prisma.serviceOrder({
              code: entity.serviceOrderCode
            });
            if (serviceOrder) {
              so = await prisma.updateServiceContract({
                data: {
                  serviceOrders: {
                    connect: {
                      id: serviceOrder.id
                    }
                  }
                },
                where: {
                  id: serviceContract.id
                }
              });
              return serviceOrder.id;
            }
          }
          return null;
        } catch (e) {
          console.error(e.message);
          return null;
        }
      });

      await Promise.all(tasks);
      console.timeEnd("ServiceContractSOMap");
    },
    filters
  );

  console.timeEnd("getServiceContractMaps");
  console.log("Sync getServiceContractMaps ended. Total:", total);

  return total;
};
