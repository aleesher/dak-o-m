import * as _ from "lodash";
import { gql } from 'apollo-server';

import { apolloClient } from "../subscriptions/client";

export enum DOCUMENT_TYPE {
    Image = "image",
    PDF = "pdf",
  };

export type TFileDocument = {
  url: string,
  type: string,
  isBlocked?: boolean,
  companyName: string
}

const CREATE_FILE_DOCUMENT = gql`
  mutation createNotification($data: FileDocumentCreateInput!) {
    createFileDocument(data: $data) {
      id
      url
    }
  }
`;

const UPDATE_FILE_DOCUMENT = gql`
  mutation updateDoc($data: FileDocumentUpdateInput!, $where: FileDocumentWhereUniqueInput!){
    updateFileDocument(where: $where, data: $data){
      id
      url
    }
  }
`;

const GET_FILE_DOCUMENT = gql`
  query fileDocument($where: FileDocumentWhereUniqueInput!){
    fileDocument(where: $where){
      id
      url
      type
      isBlocked
      companyName
    }
  }
`;

export const createFileDocument = async (file: TFileDocument) => {

  var document = await apolloClient.query({
    query: GET_FILE_DOCUMENT,
    variables: {
      where: {
        url: file.url
      },
    }
  });

  if(!_.isEmpty(document.data.fileDocument)){
    return document.data.fileDocument;
  }
  
  if(!_.isBoolean(file.isBlocked))
    file.isBlocked = false;

  const res = await apolloClient.mutate({
    mutation: CREATE_FILE_DOCUMENT,
    variables: {
        data: file,
    }
  });

  return res.data.createFileDocument;
};

export const updateFileDocument = async (id: string,  data: TFileDocument) => {
    const res = await apolloClient.mutate({
    mutation: UPDATE_FILE_DOCUMENT,
    variables: {
        data,
        where: { id },
    }
    });

    return res.data.updateFileDocument;
};
