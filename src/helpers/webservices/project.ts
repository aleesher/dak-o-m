import { Prisma, ProjectCreateInput, ProjectUpdateInput } from "../../generated/prisma-client";
import { getDataRecursively, updateDataInWS, getDataFromWS } from "../../lib/dakota-services-common/helpers/webservices";
import { importFile } from "../../lib/dakota-services-common/helpers/file";
import { WEBSERVICE_PAGES, DEFAULT_COMPANY_NAME } from "./constants";
import { wait } from "..";

type ReportIsNecessary =
  "NietNodig" |
  "WilIkHebben" |
  "LooptAchter";

interface WSResult {
  Key: string,
  ProjectNr: string,
  Vestiging: string,
  ProjectleidersCode: string,
  ProjectleidersNaam: string,
  HoofdProject: string,
  Omschrijving: string,
  Aanneemsom: string,
  AanvullendTotaalBedrag: string,
  PercentageGereed: string,
  PercentageGereedDatum: string,
  PercentageGereedOndergrens: string,
  Adres: string,
  Plaats: string,
  ComplexAanzichtsFotoDocumentNo: string,
  ComplexIsAanwezig: string,
  Complexnummer: string,
  Complexnaam: string,
  Besteed: string,
  BesteedVSBegroot: string,
  BonBedrag: string,
  BonIsNodig: string,
  Gefactureerd: string,
  IkWilKwaliteitsMeting: string,
  IkWilVoortgangsVerslag: string,
  IkWilOpleveringsRapport: string,
  KwaliteitsMetingAllesIsIngevul: string,
  VoortgangsVerslagAllesIsIngevu: string,
  OpleveringsRapportAllesIsIngev: string,
  AanvullendWerkOmschr1: string,
  AanvullendWerkBedrag1: string,
  AanvullendWerkOmschr2: string,
  AanvullendWerkBedrag2: string,
  AanvullendWerkOmschr3: string,
  AanvullendWerkBedrag3: string,
  AanvullendWerkOmschr4: string,
  AanvullendWerkBedrag4: string,
  AanvullendWerkOmschr5: string,
  AanvullendWerkBedrag5: string,
  AanvullendWerkOmschr6: string,
  AanvullendWerkBedrag6: string,
  KwaliteitsmetingDocumentNo: string,
  VoortgangsverslagDocumentNo: string,
  OpleveringsrapportDocumentNo: string,
  VerwachteStartDatum: string,
  VerwachteEindDatum: string,
  BegroteUren: string,
  AantalDagen: string,
  AantalUurWerkbegroting: string,
  NaamOnderaanemer: string,
  ProjectMemo: string
}

