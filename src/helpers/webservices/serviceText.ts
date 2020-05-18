import { Prisma, ServiceTextCreateInput } from "../../generated/prisma-client";
import { getDataRecursively } from "../../lib/dakota-services-common/helpers/webservices";
import { WEBSERVICE_PAGES, DEFAULT_COMPANY_NAME } from "./constants";
import { wait } from "..";

interface WSResult {
  Key: string,
  Table_Name: string,
  No: string,
  Soort: string,
  Line_No: string,
  Date: string,
  Comment: string,
  Maker: string,
  Created_by_Employee_No: string, // Not used
}

const mapWSEntities = (wsResul: WSResult): ServiceTextCreateInput => ({
  tableName: wsResul.Table_Name,
  code: wsResul.No,
  type: wsResul.Soort,
  lineNumber: parseInt(wsResul.Line_No),
  date: wsResul.Date,
  comment: wsResul.Comment,
  createdBy: wsResul.Maker,
});

export const syncServiceTexts = async (prisma: Prisma, filters = {}) => {
  console.log("Started serviceTexts sync...");
  console.time('syncServiceTexts');

  const total = await getDataRecursively(
    WEBSERVICE_PAGES.SERVICE_TEXT,
    DEFAULT_COMPANY_NAME,
    async (data) => {
      const serviceTexts: ServiceTextCreateInput[] = (data as WSResult[]).map(
        (entity) => mapWSEntities(entity)
      );

      console.time('createServiceText');

      const tasks = serviceTexts.map(async (entity) => {
        try {
          await wait(100);
          const res = await prisma.createServiceText(entity);
          return res.id;
        } catch(e) {
          console.error(e.message);
          return null;
        }
      });

      await Promise.all(tasks);

      console.timeEnd('createServiceText');
    },
    filters,
  );

  console.timeEnd('syncServiceTexts');
  console.log("Sync serviceTexts ended. Total:", total);

  return total;
}
