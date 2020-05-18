import { Context } from "../";

export default {
  ServiceOrder: {
    __resolveReference: async (parent, context: Context, info) => {
      try {
        if (parent.id) {
          return await context.prismaBindings.query.serviceOrder({
            where: { id: parent.id }
          }, info);
        } else if (parent.code) {
          return await context.prismaBindings.query.serviceOrder({
            where: { code: parent.code }
          }, info);
        } else {
          console.log("__resolveReference for ServiceOrder handles only 'ID' and 'code' fields");
          return null;
        }

      } catch (e) {
        console.error(e.message);
        return null;
      }
    },

    serviceLocation: async (parent, args, context: Context, info) => {
      if (parent.serviceLocationCode) {
        return { __typename: "Address", code: parent.serviceLocationCode };
      }

      const serviceOrder = await context.prismaClient.serviceOrder({ id: parent.id });

      if (serviceOrder.serviceLocationCode) {
        return { __typename: "Address", code: serviceOrder.serviceLocationCode };
      }

      return null;
    },

    employee: async (parent, args, context: Context, info) => {
      if (parent.employeeCode) {
        return { __typename: "Employee", code: parent.employeeCode };
      }

      const serviceOrder = await context.prismaClient.serviceOrder({ id: parent.id });

      if (serviceOrder.employeeCode) {
        return { __typename: "Employee", code: serviceOrder.employeeCode };
      }

      return null;
    },

    owner: async (parent, args, context: Context, info) => {
      if (parent.ownerCode) {
        return { __typename: "Company", code: parent.ownerCode };
      }

      const serviceOrder = await context.prismaClient.serviceOrder({ id: parent.id });

      if (serviceOrder.ownerCode) {
        return { __typename: "Company", code: serviceOrder.ownerCode };
      }

      return null;
    },

    customer: async (parent, args, context: Context, info) => {
      if (parent.customerCode) {
        return { __typename: "Company", code: parent.customerCode };
      }

      const serviceOrder = await context.prismaClient.serviceOrder({ id: parent.id });

      if (serviceOrder.customerCode) {
        return { __typename: "Company", code: serviceOrder.customerCode };
      }

      return null;
    },

    complex: async (parent, args, context: Context, info) => {
      if (parent.complexCode) {
        return { __typename: "Complex", code: parent.complexCode };
      }

      const serviceOrder = await context.prismaClient.serviceOrder({ id: parent.id });

      if (serviceOrder.complexCode) {
        return { __typename: "Complex", code: serviceOrder.complexCode };
      }

      return null;
    },
  },

  WorkOrder: {
    customer: async (parent, args, context: Context, info) => {
      if (parent.customerCode) {
        return { __typename: "User", code: parent.customerCode };
      }

      const workOrder = await context.prismaClient.workOrder({ id: parent.id });

      if (workOrder.customerCode) {
        return { __typename: "User", code: workOrder.customerCode };
      }

      return null;
    },
    updateByUser: async (parent, args, context: Context, info) => {
      if (parent.updatedByUserId) {
        return { __typename: "User", id: parent.updatedByUserId };
      }

      const workOrder = await context.prismaClient.workOrder({ id: parent.id });

      if (workOrder.updatedByUserId) {
        return { __typename: "User", id: workOrder.updatedByUserId };
      }

      return null;
    },
    roofer: async (parent, args, context: Context, info) => {
      if (parent.resourceCode) {
        return { __typename: "RoofingCompanyEmployee", code: parent.resourceCode };
      }
      const workOrder = await context.prismaClient.workOrder({ id: parent.id });

      if (workOrder.customerCode) {
        return { __typename: "RoofingCompanyEmployee", code: workOrder.resourceCode };
      }
      return null;
    },
  },

  Project: {
    __resolveReference: async (parent, context: Context, info) => {
      try {
        if (parent.projectNumber) {
          return await context.prismaBindings.query.project({
            where: { projectNumber: parent.projectNumber }
          }, info);
        } else {
          console.log("__resolveReference for Project handles only 'projectNumber'");
          return null;
        }
      } catch (e) {
        console.error(e.message);
        return null;
      }
    },

    employee: async (parent, args, context: Context, info) => {
      if (parent.employeeCode) {
        return { __typename: "Employee", code: parent.employeeCode };
      }

      const project = await context.prismaClient.project({ id: parent.id });
      if (project.employeeCode) {
        return { __typename: "Employee", code: project.employeeCode };
      }

      return null;
    },
      projectManager: async (parent, args, context: Context, info) => {
        if (parent.projectManagerCode) {
            return { __typename: "Employee", code: parent.projectManagerCode };
        }

        const project = await context.prismaClient.project({ id: parent.id });
        if (project.projectManagerCode) {
            return { __typename: "Employee", code: project.projectManagerCode };
        }

        return null;
    },
    complex: async (parent, args, context: Context, info) => {
      if (parent.complexCode) {
        return { __typename: "Complex", code: parent.complexCode };
      }

      const project = await context.prismaClient.project({ id: parent.id });
      if (project.complexCode) {
        return { __typename: "Complex", code: project.complexCode };
      }

      return null;
    },
  },
  ServiceOrderComment: {
    author: async (parent, args, context: Context, info) => {
      if (parent.authorCode) {
        return { __typename: "CompanyEmployee", code: parent.authorCode };
      }

      const serviceOrderComment = await context.prismaClient.serviceOrderComment({ id: parent.id });

      if (serviceOrderComment.authorCode) {
        return { __typename: "CompanyEmployee", code: serviceOrderComment.authorCode };
      }

      return null;
    },
  }
}
