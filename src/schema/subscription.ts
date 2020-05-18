import { gql } from "apollo-server-express";

const schema = gql( /* GraphQL */`

extend type Subscription {

}

`);

export default schema;
