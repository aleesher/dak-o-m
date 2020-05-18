import { prisma } from "../../generated/prisma-client";
import {
  syncServiceOrders,
  syncWorkOrders,
  syncServiceTexts,
  syncServiceStatuses,
  syncActivityLogs,
  syncProjects,
  syncProjectFiles,
  syncAllProjects,
  syncActivityLogHistories,
  syncServiceContracts,
  syncServiceContractTerms,
  syncServiceContractSO
} from "../../helpers/webservices";
import { syncCalculatedFields } from "./calculated";
import { createMoments } from "./moments";

(async () => {
  await createMoments(prisma);
  await syncServiceContractSO(prisma);
  await syncServiceOrders(prisma);
  await syncWorkOrders(prisma);
  await syncServiceTexts(prisma);
  await syncServiceStatuses(prisma);
  await syncActivityLogs(prisma);
  await syncAllProjects(prisma);
  await syncProjects(prisma);
  await syncProjectFiles(prisma);
  await syncCalculatedFields(prisma);
  await syncActivityLogHistories(prisma);
  await syncServiceContracts(prisma);
  await syncServiceContractTerms(prisma);
})();
