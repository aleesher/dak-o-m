import { Prisma, ServiceOrderCreateInput, PriorityType } from "../../generated/prisma-client";
import { getDataRecursively } from "../../lib/dakota-services-common/helpers/webservices";
import { WEBSERVICE_PAGES, DEFAULT_COMPANY_NAME } from "./constants";
import { wait } from "..";

export function convertPriority(value: string): PriorityType {
  switch (value) {
    case "1": return "HIGH";
    case "2": return "MEDIUM";
    case "3": return "LOW";
    default: throw new Error('Unknown priority value');
  }
}

interface WSResult {
  Key: string;
  Bedrijf: string;
  No: string;
  Call_No: string;
  Order_Kind: string;
  Description: string;
  Description_2: string; // Not used
  Contact_No: string;
  Customer_No: string;
  Contact_Person_No: string;
  Contact_Person_Gender: string;
  Bill_to_Customer_No: string;
  Customer_Feature: string;
  Your_Reference: string;
  Order_No_Customer: string;
  Commision_Date: string;
  Service_Location_No: string;
  Name: string;
  Name_2: string; // Not used
  Address: string;
  Post_Code: string;
  City: string;
  Country_Region_Code: string;
  ServiceOrderExtension_Latitude: string; // Not used
  ServiceOrderExtension_Longitude: string; // Not used
  Source_Type: string;
  Service_Contract_No: string;
  Global_Dimension_1_Code: string;
  Territory_Code: string;
  Order_Date: string;
  Order_Time: string;
  Budget_Hours: string;
  Expected_Hours: string;
  Duration_Time: string;
  Firm_Planned: string;
  Starting_Date: string;
  Starting_Time: string;
  Ending_Date: string;
  Ending_Time: string;
  Priority: string;
  Next_Deadline: string;
  Status: string;
  Actual_Reference_Point2: string;
  Actual_Reference_Point_Desc: string;
  Order_Manager: string;
  Assigned_to: string;
  Preferred_Employee_No: string; // Not used
  Employee_No: string;
  GeefDakpartnerNaam: string;
  Subcontractor: string; // Not used
  Service_Warranty_Code: string; // Not used
  Telefoon: string; // Not used
  TelefoonMobiel: string; // Not used
  EMail: string;
  Meldertype: string;
  NietnaarDakota: string;
  GDDServiceOrder_MoetNaarTrackEnTrace: string;
  GDDServiceOrder_MoetNaarKTO: string;
  KTOCijfer: string;
  KTOOpmerking: string; // Not used
  Service_Type: string;
  Invoiced_Price: string;
  Service_Package: string;
  Currency_Code: string; // Not used
  Order_Amount: string;
  Service_Control_Period_Date: string;
  Remote_Control: string;
  DatumEersteDeadline: string;
  GDDServiceOrder_DatumGestart: string;
  DatumUitgevoerd: string;
  GDDServiceOrder_DatumGefactureerd: string;
  Description_Problem: string;
  Description_Cause: string;
  Description_Solution: string;
  ExporttoFSA2: string;
  Date_Time_Export_to_FSA: string;
  Signer: string;
  _E_Mail_Signer: string; // Not used
  Send_Report: string;
  SO_Finished_Field_Service: string;
  Maker: string;
  Created_on: string;
  Modified_on: string;
  DDAlgemeen_GeefNaamEmployeeAdHADAccount_Modified_by: string;
  Base_Service_Order_No: string;
  Base_Service_Order: string;
  Actual_Hours: string;
  Vervolgorderaanwezig: string;
}

