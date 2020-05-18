import _ = require('lodash');
import { gql } from 'apollo-server';
import { ORDER_STATUSES } from "../../constants";
import { filterByOwner } from "../../lib/dakota-services-common/helpers/common";
import * as moment from "moment";
import { prisma } from "../../generated/prisma-client";
import  { apolloClient } from "../../lib/dakota-services-common/helpers/subscriptions/client";
import { DEFAULT_CUSTOMER_NAME } from "../../constants"

async function totalCostOfServiceOrdersByTypes(parent, args, context, info) {
  let { where } = filterByOwner(args, context);

  const startDate = moment().year(where.year).startOf('year').toJSON();
  const endDate = moment().year(where.year).endOf('year').toJSON();

  where = {
    ..._.omit(where, ['year']),
    creationDate_gte: startDate,
    creationDate_lt: endDate,
  };

  const serviceOrders = await prisma.serviceOrders({ where }).$fragment(`{
    id
    orderType
    invoicedPrice
  }`);

  const ordersByType = _.groupBy(serviceOrders, 'orderType');

  const data = [];

  for (const orderType of Object.keys(ordersByType)) {
    const orders = ordersByType[orderType];
    const cost = orders.reduce((sum, o) => sum + o.invoicedPrice, 0);

    data.push({
      orderType,
      amount: orders.length,
      cost
    })
  }

  return data;
}

async function historicalCostsOfServiceOrders(parent, args, context, info) {
  const { where } = filterByOwner(args, context);

  let serviceOrders = [];

  try {
    const data = await apolloClient.query({
      query: gql`
        query serviceOrders($where: ServiceOrderWhereInput) {
          serviceOrders(
            where: $where
          ) {
            id
            orderType
            complex {
              code
              amountOfRoofs
              amountOfVHE
              roofSurface
            }
            invoicedPrice
            creationDate
          }
        }
      `,
      variables: {
        where
      },
      fetchPolicy: "no-cache"
    });
    serviceOrders = _.get(data, 'data.serviceOrders');
  } catch (e) {
    console.log(e);
  }

  const allServiceOrders = serviceOrders.map(so => ({
    ...so,
    year: moment(so.creationDate).year()
  }));

  const ordersByYear = _.groupBy(allServiceOrders, 'year');

  const rows = [];

  const sortedYears = Object.keys(ordersByYear).sort();

  for (const year of sortedYears) {
    const orders = ordersByYear[year];

    const complexes = orders.map(o => o.complex).filter(c => !!c);
    const uniqComplexes = _.uniqBy(complexes, 'code');
    const amountOfRoofs = uniqComplexes.reduce((acc, c) => acc + _.get(c, 'amountOfRoofs', 0), 0);
    const amountOfVHE = uniqComplexes.reduce((acc, c) => acc + _.get(c, 'amountOfVHE', 0), 0);
    const totalRoofSurface = uniqComplexes.reduce((acc, c) => acc + _.get(c, 'roofSurface', 0), 0);
    const totalCost = orders.reduce((sum, o) => sum + _.get(o, 'invoicedPrice', 0), 0);
    const costPerM2 = (totalCost === 0 || totalRoofSurface === 0) ? 0 : totalCost / totalRoofSurface;
    const costPerVHE = (amountOfVHE === 0 || amountOfVHE === 0 ) ? 0 :totalCost / amountOfVHE;

    rows.push({
      year,
      amountOfComplexes: uniqComplexes.length,
      amountOfRoofs,
      amountOfVHE,
      totalRoofSurface,
      totalCost,
      costPerM2,
      costPerVHE
    })
  }

  return rows;
}

async function leakagesPerYear(parent, args, context, info) {
  let { where } = filterByOwner(args, context);

  const leakages = await prisma.serviceOrders({
    where: {
      ...where,
      orderType: "LEKKAGE",
    }
  }).$fragment(`{
    id
    creationDate
    roofTypeCode
    roofIsAGutter
  }`) as any[];

  const allLeakages = leakages.map(so => ({
    ...so,
    year: moment(so.creationDate).year()
  }));

  const leakagesByYear = _.groupBy(allLeakages, 'year');

  const sortedYears = Object.keys(leakagesByYear).sort();

  const flat = [];
  const sloped = [];
  const gutter = [];

  for (const year of sortedYears) {
    const yearLeakages = leakagesByYear[year];

    const flatLeakages = yearLeakages.filter(l => l.roofIsAGutter === false && l.roofTypeCode === 'flat');
    const slopedLeakages = yearLeakages.filter(l => l.roofIsAGutter === false && l.roofTypeCode === 'sloped');
    const gutterLeakages = yearLeakages.filter(l => l.roofIsAGutter === true);

    flat.push(flatLeakages.length);
    sloped.push(slopedLeakages.length);
    gutter.push(gutterLeakages.length);
  }

  const total = flat.map((v, i) => v + sloped[i] + gutter[i]);

  return {
    years: sortedYears,
    flat,
    sloped,
    gutter,
    total
  };
}

