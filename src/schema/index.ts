import { gql } from "apollo-server-express";

import { typeDefs } from "../generated/prisma-client/prisma-schema";

// Remove Subscription type from the schema.
// Apollo federation does not support Subscription yet
let schema = typeDefs.replace(/(type Subscription(.+?)\})+/gs, "");

// Extend local entities
schema += `
  extend type Mutation {
    updateProjectPercentageDone(projectNumber: String!, percentageDone: Int): Project
    updateServiceOrderStatus(data: ServiceOrderUpdateStatusInput! where: ServiceOrderWhereUniqueInput!): ServiceOrder
    askQuestion(email: String!, name: String!, question: String!, linkToken: String!): AskQuestionResponse!
    lockEntityRecord(data: LockedEntityInput!, where: LockedEntityWhereInput!): LockedEntityType
    unlockEntityRecord(data: LockedEntityInput!, where: LockedEntityWhereInput!): LockedEntityType
    updateSeveralWorkOrders(orders: [WorkOrderUpdateInput!]!): Json
  }

  extend type Query {
    refetchProjects(costCenterCode: String!): [Project!]!
    serviceOrderUpdateNotificationJson(where: ServiceOrderUpdateNotificationUpdateInput): Json
    getRoofingPartnerNames: [String!]!
    totalCostOfServiceOrdersByTypes(where: TotalCostOfServiceOrdersByTypesWhereInput!): Json
    historicalCostsOfServiceOrders(where: FilterByRoofPartnerWhereInput): Json
    leakagesPerYear(where: FilterByRoofPartnerWhereInput): Json
    leakagesPerThreeMonths(where: ServiceOrderWhereInput): Json
    amountOfServiceOrdersByCustomers(where: ServiceOrderWhereInput, limit: Int): Json
    amountOfServiceOrdersByEmployees(where: ServiceOrderWhereInput, limit: Int): Json
    allServiceOrders(where: ServiceOrderWhereInput, orderBy: ServiceOrderOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ServiceOrder]
    allServiceContracts(where: ServiceContractWhereInput, orderBy: ServiceContractOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ServiceContract]

    seedOrderManagement: Json
    resetOrderManagement: Json
  }

  type AskQuestionResponse {
    sent: Boolean!
    message: String
  }

  input ServiceOrderUpdateStatusInput {
    actualReferencePoint: String!
  }
  
  input TotalCostOfServiceOrdersByTypesWhereInput {
    year: Int!,
    roofPartner: String
  }
  
  input FilterByRoofPartnerWhereInput {
    roofPartner: String
  }

  input LockedEntityInput {
    lockedBy: String!
    entityName: String!
  }

  input LockedEntityWhereInput {
    id: ID!
  }

  type LockedEntityType {
    id: ID!
    lockedBy: String
    isLocked: Boolean
  }
`;

// extend local entities
schema += `
  # Add @key for access from other services

  extend type ServiceOrder @key(fields: "code") {
    serviceLocation: Address
    employee: CompanyEmployee
    owner: Company
    customer: Company
    complex: Complex
  }

  extend type WorkOrder {
    customer: User
    updateByUser: User
    roofer: RoofingCompanyEmployee
  }

  extend type Project @key(fields: "projectNumber") {
    _external: Boolean
    complex: Complex
    projectManager: CompanyEmployee
  }

  extend type ServiceContract @key(fields: "code") {
    _external: Boolean
  }

  extend type ServiceOrderComment @key(fields: "id") {
    author: CompanyEmployee
  }
`;

/*
  Define dakdata stub types
 */
schema += `
  extend type Roof @key(fields: "code") {
    code: String! @external
  }

  extend type Address @key(fields: "code") {
    code: String! @external
  }

  extend type Complex @key(fields: "code") {
    code: String! @external
  }
`;

/*
  Define stamdata stub types
 */
schema += `
  extend type RoofingPart @key(fields: "code") {
    code: String! @external
  }

  extend type Measure @key(fields: "code") {
    code: String! @external
  }

  extend type Defect @key(fields: "code") {
    code: String! @external
  }
`;

/*
  Define account-management stub types
 */
schema += `
  extend type User @key(fields: "username") {
    username: String! @external
  }

  extend type CompanyEmployee @key(fields: "code") {
    code: String! @external
  }

  extend type Company @key(fields: "code") {
    code: String! @external
  }
  
  extend type RoofingCompanyEmployee @key(fields: "code") {
    code: String! @external
  }
`;

export default gql(schema);