const mapWSEntities = (wsResul: WSResult): ServiceOrderCreateInput => ({
  code: wsResul.No,
  companyName: wsResul.Bedrijf,
  callerCode: wsResul.Call_No,
  orderType: wsResul.Order_Kind,
  description: wsResul.Description,
  ownerCode: wsResul.Contact_No,
  customerCode: wsResul.Customer_No,
  contactPersonCode: wsResul.Contact_Person_No,
  contactPersonGender: wsResul.Contact_Person_Gender,
  billingCode: wsResul.Bill_to_Customer_No,
  customerFeature: wsResul.Customer_Feature,
  reference: wsResul.Your_Reference,
  orderCodeCustomer: wsResul.Order_No_Customer,
  commissionDate: wsResul.Commision_Date,
  serviceLocationCode: wsResul.Service_Location_No,
  name: wsResul.Name,
  address: wsResul.Address,
  postalCode: wsResul.Post_Code,
  city: wsResul.City,
  countryCode: wsResul.Country_Region_Code,
  sourceType: wsResul.Source_Type,
  serviceContractCode: wsResul.Service_Contract_No,
  globalDimensionCode: wsResul.Global_Dimension_1_Code,
  territoryCode: wsResul.Territory_Code,
  orderDate: wsResul.Order_Date,
  orderTime: wsResul.Order_Time,
  budgetHours: parseFloat(wsResul.Budget_Hours),
  expectedHours: parseFloat(wsResul.Expected_Hours),
  durationTime: parseFloat(wsResul.Duration_Time),
  isFirmPlanned: wsResul.Firm_Planned === "true",
  startDate: wsResul.Starting_Date,
  startTime: wsResul.Starting_Time,
  endDate: wsResul.Ending_Date,
  endTime: wsResul.Ending_Time,
  priority: convertPriority(wsResul.Priority),
  nextDeadline: wsResul.Next_Deadline,
  status: wsResul.Status,
  actualReferencePoint: wsResul.Actual_Reference_Point2,
  actualReferencePointDescription: wsResul.Actual_Reference_Point_Desc,
  orderManager: wsResul.Order_Manager,
  assignedTo: wsResul.Assigned_to,
  employeeCode: wsResul.Employee_No,
  roofingPartnerName: wsResul.GeefDakpartnerNaam,
  detectorType: wsResul.Meldertype,
  notInDakota: wsResul.NietnaarDakota === "true",
  gdbServiceOrderTrackAndTrace:
    wsResul.GDDServiceOrder_MoetNaarTrackEnTrace === "true",
  gdbServiceOrderKTO: wsResul.GDDServiceOrder_MoetNaarKTO === "true",
  ktoFiture: parseFloat(wsResul.KTOCijfer),
  serviceType: wsResul.Service_Type,
  invoicedPrice: parseFloat(wsResul.Invoiced_Price),
  servicePackage: parseFloat(wsResul.Service_Package),
  orderAmount: parseFloat(wsResul.Order_Amount),
  serviceControlPeriodDate: wsResul.Service_Control_Period_Date,
  isRemoteControl: wsResul.Remote_Control === "true",
  firstDeadline: wsResul.DatumEersteDeadline,
  gdbServiceOrderStartDate: wsResul.GDDServiceOrder_DatumGestart,
  dateExecuted: wsResul.DatumUitgevoerd,
  gdbServiceOrderInvoicedDate: wsResul.GDDServiceOrder_DatumGefactureerd,
  problemDescription: wsResul.Description_Problem,
  problemCause: wsResul.Description_Cause,
  problemSolution: wsResul.Description_Solution,
  isExportToFSA2: wsResul.ExporttoFSA2 === "true",
  exportToFSADate: wsResul.Date_Time_Export_to_FSA,
  signedBy: wsResul.Signer,
  isSendReport: wsResul.Send_Report === "true",
  isFinishedFieldService: wsResul.SO_Finished_Field_Service === "true",
  cratedBy: wsResul.Maker,
  creationDate: wsResul.Created_on,
  updateDate: wsResul.Modified_on,
  updatedBy: wsResul.DDAlgemeen_GeefNaamEmployeeAdHADAccount_Modified_by,
  baseServiceOrderCode: wsResul.Base_Service_Order_No,
  isBaseServiceOrder: wsResul.Base_Service_Order === "true",
  hasAdditionalServiceOrder: wsResul.Vervolgorderaanwezig === "true", // what about previous service order?
  actualHours: parseFloat(wsResul.Actual_Hours)
});

export const syncServiceOrders = async (prisma: Prisma, filters = {}) => {
  console.log("Started serviceOrders sync...");
  console.time("syncServiceOrders");

  const total = await getDataRecursively(
    WEBSERVICE_PAGES.SERVICE_ORDER,
    DEFAULT_COMPANY_NAME,
    async data => {
      try {
        const serviceOrders: ServiceOrderCreateInput[] = (data as WSResult[]).map(
          entity => mapWSEntities(entity)
        );

        console.time("createServiceOrder");

        const tasks = serviceOrders.map(async entity => {
          try {
            await wait(100);
            const res = await prisma.createServiceOrder(entity);
            const contractCode = res.serviceContractCode || res.contractCode;
            if (contractCode) {
              const serviceContract = await prisma.serviceContract({
                code: contractCode
              });
              if (serviceContract) {
                await prisma.updateServiceContract({
                  data: {
                    serviceOrders: {
                      connect: {
                        id: res.id
                      }
                    }
                  },
                  where: {
                    id: serviceContract.id
                  }
                });
              }
            }
            return res.id;
          } catch (e) {
            console.error(e.message);
            return null;
          }
        });

        await Promise.all(tasks);

        console.timeEnd("createServiceOrder");
      } catch (e) {
        console.error(e.message);
      }
    },
    filters
  );

  console.timeEnd("syncServiceOrders");
  console.log("Sync serviceOrders ended. Total:", total);

  return total;
};
