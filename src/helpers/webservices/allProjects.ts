import { Prisma, ProjectCreateInput } from "../../generated/prisma-client";
import { getDataRecursively } from "../../lib/dakota-services-common/helpers/webservices";
import { WEBSERVICE_PAGES, DEFAULT_COMPANY_NAME } from "./constants";
import { wait } from "..";

interface WSResult {
  Key: string,
  No: string,
  Single_Main_Sub_Project: string,
  Main_Project: string,
  Description: string,
  Address: string,
  Post_Code: string,
  City: string,
  Salesperson_Code: string,
  Estimator: string,
  Project_Manager: string,
  Site_Manager: string,
  Ploeg: string,
  Project_Contract_Amount: string,
  Percentagegereed: string,
  Project_Status: string,
  Status_Modification_Date: string,
  Bill_to_Customer_No: string,
  Commision_Date: string,
  Starting_Date: string,
  Ending_Date: string,
  Einde_garantie: string,
  Complexcode: string,
  Werksoort: string,
  Dakpartner: string,
  KwaliteitsmetingDocumentNo: string,
  VoortgangsverslagDocumentNo: string,
  OpleveringsrapportDocumentNo: string,
}

const getProjectType = (type: string) => {
  switch(type) {
    case "Single": return "Single";
    case "Main_Project": return "Main_Project";
    case "Sub_Project": return "Sub_Project";
    default: return null;
  }
}

const mapWSEntities = (wsResul: WSResult): ProjectCreateInput => ({
  projectNumber: wsResul.No,
  projectType: getProjectType(wsResul.Single_Main_Sub_Project),
  mainProject: wsResul.Main_Project,
  description: wsResul.Description,
  address: wsResul.Address,
  postalCode: wsResul.Post_Code,
  city: wsResul.City,
  salesPersonCode: wsResul.Salesperson_Code,
  estimatorCode: wsResul.Estimator,
  projectManagerCode: wsResul.Project_Manager,
  siteManagerCode: wsResul.Site_Manager,
  team: wsResul.Ploeg,
  contractValue: parseFloat(wsResul.Project_Contract_Amount),
  percentageDone: parseInt(wsResul.Percentagegereed),
  status: wsResul.Project_Status,
  statusModificationDate: wsResul.Status_Modification_Date,
  billToCustomerNo: wsResul.Bill_to_Customer_No,
  commissionDate: wsResul.Commision_Date,
  startDate: wsResul.Starting_Date,
  endDate: wsResul.Ending_Date,
  warrantyEndDate: wsResul.Einde_garantie,
  complexCode: wsResul.Complexcode,
  workType: wsResul.Werksoort,
  roofingPartnerName: wsResul.Dakpartner,
  qualityMeasurementDocumentNo: wsResul.KwaliteitsmetingDocumentNo,
  progressReportDocumentNo: wsResul.VoortgangsverslagDocumentNo,
  deliveryReportDocumentNo: wsResul.OpleveringsrapportDocumentNo,
});


export const syncAllProjects = async (prisma: Prisma, filters = {}) => {
  console.log("Started all projects sync...");
  console.time('syncAllProjects');

  const total = await getDataRecursively(
    WEBSERVICE_PAGES.ALL_PROJECT,
    DEFAULT_COMPANY_NAME,
    async (data) => {
      try  {
        let projects: ProjectCreateInput[] = (data as WSResult[]).map(
          (entity) => mapWSEntities(entity)
        );

        console.time('createProject');

        const tasks = projects.map(async (entity) => {
          try {
            await wait(100);
            const res = await prisma.createProject(entity);
            return res;
          } catch(e) {
            console.error(e.message);
            return null;
          }
        });

        await Promise.all(tasks);
        console.timeEnd('createProject');
      } catch (e) {
        console.error(e.message);
      }
    },
    filters
  );

  console.timeEnd('syncAllProjects');
  console.log("Sync projects ended. Total:", total);

  return total;
}