async function leakagesPerThreeMonths(parent, args, context, info) {
  const leakages = await prisma.serviceOrders({
    where: {
      ...args.where,
      orderType: "LEKKAGE",
    }
  }).$fragment(`{
    id
    creationDate
    roofWarranty
  }`) as any[];

  const leakagePerThreeMonths = leakages.filter(({ creationDate }) => {
    const diff = moment().diff(moment(creationDate), 'months', true);
    return diff <= 3;
  });

  const roofWarranty = !leakages.some(({ roofWarranty }) => !roofWarranty);

  return {
    allLeakagesCount: leakages.length,
    leakagePerThreeMonthsCount: leakagePerThreeMonths.length,
    roofWarranty
  }
}

async function amountOfServiceOrdersByCustomers(parent, args, context, info) {
  const { where, limit } = args;
  const allServiceOrders = await prisma.serviceOrders({ where }).$fragment(`{
    status
    customerCode
  }`);

  const byCustomer = _.groupBy(allServiceOrders, "customerCode");

  const data = await apolloClient.query({
    query: gql`
      query companies($where: CompanyWhereInput, $first: Int) {
        companies(
          where: $where,
          first: $first
        ) {
          customer
          name
        }
      }
    `,
    variables: {
      where: {
        customer_in: where.customerCode_in,
      },
      first: limit
    },
    fetchPolicy: "no-cache"
  });
  const companies = _.get(data, 'data.companies');
  
  const rows = [];
  const totalRow = {
    name: "TOTAAL",
    ..._.fromPairs(ORDER_STATUSES.map(s => [s, 0])) // set initial values - { Open: 0, In_Process: 0, ...
  };

  _.keys(byCustomer).slice(0, limit).forEach(customerCode => {
    const customerServiceOrders = byCustomer[customerCode] || [];
    const company = companies.find(c => c.customer === customerCode);

    const customerData = {
      name: company ? company.name : customerCode,
      customerCode
    };

    ORDER_STATUSES.forEach(status => {
      const serviceOrders = customerServiceOrders.filter(
        o => o.status === status
      );
      customerData[status] = serviceOrders.length || "";
      totalRow[status] += serviceOrders.length;
    });

    rows.push(customerData);
  });

  return {
    rows,
    totalRow
  };
}

async function amountOfServiceOrdersByEmployees(parent, args, context, info) {
  const { where, limit } = args;
  const allServiceOrders = await prisma.serviceOrders({ where }).$fragment(`{
    status
    employeeCode
  }`);

  const byEmployee = _.groupBy(allServiceOrders, "employeeCode");

  const data = await apolloClient.query({
    query: gql`
      query resources($where: ResourceWhereInput, $first: Int) {
        resources(
          where: $where,
          first: $first
        ) {
          code
          name
        }
      }
    `,
    variables: {
      where: {
        code_in: where.employeeCode_in,
        // type: "Plant"
      },
      first: limit
    },
    fetchPolicy: "no-cache"
  });
  const employees = _.get(data, 'data.resources');

  const rows = [];
  const totalRow = {
    name: "TOTAAL",
    ..._.fromPairs(ORDER_STATUSES.map(s => [s, 0])) // set initial values - { Open: 0, In_Process: 0, ...
  };

  _.keys(byEmployee).slice(0, limit).forEach(employeeCode => {
    const employeeServiceOrders = byEmployee[employeeCode];
    const employee = employees.find(e => e.code === employeeCode);

    const employeeData = {
      name: employee ? employee.name : DEFAULT_CUSTOMER_NAME,
      employeeCode
    };

    ORDER_STATUSES.forEach(status => {
      const serviceOrders = employeeServiceOrders.filter(
        o => o.status === status
      );
      employeeData[status] = serviceOrders.length || "";
      totalRow[status] += serviceOrders.length;
    });

    rows.push(employeeData);
  });

  return {
    rows,
    totalRow
  };
}

export const serviceOrderQueries = {
  totalCostOfServiceOrdersByTypes,
  historicalCostsOfServiceOrders,
  leakagesPerYear,
  leakagesPerThreeMonths,
  amountOfServiceOrdersByCustomers,
  amountOfServiceOrdersByEmployees
};
