import { Prisma, WorkOrderCreateInput } from "../../generated/prisma-client";
import { getDataRecursively } from "../../lib/dakota-services-common/helpers/webservices";
import { WEBSERVICE_PAGES, DEFAULT_COMPANY_NAME } from "./constants";
import { wait } from "..";
import { convertPriority } from "./serviceOrder";

interface WSResult {
  Key: string,
  No: string,
  Source_Company: string,
  Source_Type: string,
  Source_No: string,
  Description: string,
  Resource_Type: string,
  Resource_No: string,
  Resource_Company: string,
  Leading_Resource: string,
  Actual_Field_Service_Status: string,
  Fld_Srv_Status_Reason_Desc: string,
  WO_Finished_Field_Service: string,
  First_Possible_Start_Date_Time: string,
  Last_Possible_Ending_Date_Time: string,
  Starting_Date_Time: string,
  Ending_Date_Time: string,
  Expected_Hours: string,
  Duration_Time: string,
  Plan_during_Clock_Time: string,
  Firm_Planned: string,
  Export_to_FSA: string,
  Date_Time_Export_to_FSA: string,
  Actual_Reference_Point: string,
  Assigned_to: string,
  Global_Dimension_1_Code: string,
  Service_Contract_No: string,
  Order_Manager: string,
  Address: string,
  Post_Code: string,
  City: string,
  Customer_No: string,
  Werkomschrijving: string,
  SO_No: string,
  SO_Call_No: string,
  SO_Order_Kind: string,
  SO_Description: string,
  SO_Contact_No: string,
  SO_Contact_Person_No: string,
  SO_Bill_to_Customer_No: string,
  SO_Customer_Feature: string,
  SO_Your_Reference: string,
  SO_Order_No_Customer: string,
  SO_Commision_Date: string,
  SO_Service_Location_No: string,
  SO_Name: string,
  SO_Name_2: string,
  SO_Country_Region_Code: string,
  ServiceOrderExtension_Latitude: string, // Not used
  ServiceOrderExtension_Longitude: string, // Not used
  SO_Source_Type: string,
  SO_Service_Contract_No: string,
  SO_Global_Dimension_1_Code: string,
  SO_Territory_Code: string,
  SO_Order_Date: string,
  SO_Order_Time: string,
  SO_Budget_Hours: string,
  SO_Expected_Hours: string,
  SO_Duration_Time: string,
  SO_Firm_Planned: string,
  SO_Starting_Date: string,
  SO_Starting_Time: string,
  SO_Ending_Date: string,
  SO_Ending_Time: string,
  SO_Priority: string,
  SO_Next_Deadline: string,
  SO_Status: string,
  Actual_Reference_Point2: string,
  SO_Order_Manager: string,
  SO_Assigned_to: string,
  SO_Preferred_Employee_No: string, // Not used
  SO_Employee_No: string,
  GeefDakpartnerNaam: string,
  SO_Subcontractor: string, // Not used
  SO_Service_Warranty_Code: string, // Not used
  Telefoon: string, // Not used
  TelefoonMobiel: string, // Not used
  EMail: string,
  Meldertype: string,
  NietnaarDakota: string,
  SO_Service_Type: string,
  SO_Invoiced_Price: string,
  SO_Service_Package: string,
  SO_Currency_Code: string, // Not used
  SO_Order_Amount: string,
  SO_Service_Control_Period_Date: string,
  SO_Remote_Control: string,
  DatumEersteDeadline: string,
  GDDServiceOrder_DatumGestart: string,
  DatumUitgevoerd: string,
  GDDServiceOrder_DatumGefactureerd: string,
  SO_Description_Problem: string,
  SO_Description_Cause: string,
  SO_Description_Solution: string,
  ExporttoFSA2: string,
  SO_Date_Time_Export_to_FSA: string,
}

