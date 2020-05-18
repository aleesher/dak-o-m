import { Context } from "../../";
import { syncProjectPercentageDone, syncProjects } from "../../helpers/webservices";

export const projectMutations = {
  updateProjectPercentageDone: async (parent, args, context: Context, info) => {
    const { projectNumber, percentageDone } = args;
    const project = await context.prismaClient.project({ projectNumber }).$fragment(`{
      id
    }`) as any;

    if (!project) {
      throw Error(`Project with number: ${projectNumber} is not found`);
    }

    const wsProject = await syncProjectPercentageDone(projectNumber, percentageDone);

    if (wsProject && wsProject.length) {
      return await context.prismaBindings.mutation.updateProject({
          where: { projectNumber },
          data: {
            percentageDone,
            percentageDoneDate: wsProject[0].percentageDoneDate,
          }
      }, info);
    } else {
      throw Error(`Failed to update project with number: ${projectNumber}. Please, try again`);
    }
  }
}

export const projectQueries = {
  refetchProjects: async (parent, args, context: Context, info) => {
    const { costCenterCode } = args;

    await syncProjects(context.prismaClient, {
      Vestiging: costCenterCode,
    });

    return await context.prismaBindings.query.projects({
      where: { location: costCenterCode }
    }, info);
  }
};
