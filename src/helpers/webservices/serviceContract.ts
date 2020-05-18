import {
  Prisma,
  ServiceContractCreateInput,
  ContractInvoicePeriod,
  ContractInstallmentType,
  ContractInvoiceType,
  ContractStatus
} from "../../generated/prisma-client";
import { getDataRecursively } from "../../lib/dakota-services-common/helpers/webservices";
import { WEBSERVICE_PAGES, DEFAULT_COMPANY_NAME } from "./constants";
import { wait } from "..";

interface WSResult {
  Key: string;
  No: string;
  Description: string;
  _x0031_e_dak_adres: string;
  _x0031_e_dak_plaats: string;
  Status: string;
  Order_Date: string;
  Starting_Date: string;
  Ending_Date: string;
  Termination_Date: string;
  Customer_No: string;
  Name: string;
  Name_2: string;
  Address: string;
  Post_Code: string;
  City: string;
  Contact_Person: string;
  Contact_Name: string;
  Phone_No: string;
  E_Mail: string;
  Bill_to_Customer_No_Contr: string;
  Bill_to_Name_Contract: string;
  Bill_to_Address_Contract: string;
  Bill_to_Post_Code_Contract: string;
  Bill_to_City_Contract: string;
  Bill_to_Contact_Person_Contr: string;
  Bill_to_Cont_Pers_Name_Ctr: string;
  Global_Dimension_1_Code: string;
  Initieel_verkoopbedrag: string;
  MaintenanceInvoiceMgt_GetContractAmntByDate_Rec_x002C_WORKDATE: string;
  Last_Index_Date: string;
  Contract_Manager: string;
  Contract_Manager_Name: string;
  Your_Reference: string;
  Blocked: string;
  Onderhoudsjaar_eerste: string;
  Onderhouds_maand: string;
  Aantal_SO_berekend: string;
  Aantal_SO_gemaakt: string;
  Aantal_SO_open: string;
  Aantal_SO_gereed: string;
  Percentagegereed: string;
  Werkuren: string;
  Bestede_uren: string;
  Bestede_uren_vorig_jaar: string;
  Totale_kosten: string;
  Gefactureerd: string;
  Invoiced_Until: string;
  Aantal_m2_dak: string;
  Aantal_m2_dak_gereed: string;
  Aantal_m2_dak_gereedPercent: string;
  Rapportage_document: string;
  Installments_based_on_Progress: string;
  Invoice_Type: string;
  Installment_Type: string;
  Invoice_Period: string;
  Currency_Code: string;
  Service_Index_Method: string;
  Invoice_Text_Installments: string;
  Uitbesteed: string;
  LaatstUitgevoerdDoor: string;
}

