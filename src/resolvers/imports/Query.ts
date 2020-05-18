import * as _ from "lodash";
import * as fs from "fs";
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
import { syncCalculatedFields } from "../../prisma/seed/calculated";
import { s3Helper } from "../../lib/dakota-services-common/helpers/file/s3";
import pubSub from "../../lib/dakota-services-common/helpers/subscriptions/pubSub";
import { EVENTS } from "../../lib/dakota-services-common/helpers/subscriptions/constants";

const LOG_DIR = 'log-test';
const PORTAL_URL = 'https://development.dakota2.nl/logs';
const LOG_URL = 'http://dakota2-api-dev.secondcompany.nl/logs/?id=';

function logImport(writeStream){
  const CONSOLE_LOG = console.log;

  return function(...args){
    CONSOLE_LOG(...args);
    let output = `${args.join(' ')}\n`;
    if(writeStream.writable)
      writeStream.write(output);

    pubSub.publish(EVENTS.IMPORT_LOGS.SEED, { logs: [output] }); // send to subscriber
  }
}

const queries = {
    seedOrderManagement: async () => {
      const file = `${(new Date()).getTime()}.txt`;
      const key = `${LOG_DIR}/dakota/${file}`;
      const writeStream = fs.createWriteStream(file);

      try {
        console.log = logImport(writeStream);

        writeStream.on('finish', async function () {
          try{
            await s3Helper.uploadFile({
              Body: fs.createReadStream(file),
              Key: key,
              ContentType: 'txt',
            });
            fs.unlinkSync(file);
          } catch (err) {
            console.log(err.message)
          }
        });

        console.log("Started all sync...");
        console.time('syncAll');

        const promise = new Promise(async (resolve, reject) => {
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

          resolve(13);
        });
        promise.then((results) => {
          console.timeEnd('syncAll');
          console.log("Sync all ended. Total:", results);

          writeStream.end();
        });

        return {importFileUrl: `${LOG_URL}${key}`, importLogUrl: PORTAL_URL};

      } catch (err) {
        console.log('failed: ', err.message)
        writeStream.end();
        
        return {
          message: err.message,
          importLogUrl: PORTAL_URL,
          importFileUrl: `${LOG_URL}${key}`, 
        };
      }
    },

    resetOrderManagement: async () => {
      const delMany  = async (T) => {
        const mutation = `
          mutation {
            deleteMany${T}(where: {
              id_not: 0
            }){
              count
            }
          }
        `;
  
        const result = await prisma.$graphql(mutation);
        return result[`deleteMany${T}`].count;
      }

      const Collections = [
        'ServiceContracts',
        'ServiceOrders',
        'WorkOrders',
        'ServiceTexts',
        'ServiceStatuses',
        'ActivityLogs',
        'Projects',
        'ActivityLogHistories',
        'ServiceContracts',
        'ServiceContractTerms'
      ];
      let results = [];
      
      try{

          for(let i = 0; i < Collections.length; i++){
              let collectionName = Collections[i];
              results[collectionName] = await delMany(collectionName);
              console.log('deleted', collectionName, results[collectionName]);
          }
          
          return {...results};
  
      } catch (e) {
        return {
          status: 'failed',
          message: e.message,
          progress: results,
        };
      }
    },
};

export default {
  ...queries,
};
