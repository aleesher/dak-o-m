import { gql } from 'apollo-server';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080/graphql';
const TOKEN = process.env.GATEWAY_TOKEN;

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: GATEWAY_URL,
  credentials: 'same-origin',
  headers: {
    authorization: `Bearer ${TOKEN}`
  },
});

export const apolloClient = new ApolloClient({
  // Provide required constructor fields
  cache: cache,
  link: link,

  // Provide some optional constructor fields
  name: 'react-web-client',
  version: '1.3',
  queryDeduplication: false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

const PUBLISH_EVENT_MUTATION = gql`
  mutation publishDakdataEvent($name: String!, $data: DefaultEventPayloadInput!) {
    publishDakdataEvent(name: $name, data: $data)
  }
`;

const client = {
  publishEvent: async (name: string, data: any) => {
    await apolloClient.mutate({
      mutation: PUBLISH_EVENT_MUTATION,
      variables: {
        name,
        data
      }
    })
  },
};

export default client;