const mapWSEntities = (wsResul: WSResult): ProjectUpdateInput => ({
  projectNumber: wsResul.ProjectNr,
  location: wsResul.Vestiging,
  employeeCode: wsResul.ProjectleidersCode,
  employeeName: wsResul.ProjectleidersNaam,
  description: wsResul.Omschrijving,
  mainProject: wsResul.HoofdProject,
  contractValue: parseFloat(wsResul.Aanneemsom),
  additionalTotalAmount: parseFloat(wsResul.AanvullendTotaalBedrag),
  percentageDone: parseInt(wsResul.PercentageGereed),
  percentageDoneDate: wsResul.PercentageGereedDatum,
  percentageDoneMinValue: parseInt(wsResul.PercentageGereedOndergrens),
  address: wsResul.Adres,
  city: wsResul.Plaats,
  complexPhotoNo: wsResul.ComplexAanzichtsFotoDocumentNo,
  complexExists: wsResul.ComplexIsAanwezig === "true",
  complexName: wsResul.Complexnaam,
  amountSpent: parseFloat(wsResul.Besteed),
  spentVsBudgetted: parseInt(wsResul.BesteedVSBegroot),
  amountOnReceipt: parseFloat(wsResul.BonBedrag),
  receiptIsNecessary: wsResul.BonIsNodig === "true",
  invoiced: parseFloat(wsResul.Gefactureerd),
  qualityMeasurementIsNecessary: wsResul.IkWilKwaliteitsMeting as ReportIsNecessary,
  progressReportIsNecessary: wsResul.IkWilVoortgangsVerslag as ReportIsNecessary,
  deliveryReportIsNecessary: wsResul.IkWilOpleveringsRapport as ReportIsNecessary,
  qualityMeasurementIsComplete: wsResul.KwaliteitsMetingAllesIsIngevul === "true",
  progressReportIsComplete: wsResul.VoortgangsVerslagAllesIsIngevu === "true",
  deliveryReportIsComplete: wsResul.OpleveringsRapportAllesIsIngev === "true",
  additionalWorkDescription1: wsResul.AanvullendWerkOmschr1,
  additionalWorkAmount1: parseFloat(wsResul.AanvullendWerkBedrag1),
  additionalWorkDescription2: wsResul.AanvullendWerkOmschr2,
  additionalWorkAmount2: parseFloat(wsResul.AanvullendWerkBedrag2),
  additionalWorkDescription3: wsResul.AanvullendWerkOmschr3,
  additionalWorkAmount3: parseFloat(wsResul.AanvullendWerkBedrag3),
  additionalWorkDescription4: wsResul.AanvullendWerkOmschr4,
  additionalWorkAmount4: parseFloat(wsResul.AanvullendWerkBedrag4),
  additionalWorkDescription5: wsResul.AanvullendWerkOmschr5,
  additionalWorkAmount5: parseFloat(wsResul.AanvullendWerkBedrag5),
  additionalWorkDescription6: wsResul.AanvullendWerkOmschr6,
  additionalWorkAmount6: parseFloat(wsResul.AanvullendWerkBedrag6),
  qualityMeasurementDocumentNo: wsResul.KwaliteitsmetingDocumentNo,
  progressReportDocumentNo: wsResul.VoortgangsverslagDocumentNo,
  deliveryReportDocumentNo: wsResul.OpleveringsrapportDocumentNo,
  isMainProject: wsResul.ProjectNr === wsResul.HoofdProject,
  expectedStartDate: wsResul.VerwachteStartDatum,
  expectedEndDate: wsResul.VerwachteEindDatum,
  budgetHours: parseInt(wsResul.BegroteUren),
  numberOfDays: parseInt(wsResul.AantalDagen),
  numberOfHourlyWorkBudget: parseInt(wsResul.AantalUurWerkbegroting),
  subcontractorName: wsResul.NaamOnderaanemer,
  projectMemo: wsResul.ProjectMemo,
  isAppProject: true,
});