const mapWSEntities = (wsResul: WSResult, serviceOrderCodes: string[]): WorkOrderCreateInput => ({
  code: wsResul.No,
  sourceCompanyName: wsResul.Source_Company,
  sourceType: wsResul.Source_Type,
  sourceCode: wsResul.Source_No,
  description: wsResul.Description,
  resourceType: wsResul.Resource_Type,
  resourceCode: wsResul.Resource_No,
  resourceCompanyName: wsResul.Resource_Company,
  isMainResource: wsResul.Leading_Resource === 'true',
  serviceStatus: wsResul.Actual_Field_Service_Status,
  statusReasonDescription: wsResul.Fld_Srv_Status_Reason_Desc,
  isFinishedService: wsResul.WO_Finished_Field_Service === 'true',
  firstPossibleStartDate: wsResul.First_Possible_Start_Date_Time,
  lastPossibleStartDate: wsResul.Last_Possible_Ending_Date_Time,
  starDate: wsResul.Starting_Date_Time,
  endDate: wsResul.Ending_Date_Time,
  expectedHours: parseFloat(wsResul.Expected_Hours),
  durationTime: parseFloat(wsResul.Duration_Time),
  isDuringClockTime: wsResul.Plan_during_Clock_Time === 'true',
  isFirmPlanned: wsResul.Firm_Planned === 'true',
  isExportToFSA: wsResul.Export_to_FSA === 'true',
  exportToFSADate: wsResul.Date_Time_Export_to_FSA,
  actualReferencePoint: wsResul.Actual_Reference_Point,
  assignedTo: wsResul.Assigned_to,
  globalDimensionCode: wsResul.Global_Dimension_1_Code,
  serviceContractCode: wsResul.Service_Contract_No,
  orderManager: wsResul.Order_Manager,
  address: wsResul.Address,
  postalCode: wsResul.Post_Code,
  city: wsResul.City,
  customerCode: wsResul.Customer_No,
  jobDescription: wsResul.Werkomschrijving,
  soCode: wsResul.SO_No,
  soCallerCode: wsResul.SO_Call_No,
  soOrderType: wsResul.SO_Order_Kind,
  soDescription: wsResul.SO_Description,
  soContactCode: wsResul.SO_Contact_No,
  soContactPersonCode: wsResul.SO_Contact_Person_No,
  soBillingCode: wsResul.SO_Bill_to_Customer_No,
  soCustomerFeature: wsResul.SO_Customer_Feature,
  soReference: wsResul.SO_Your_Reference,
  soOrderCodeCustomer: wsResul.SO_Order_No_Customer,
  soCommissionDate: wsResul.SO_Commision_Date,
  soServiceLocationCode: wsResul.SO_Service_Location_No,
  soName: wsResul.SO_Name,
  soName2: wsResul.SO_Name_2,
  soCountryCode: wsResul.SO_Country_Region_Code,
  soSourceType: wsResul.SO_Source_Type,
  soServiceContractCode: wsResul.SO_Service_Contract_No,
  soGlobalDimensionCode: wsResul.SO_Global_Dimension_1_Code,
  soTerritoryCode: wsResul.SO_Territory_Code,
  soOrderDate: wsResul.SO_Order_Date,
  soOrderTime: wsResul.SO_Order_Time,
  soBudgetHours: parseFloat(wsResul.SO_Budget_Hours),
  soExpectedHours: parseFloat(wsResul.SO_Expected_Hours),
  soDurationTime: parseFloat(wsResul.SO_Duration_Time),
  soIsFirmPlanned: wsResul.SO_Firm_Planned === 'true',
  soStarDate: wsResul.SO_Starting_Date,
  soStarTime: wsResul.SO_Starting_Time,
  soEndDate: wsResul.SO_Ending_Date,
  soEndTime: wsResul.SO_Ending_Time,
  soPriority: convertPriority(wsResul.SO_Priority),
  soNextDeadline: wsResul.SO_Next_Deadline,
  soStatus: wsResul.SO_Status,
  soActualReferencePoint: wsResul.Actual_Reference_Point2,
  soOrderManager: wsResul.SO_Order_Manager,
  soAssignedTo: wsResul.SO_Assigned_to,
  soEmployeeCode: wsResul.SO_Employee_No,
  roofingPartnerName: wsResul.GeefDakpartnerNaam,
  detectorType: wsResul.Meldertype,
  notInDakota: wsResul.NietnaarDakota,
  soServiceType: wsResul.SO_Service_Type,
  soInvoicedPrice: parseFloat(wsResul.SO_Invoiced_Price),
  soServicePackage: wsResul.SO_Service_Package,
  soOrderAmount: parseInt(wsResul.SO_Order_Amount),
  soServiceControlPeriodDate: wsResul.SO_Service_Control_Period_Date,
  soIsRemoteControl: wsResul.SO_Remote_Control === 'true',
  firstDeadline: wsResul.DatumEersteDeadline,
  gdbServiceOrderStartDate: wsResul.GDDServiceOrder_DatumGestart,
  dateExecuted: wsResul.DatumUitgevoerd,
  gdbServiceOrderInvoicedDate: wsResul.GDDServiceOrder_DatumGefactureerd,
  soProblemDescription: wsResul.SO_Description_Problem,
  soProblemCause: wsResul.SO_Description_Cause,
  soProblemSolution: wsResul.SO_Description_Solution,
  isExportToFSA2: wsResul.ExporttoFSA2 === 'true',
  soExportToFSADate: wsResul.SO_Date_Time_Export_to_FSA,


  // Connections
  serviceOrder: serviceOrderCodes.includes(wsResul.SO_No) ? {
    connect: {
      code: wsResul.SO_No
    }
  } : null,
});

export const syncWorkOrders = async (prisma: Prisma, filters = {}) => {
  console.log("Started workOrders sync...");
  console.time('syncWorkOrders');

  console.log('Getting service orders');
  console.time("getServiceOrders");
  const serviceOrders = await prisma.serviceOrders().$fragment(`{
    code
  }`) as any[];
  const serviceOrderCodes = serviceOrders.map(s => s.code);
  console.log('Service orders count:', serviceOrderCodes.length);
  console.timeEnd("getServiceOrders");

  const total = await getDataRecursively(
    WEBSERVICE_PAGES.WORK_ORDER,
    DEFAULT_COMPANY_NAME,
    async (data) => {
      console.log("Mappting results");
      console.time('mappingResults');
      const workOrders: WorkOrderCreateInput[] = (data as WSResult[]).map(
        (entity) => mapWSEntities(entity, serviceOrderCodes)
      );
      console.timeEnd('mappingResults');

      console.time('createWorkOrder');

      const tasks = workOrders.map(async (entity) => {
        try {
          await wait(100);
          const res = await prisma.createWorkOrder(entity);

          return res.id;
        } catch(e) {
          console.error(e.message);
          return null;
        }
      });

      await Promise.all(tasks);

      console.timeEnd('createWorkOrder');
    },
    filters
  );

  console.timeEnd('syncWorkOrders');
  console.log("Sync workOrders ended. Total:", total);

  return total;
}
