import { Prisma, ActivityLogCreateInput } from "../../generated/prisma-client";
import { getDataRecursively } from "../../lib/dakota-services-common/helpers/webservices";
import { WEBSERVICE_PAGES, DEFAULT_COMPANY_NAME } from "./constants";
import { wait } from "..";

interface WSResult {
  Key: string,
  No: string,
  Description: string,
  Apply: string,
  Colour: string,
  Eventtype_in_Resource_Planning: string,
  Triggered_by_Status_PurchQuote: string,
  Triggered_by_Status_PurchOrder: string,
  Triggered_by_Status_ServCall: string,
  Triggered_by_Status_ServOrder: string,
  Triggered_by_Field_Service: string,
  Block_Modify_Service_Order: string,
  Skip_Export_to_FSA: string,
  Send_Status_Update_Mail: string,
  Send_Mail_Work_Sheet: string,
  Publish_on_Service_Portal: string,
  Send_Mail_to_Subcontractor: string,
  Update_WO_Starting_Time: string,
  Update_WO_Ending_Time: string,
  N_A_for_Actual_Reference_Point: string,
}

const mapWSEntities = (wsResult: WSResult): ActivityLogCreateInput => ({
  code: wsResult.No,
  description: wsResult.Description,
  apply: wsResult.Apply,
  colour: wsResult.Colour,
  eventType: wsResult.Eventtype_in_Resource_Planning,
  statusPurchQuote: wsResult.Triggered_by_Status_PurchQuote,
  statusPurchOrder: wsResult.Triggered_by_Status_PurchOrder,
  statusServiceCall: wsResult.Triggered_by_Status_ServCall,
  statusServiceOrder: wsResult.Triggered_by_Status_ServOrder,
  fieldService: wsResult.Triggered_by_Field_Service,
  blockModifyServiceOrder: wsResult.Block_Modify_Service_Order === 'true',
  skipExportToFSA: wsResult.Skip_Export_to_FSA === 'true',
  sendStatusUpdateMail: wsResult.Send_Status_Update_Mail === 'true',
  sendMailWorkSheet: wsResult.Send_Mail_Work_Sheet === 'true',
  publishOnServicePOrtal: wsResult.Publish_on_Service_Portal === 'true',
  sendMainToSubcontractor: wsResult.Send_Mail_to_Subcontractor === 'true',
  updateWOStartTime: wsResult.Update_WO_Starting_Time === 'true',
  updateWOEndTime: wsResult.Update_WO_Ending_Time === 'true',
  naForActualReferencePoint: wsResult.N_A_for_Actual_Reference_Point === 'true',
});

export const syncActivityLogs = async (prisma: Prisma, filters = {}) => {
  console.log("Started activityLogs sync...");
  console.time('syncActivityLogs');

  const total = await getDataRecursively(
    WEBSERVICE_PAGES.ACTIVITY_LOG,
    DEFAULT_COMPANY_NAME,
    async (data) => {
      const activityLogs: ActivityLogCreateInput[] = (data as WSResult[]).map(
        (entity) => mapWSEntities(entity)
      );

      console.time('createActivityLog');

      const tasks = activityLogs.map(async (entity) => {
        try {
          await wait(100);
          const res = await prisma.createActivityLog(entity);
          return res.id;
        } catch(e) {
          console.error(e.message);
          return null;
        }
      });

      await Promise.all(tasks);

      console.timeEnd('createActivityLog');
    },
    filters,
  );

  console.timeEnd('syncActivityLogs');
  console.log("Sync activityLogs ended. Total:", total);

  return total;
}
