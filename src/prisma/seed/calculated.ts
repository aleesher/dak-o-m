import * as _ from "lodash";
import gql from "graphql-tag";
import { Prisma } from "../../generated/prisma-client";
import { apolloClient } from "../../lib/dakota-services-common/helpers/subscriptions/client";

import { RECALCULATE_SERVICE_ORDER, recalculateServiceOrder } from "../../resolvers/serviceOrder/calculate";
import { RECALCULATE_PROJECT_QUERY, recalculateProject } from "../../resolvers/project/calculate";

/**
  |--------------------------------------------------
  | pre-calculated fields
  |--------------------------------------------------
*/
export const syncCalculatedFields = async (prisma: Prisma) => {

  const serviceOrdersAggregate = await prisma.serviceOrdersConnection().$fragment(`{
    aggregate { count }
  }`);

  const serviceOrdersCount = _.get(serviceOrdersAggregate, 'aggregate.count', 0);
  for (let i = 0; i < serviceOrdersCount; i += 100) {
    console.log('Getting first servicesOrders:', i + 100);

    const res = await apolloClient.query({
      query:  gql`{
        serviceOrders(
          first: 100,
          skip: ${i}
        ) ${RECALCULATE_SERVICE_ORDER}
      }`
    });

    const tasks = res.data.serviceOrders.map(async serviceOrder => {
      try {
        await recalculateServiceOrder(serviceOrder);
      } catch(e) {
        console.error(e.message);
      }
    });

    await Promise.all(tasks);
  }


  const projectsAggregate = await prisma.projectsConnection().$fragment(`{
    aggregate { count }
  }`);

  const projectsCount = _.get(projectsAggregate, 'aggregate.count', 0);
  for (let i = 0; i < projectsCount; i += 100) {
    console.log('Getting first projects:', i + 100, 'Total:', projectsCount);

    const res = await apolloClient.query({
      query:  gql`{
        projects(
          first: 100,
          skip: ${i}
        ) ${RECALCULATE_PROJECT_QUERY}
      }`
    });

    const tasks = res.data.projects.map(async project => {
      try {
        await recalculateProject(project);
      } catch(e) {
        console.error(e.message);
      }
    });

    await Promise.all(tasks);
  }
}