const mapWSEntities = (wsResul: WSResult): ServiceContractCreateInput => ({
  code: wsResul.No,
  description: wsResul.Description,
  roofAddress: wsResul._x0031_e_dak_adres,
  roofCity: wsResul._x0031_e_dak_plaats,
  status: wsResul.Status as ContractStatus,
  orderDate: wsResul.Order_Date,
  startingDate: wsResul.Starting_Date,
  endingDate: wsResul.Ending_Date,
  terminationDate: wsResul.Termination_Date,
  customerCode: wsResul.Customer_No,
  name: wsResul.Name,
  name2: wsResul.Name_2,
  address: wsResul.Address,
  postcode: wsResul.Post_Code,
  city: wsResul.City,
  contactPersonCode: wsResul.Contact_Person,
  contactName: wsResul.Contact_Name,
  phoneNo: wsResul.Phone_No,
  email: wsResul.E_Mail,
  billToCustomerNoContr: wsResul.Bill_to_Customer_No_Contr,
  billToNameContract: wsResul.Bill_to_Name_Contract,
  billToAddressContract: wsResul.Bill_to_Address_Contract,
  billToPostCodeContract: wsResul.Bill_to_Post_Code_Contract,
  billToCityContract: wsResul.Bill_to_City_Contract,
  billToContactPersonContr: wsResul.Bill_to_Contact_Person_Contr,
  billToContPersNameCtr: wsResul.Bill_to_Cont_Pers_Name_Ctr,
  globalDimension1Code: wsResul.Global_Dimension_1_Code,
  initialSalesAmount: parseFloat(wsResul.Initieel_verkoopbedrag),
  maintenanceInvoiceMgtGetContractAmntByDateRecWorkDate: parseFloat(
    wsResul.MaintenanceInvoiceMgt_GetContractAmntByDate_Rec_x002C_WORKDATE
  ),
  lastIndexDate: wsResul.Last_Index_Date,
  contractManager: wsResul.Contract_Manager,
  contractManagerName: wsResul.Contract_Manager_Name,
  yourReference: wsResul.Your_Reference,
  blocked: wsResul.Blocked === "true",
  firstYearMaintenance: parseInt(wsResul.Onderhoudsjaar_eerste),
  maintenanceMonth: parseInt(wsResul.Onderhouds_maand),
  acknowledgedSO: parseInt(wsResul.Aantal_SO_berekend),
  createdSO: parseFloat(wsResul.Aantal_SO_gemaakt),
  openedSO: parseFloat(wsResul.Aantal_SO_open),
  readySO: parseFloat(wsResul.Aantal_SO_gereed),
  percentageReady: parseFloat(wsResul.Percentagegereed),
  workingHours: parseFloat(wsResul.Werkuren),
  spendHours: parseFloat(wsResul.Bestede_uren),
  hoursSpentLastYear: parseFloat(wsResul.Bestede_uren_vorig_jaar),
  totalCost: parseFloat(wsResul.Totale_kosten),
  billedAmount: parseFloat(wsResul.Gefactureerd),
  invoicedUntil: wsResul.Invoiced_Until,
  m2Dak: parseFloat(wsResul.Aantal_m2_dak),
  m2DakReady: parseFloat(wsResul.Aantal_m2_dak_gereed),
  m2DakReadyPercent: wsResul.Aantal_m2_dak_gereedPercent,
  reportDocument: wsResul.Rapportage_document,
  installmentsBasedOnProgress:
    wsResul.Installments_based_on_Progress === "true",
  invoiceType: wsResul.Invoice_Type as ContractInvoiceType,
  installmentType: wsResul.Installment_Type as ContractInstallmentType,
  invoicePeriod: wsResul.Invoice_Period as ContractInvoicePeriod,
  currencyCode: wsResul.Currency_Code,
  serviceIndexMethod: wsResul.Service_Index_Method,
  invoiceTextInstallments: wsResul.Invoice_Text_Installments,
  outsourced: wsResul.Uitbesteed === "true",
  lastExecutedBy: wsResul.LaatstUitgevoerdDoor
});

export const syncServiceContracts = async (prisma: Prisma, filters = {}) => {
  console.log("Started ServiceContracts sync...");
  console.time("syncServiceContracts");

  console.log("Getting service contracts");
  console.time("getServiceContracts");

  const total = await getDataRecursively(
    WEBSERVICE_PAGES.SERVICE_CONTRACT,
    DEFAULT_COMPANY_NAME,
    async data => {
      console.log("Mappting results");
      console.time("mappingResults");
      const serviceContracts: ServiceContractCreateInput[] = (data as WSResult[]).map(
        entity => mapWSEntities(entity)
      );
      console.timeEnd("mappingResults");

      console.time("createServiceContract");

      const tasks = serviceContracts.map(async entity => {
        try {
          await wait(100);
          const res = await prisma.createServiceContract(entity);
          return res.id;
        } catch (e) {
          console.error(e.message);
          return null;
        }
      });

      await Promise.all(tasks);

      console.timeEnd("createServiceContract");
    },
    filters
  );

  console.timeEnd("syncServiceContracts");
  console.log("Sync serviceContracts ended. Total:", total);

  return total;
};
