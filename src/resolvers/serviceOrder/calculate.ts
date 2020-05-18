import * as _ from "lodash";
import { prisma } from "../../generated/prisma-client";

const calculateServiceOrderField = {
  complexId(serviceOrder) {
    return _.get(serviceOrder, 'serviceLocation.subComplex.complex.id', '');
  },

  complexCode(serviceOrder) {
    return _.get(serviceOrder, 'serviceLocation.subComplex.complex.code', '');
  },

  complexName(serviceOrder) {
    return _.get(serviceOrder, 'serviceLocation.subComplex.complex.name', '');
  },

  subComplexCode(serviceOrder) {
    return _.get(serviceOrder, 'serviceLocation.subComplex.code', '');
  },

  subComplexName(serviceOrder) {
    return _.get(serviceOrder, 'serviceLocation.subComplex.name', '');
  },

  roofCode(serviceOrder) {
    return _.get(serviceOrder, 'roofActivities.0.roofCode', '');
  },

  workType(serviceOrder) {
    return _.get(serviceOrder, 'roofActivities.0.workType', '');
  },

  statusReasonDescription(serviceOrder) {
    const workOrders = _.get(serviceOrder, 'workOrders', []);
    if (workOrders.length > 0) {
      const workOrder = workOrders.find(o => o.isMainResource);
      return workOrder ? workOrder.statusReasonDescription : '';
    }

    return '';
  },

  readyDateNew(serviceOrder) {
    return _.get(serviceOrder, 'roofActivities.0.readyDateNew', '');
  },

  roofPartnerName(serviceOrder) {
    return _.get(serviceOrder, 'serviceLocation.subComplex.complex.roofPartnerName', '');
  },

  roofPartner(serviceOrder) {
    return _.get(serviceOrder, 'serviceLocation.subComplex.complex.roofPartner', '');
  },

  roofWarranty(serviceOrder) {
    return _.get(serviceOrder, 'roofActivities.0.roof.warranty', false);
  },

  roofIsAGutter(serviceOrder) {
    const thisRoofIsAGutter = _.get(serviceOrder, 'roofActivities.0.roof.thisRoofIsAGutter');
    return thisRoofIsAGutter === 'YES';
  },

  amountOfMeasures(serviceOrder) {
    const roofActivities = _.get(serviceOrder, 'roofActivities', []);
    const roofDefects = _.flatMap(roofActivities, 'roofDefects');
    const measures = _.map(roofDefects, 'measure');
    return _.compact(measures).length;
  },

  roofingPartDescription(serviceOrder) {
    return _.get(serviceOrder, 'roofActivities.0.roofDefects.0.roofingPart.description', '');
  },

  cause(serviceOrder) {
    return _.get(serviceOrder, 'roofActivities.0.roofDefects.0.cause', '');
  },

  measureDescription(serviceOrder) {
    return _.get(serviceOrder, 'roofActivities.0.roofDefects.0.measure.description', '');
  },

  consequentialDamageIndoor(serviceOrder) {
    return _.get(serviceOrder, 'roofActivities.0.roofDefects.0.cause', '');
  },

  roofTypeCode(serviceOrder) {
    return _.get(serviceOrder, 'roofActivities.0.roof.roofType.code', '');
  },

  condition(serviceOrder) {
    return _.get(serviceOrder, 'roofActivities.0.roof.condition', null);
  },

  roofingPartCodes(serviceOrder) {
    const roofingParts = _.flatMap(serviceOrder.roofActivities, ({ roofDefects = [] }) => roofDefects.map(rd => _.get(rd, "roofingPart.code")));
    return _.uniq(roofingParts).join(",");
  },

  roofingPartCategories(serviceOrder) {
    const categories = _.flatMap(serviceOrder.roofActivities, ({ roofDefects = [] }) => roofDefects.map(rd => _.get(rd, "roofingPart.category.code")));
    return _.uniq(categories).join(",");
  },

  roofNumber(serviceOrder) {
    return _.get(serviceOrder, 'roofActivities.0.roof.roofNumber', '');
  },
};

export async function recalculateServiceOrder(serviceOrder) {
  const data = {
    complexId: calculateServiceOrderField.complexId(serviceOrder),
    complexCode: calculateServiceOrderField.complexCode(serviceOrder),
    complexName: calculateServiceOrderField.complexName(serviceOrder),
    subComplexCode: calculateServiceOrderField.subComplexCode(serviceOrder),
    subComplexName: calculateServiceOrderField.subComplexName(serviceOrder),
    roofCode: calculateServiceOrderField.roofCode(serviceOrder),
    workType: calculateServiceOrderField.workType(serviceOrder),
    statusReasonDescription: calculateServiceOrderField.statusReasonDescription(serviceOrder),
    readyDateNew: calculateServiceOrderField.readyDateNew(serviceOrder),
    roofPartner: calculateServiceOrderField.roofPartner(serviceOrder),
    roofPartnerName: calculateServiceOrderField.roofPartnerName(serviceOrder),
    roofIsAGutter: calculateServiceOrderField.roofIsAGutter(serviceOrder),
    roofWarranty: calculateServiceOrderField.roofWarranty(serviceOrder),
    amountOfMeasures: calculateServiceOrderField.amountOfMeasures(serviceOrder),
    roofingPartDescription: calculateServiceOrderField.roofingPartDescription(serviceOrder),
    cause: calculateServiceOrderField.cause(serviceOrder),
    measureDescription: calculateServiceOrderField.measureDescription(serviceOrder),
    consequentialDamageIndoor: calculateServiceOrderField.consequentialDamageIndoor(serviceOrder),
    roofTypeCode: calculateServiceOrderField.roofTypeCode(serviceOrder),
    condition: calculateServiceOrderField.condition(serviceOrder),
    roofingPartCodes: calculateServiceOrderField.roofingPartCodes(serviceOrder),
    roofingPartCategories: calculateServiceOrderField.roofingPartCategories(serviceOrder),
    roofNumber: calculateServiceOrderField.roofNumber(serviceOrder),
  };

  return prisma.updateServiceOrder({
    where: {
      id: serviceOrder.id
    },
    data,
  });
}

export const RECALCULATE_SERVICE_ORDER = `
  {
    id
    serviceLocationCode
    serviceLocation {
      subComplex {
        code
        name
        complex {
          id
          code
          name
          roofPartner
          roofPartnerName
          isInPortfolio
          isFlagged
        }
      }
    }
    roofActivities {
      roofCode
      workType
      roof {
        roofNumber
        roofType {
          code
        }
        condition
        warranty
        thisRoofIsAGutter
      }
      roofDefects {
        id
        measureCode
        measure {
          id
          description
        }
        roofingPart {
          code
          description
          category {
            code
          }
        }
        cause
        consequentialDamageIndoor
      }
      readyDateNew
    }
    workOrders {
      isMainResource
      statusReasonDescription
    }
  }
`;
