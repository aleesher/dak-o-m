import * as express from "express";

import { Prisma } from "../generated/prisma-client";
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
} from "../helpers/webservices";
import { syncCalculatedFields } from "../prisma/seed/calculated";

export default (prisma: Prisma) => {
  const app = express();

  app.get('/', async (req, res) => {
    console.log("Started all sync...");
    console.time('syncAll');

    let results = [];

    results['syncServiceContractSO'] = await syncServiceContractSO(prisma);
    results['syncServiceOrders'] = await syncServiceOrders(prisma);
    results['syncWorkOrders'] = await syncWorkOrders(prisma);
    results['syncServiceTexts'] = await syncServiceTexts(prisma);
    results['syncServiceStatuses'] = await syncServiceStatuses(prisma);
    results['syncActivityLogs'] = await syncActivityLogs(prisma);
    results['syncAllProjects'] = await syncAllProjects(prisma);
    results['syncProjects'] = await syncProjects(prisma);
    results['syncProjectFiles'] = await syncProjectFiles(prisma);
    results['syncCalculatedFields'] = await syncCalculatedFields(prisma);
    results['syncActivityLogHistories'] = await syncActivityLogHistories(prisma);
    results['syncServiceContracts'] = await syncServiceContracts(prisma);
    results['syncServiceContractTerms'] = await syncServiceContractTerms(prisma);

    console.timeEnd('syncAll');
    console.log("Sync all ended. Total:", results);
    
    return res.json({...results});
  });

  app.get('/test', async (req, res) => {
    return res.json({ result: 'test' });
  });

  return app
}