export const syncProjects = async (prisma: Prisma, filters = {}) => {
  console.log("Started projects sync...");
  console.time('syncProjects');
  const allProjects = await prisma.projects().$fragment(`{
    projectNumber
  }`) as any[];
  const allProjectNumbers = allProjects.map(project => project.projectNumber);

  const total = await getDataRecursively(
    WEBSERVICE_PAGES.PROJECT,
    DEFAULT_COMPANY_NAME,
    async (data) => {
      try  {
        let projects: ProjectUpdateInput[] = (data as WSResult[]).map(
          (entity) => mapWSEntities(entity)
        );

        const projectsToUpdate = projects.filter(project => allProjectNumbers.includes(project.projectNumber));

        const projectUpdate = projectsToUpdate.map(async (entity) => {
          try {
            await wait(100);
            const res = await prisma.updateProject({
              data: entity,
              where: {
                projectNumber: entity.projectNumber,
              }
            });
            return res;
          } catch(e) {
            console.error(e.message);
            return null;
          }
        });

        const updateList = await Promise.all(projectUpdate);

        const projectsToCreate = projects.filter(project => !allProjectNumbers.includes(project.projectNumber));

        console.time('createProject');

        const projectCreate = projectsToCreate.map(async (entity) => {
          try {
            await wait(100);
            const res = await prisma.createProject(entity as ProjectCreateInput);
            return res;
          } catch(e) {
            console.error(e.message);
            return null;
          }
        });

        const createList = await Promise.all(projectCreate);

        console.timeEnd('createProject');


        const list = [...updateList, ...createList];

        const updateTasks = list.filter(item => !!item).map(async (project) => {
          try {
            if(project.isMainProject) {
              const subProjectIds = list.reduce((acc, p) =>
                p.mainProject === project.projectNumber &&
                !p.isMainProject
                  ? [...acc, { id: p.id }] : acc, []);
              console.log(subProjectIds)
              if(!!subProjectIds.length) {
                const res = await prisma.updateProject({
                  data: {
                    subProjects: {
                      connect: subProjectIds
                    }
                  },
                  where: {
                    id: project.id,
                  },
                });
              }
            }
          } catch(e) {
            console.error(e.message);
            return null;
          }
        });

        console.log("Update tasks:", updateTasks.length);

        await Promise.all(updateTasks);
      } catch (e) {
        console.error(e.message);
      }
    },
    filters
  );

  console.timeEnd('syncProjects');
  console.log("Sync projects ended. Total:", total);

  return total;
}

export const syncProjectPercentageDone = async (projectNumber: string, percentageDone: number) => {
  const companyName = DEFAULT_COMPANY_NAME;

  // First, need to get the up-to-date project key from navision
  const wsData = await getDataFromWS(
    WEBSERVICE_PAGES.PROJECT,
    companyName,
    {
      ProjectNr: projectNumber
    },
  );

  if (!wsData || !wsData.length) {
    throw Error(`Project with number: ${projectNumber} in not found in Navision`);
  }

  // Then update. This will generate new key
  const result = await updateDataInWS(WEBSERVICE_PAGES.PROJECT, companyName, {
    DDProjectAppProjecten: {
      Key: wsData[0].Key,
      PercentageGereed: percentageDone.toString()
    },
  });
  return result.map(mapWSEntities);
}

export const syncProjectFiles = async (prisma: Prisma) => {
  const companyName = DEFAULT_COMPANY_NAME;

  const allProjects = await prisma.projects({
    where: {
      OR: [
        { qualityMeasurementDocumentNo_not: null },
        { deliveryReportDocumentNo_not: null },
        { progressReportDocumentNo_not: null },
        { complexPhotoNo_not: null },
      ]
    }
  }).$fragment(`{
    id
    qualityMeasurementDocumentNo
    deliveryReportDocumentNo
    progressReportDocumentNo
    complexPhotoNo
  }`) as any[];

  for (const project of allProjects) {
    try {
      const fileUrls = {};
      if (project.qualityMeasurementDocumentNo) {
        const key = await importFile(project.qualityMeasurementDocumentNo, companyName);
        fileUrls['qualityMeasurementDocumentUrl'] = key
        console.log('Uploaded file:', key);
      }
      if (project.deliveryReportDocumentNo) {
        const key = await importFile(project.deliveryReportDocumentNo, companyName);
        fileUrls['deliveryReportDocumentUrl'] = key
        console.log('Uploaded file:', key);
      }
      if (project.progressReportDocumentNo) {
        const key = await importFile(project.progressReportDocumentNo, companyName);
        fileUrls['progressReportDocumentUrl'] = key
        console.log('Uploaded file:', key);
      }
      if (project.complexPhotoNo) {
        const key = await importFile(project.complexPhotoNo, companyName);
        fileUrls['complexPhotoUrl'] = key
        console.log('Uploaded file:', key);
      }

      await prisma.updateProject({
        data: fileUrls,
        where: {
          id: project.id,
        },
      });
    } catch(e) {
      console.error(e.message);
    }
  }
}
