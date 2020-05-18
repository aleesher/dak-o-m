import * as _ from "lodash";
import { prisma } from "../../generated/prisma-client";

const calculateProjectField = {
  complexId(project) {
    return _.get(project, 'complex.id', '');
  },
};

export async function recalculateProject(project) {
  const data = {
    complexId: calculateProjectField.complexId(project),
  };

  return prisma.updateProject({
    where: {
      id: project.id
    },
    data,
  });
}

export const RECALCULATE_PROJECT_QUERY = `
  {
    id
    complex {
      id
    }
  }
`;
