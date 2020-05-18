import { gql } from 'apollo-server';
import { apolloClient } from "../lib/dakota-services-common/helpers/subscriptions/client";

const FETCH_NOTIFICATIONS = gql`
  query fetchNotifications( $updatedAt: String!, $actualReferencePoint: String! ){
    serviceOrderUpdateNotifications(where: { smsDeliveryStatus: $sent }){
      id
      linkToken
      smsText
      orderOwnerPhone
      startDate
      startTime
      orderTime
    }
  }
`;

const FETCH_OUTDATED_SO = gql`
  query fetchServiceOrders( $last48Hours: String!, $actualReferencePoint: String ){
    serviceOrders( where:{ createdAt_lt: $last48Hours, actualReferencePoint: $actualReferencePoint }){
      id
      ownerCode
      customerCode
      actualReferencePoint
    }
  }
`;

const FETCH_COMPANY_QUERY = gql`
  query fetchCompany( $code: String! ){
    company (where: { code: $code }) {
      id
      type
      name
      address
      city
      phone
      email
      visitAddress
    }
  }
`;

const FETCH_USER_QUERY = gql`
  query fetchUser( $id: String! ) {
    user (where: {id : $id}) {
      id
      code
      email
      firstName
      lastName
      phone
      mobilePhone
      email
      username
    }
  }
`;

const FETCH_ROOF_ACTIVITIES = gql`
  query activities($serviceOrderCode: String!) {
    roofActivities(where: { serviceOrderCode: $serviceOrderCode }) {
      id
      roofActivityId
      roofCode
      roof {
        id
        code
        roofName
        roofRoofingParts{
          id
          roofingPart{
            id
            description
          }
        }
      }
      roofDefects {
        id
        roofingPartCode
        defect {
          id
          description
        }
        measure {
          id
          description
        }
        unit
        size
        cause
        type
        photoBefore
        photoAfter
      }
    }
  }
`;

const FIND_CORRECTIVE_MAINTENANCE = gql`
  query correctives($roofActivityId: String) {
    roofCorrectiveMaintenances(where: { roofActivityId: $roofActivityId }) {
      id
    }
  }
`;

export const getCompany = async (code: String) => {
  const {
    data: { company }
  } = await apolloClient.query({
    query: FETCH_COMPANY_QUERY,
    variables: { code },
    fetchPolicy: "no-cache"
  });

  return company
};

export const getUser = async (id: String) => {
  const {
    data: { user }
  } = await apolloClient.query({
    query: FETCH_USER_QUERY,
    variables: { id },
    fetchPolicy: "no-cache"
  });

  return user
};

export const getRoofActivities = async (serviceOrderCode: String) => {
  const {
    data: { roofActivities }
  } = await apolloClient.query({
    query: FETCH_ROOF_ACTIVITIES,
    variables: { serviceOrderCode },
    fetchPolicy: "no-cache"
  });

  return roofActivities
};

export const getCorrectiveMaintenances = async (roofActivityId: String) => {
  const {
    data: { roofCorrectiveMaintenances }
  } = await apolloClient.query({
    query: FIND_CORRECTIVE_MAINTENANCE,
    variables: { roofActivityId },
    fetchPolicy: "no-cache"
  });

  return roofCorrectiveMaintenances
};

export const getServiceOrderNotifications = async (sent: Boolean) => {
  const {
    data: { serviceOrderUpdateNotifications }
  } = await apolloClient.query({
    query: FETCH_NOTIFICATIONS,
    variables: { sent },
    fetchPolicy: "no-cache"
  });

  return serviceOrderUpdateNotifications
};

export const getOutdatedSOs = async (last48Hours: String, actualReferencePoint: String) => {
  const {
    data: { serviceOrders }
  } = await apolloClient.query({
    query: FETCH_OUTDATED_SO,
    variables: { last48Hours, actualReferencePoint },
    fetchPolicy: "no-cache"
  });

  return serviceOrders
};
