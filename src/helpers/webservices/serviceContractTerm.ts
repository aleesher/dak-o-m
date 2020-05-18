import {
  Prisma,
  ServiceContractTermCreateInput,
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
  Service_Contract_No: string;
  Line_No: string;
  Invoice_From: string;
  Ending_Date: string;
  Invoiced_Until: string;
  Invoice_Interval: string;
  Invoice_Postpone_Period: string;
  NextInvoicingDate: string;
  Progress_Percent: string;
  gvMaintInvMngmntCU_GetContractCurrency_Service_Contract_No: string;
  Invoice_Directly: string;
  gvMaintInvMngmntCU_GetInstallmAmntByDate_Rec: string;
  gvMaintInvMngmntCU_GetInstallmAmntLCYByDate_Rec: string;
  Description: string;
  Invoicing_via_Collective_List: string;
  Invoice_Period: string;
  Chargeable: string;
  Invoiced_Price: string;
  Invoice_in_Process: string;
  Credit_Memo_in_Process: string;
  InvoicePayment: string;
  Global_Dimension_1_Code: string;
  Customer_No: string;
  Bill_to_Customer_No: string;
}

const mapWSEntities = (wsResul: WSResult): ServiceContractTermCreateInput => ({
  serviceContractCode: wsResul.Service_Contract_No,
  lineNo: parseInt(wsResul.Line_No),
  invoiceFrom: wsResul.Invoice_From,
  endingDate: wsResul.Ending_Date,
  invoicedUntil: wsResul.Invoiced_Until,
  invoiceInterval: wsResul.Invoice_Interval,
  invoicePostponePeriod: wsResul.Invoice_Postpone_Period,
  nextInvoicingDate: wsResul.NextInvoicingDate,
  progressPercent: parseFloat(wsResul.Progress_Percent),
  gvMaintInvMngmntCUGetContractCurrencyServiceContractCode:
    wsResul.gvMaintInvMngmntCU_GetContractCurrency_Service_Contract_No,
  invoiceDirectly: wsResul.Invoice_Directly === "true",
  gvMaintInvMngmntCUGetInstallmAmntByDateRec:
    wsResul.gvMaintInvMngmntCU_GetInstallmAmntByDate_Rec,
  gvMaintInvMngmntCUGetInstallmAmntLCYByDateRec:
    wsResul.gvMaintInvMngmntCU_GetInstallmAmntLCYByDate_Rec,
  description: wsResul.Description,
  invoicingVIACollectiveList: wsResul.Invoicing_via_Collective_List,
  invoicePeriod: wsResul.Invoice_Period as ContractInvoicePeriod,
  chargeable: wsResul.Chargeable === "true",
  invoicedPrice: parseFloat(wsResul.Invoiced_Price),
  invoiceInProcess: parseInt(wsResul.Invoice_in_Process),
  creditMemoInProcess: parseInt(wsResul.Credit_Memo_in_Process),
  invoicePayment: parseFloat(wsResul.InvoicePayment),
  globalDimension1Code: wsResul.Global_Dimension_1_Code,
  customerCode: wsResul.Customer_No,
  billToCustomerCode: wsResul.Bill_to_Customer_No
});

export const syncServiceContractTerms = async (
  prisma: Prisma,
  filters = {}
) => {
  console.log("Started serviceContractTerms sync...");
  console.time("syncServiceContractTerms");

  const total = await getDataRecursively(
    WEBSERVICE_PAGES.SERVICE_CONTRACT_TERMS,
    DEFAULT_COMPANY_NAME,
    async data => {
      try {
        const serviceContractTerms: ServiceContractTermCreateInput[] = (data as WSResult[]).map(
          entity => mapWSEntities(entity)
        );

        console.time("createServiceContractTerm");

        const tasks = serviceContractTerms.map(async entity => {
          try {
            await wait(100);
            const res = await prisma.createServiceContractTerm(entity);
            return res.id;
          } catch (e) {
            console.error(e.message);
            return null;
          }
        });

        await Promise.all(tasks);

        console.timeEnd("createServiceContractTerm");
      } catch (e) {
        console.error(e.message);
      }
    },
    filters
  );

  console.timeEnd("syncServiceContractTerms");
  console.log("Sync serviceContractTerms ended. Total:", total);

  return total;
};
