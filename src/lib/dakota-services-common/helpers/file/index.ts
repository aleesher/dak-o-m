import * as fs from "fs";
import * as _ from "lodash";
import * as mime from "mime";

import { s3Helper } from "./s3";
import { fetchFileFromWS } from "../webservices";
import { WEBSERVICE_FILE } from "../webservices/constants";

export type TMultipartyFile = {
  path: string,
  type: string,
  originalFilename: string;
  headers: {
    [name: string]: string;
  }
}

function buildKey(entityName: string, type: string) {

  // File will be saved with random name
  const newName = Math.random().toString().slice(-6);

  /*
    Files of the same entity will be stored in random sub-folders
    This is for convenience:
      1) Files are devided into folders, easier to browse
      2) Don't need entity id to upload files
  */
  const subFolder = Math.random().toString().slice(-3);

  return `${entityName}/${subFolder}/${newName}.${type}`;
}

async function uploadFile(file: TMultipartyFile, entityName: string): Promise<string> {
  const type = file.originalFilename.split('.').pop() || "";
  const uploadKey = buildKey(entityName, type);

  const uploadParams = {
    Body: fs.createReadStream(file.path),
    Key: uploadKey,
    ContentType: file.type,
  };

  // upload file to S3
  const result = await s3Helper.uploadFile(uploadParams);

  if (result instanceof Error) {
    throw result;
  }

  return result.Key;
}

async function uploadImportedFile(file: string, documentNo: string, extension: string): Promise<string> {
  const uploadKey = `document/${documentNo}.${extension}`;
  const fileBuffer = Buffer.from(file, 'base64');

  const uploadParams = {
    Body: fileBuffer,
    Key: uploadKey,
    ContentType: mime.getType(extension),
  };

  // upload file to S3
  const result = await s3Helper.uploadFile(uploadParams);

  if (result instanceof Error) {
    throw result;
  }

  return result.Key;
}

async function deleteFile(key: string) {
  const result = await s3Helper.deleteFile(key);

  if (result instanceof Error) {
    throw result;
  }
}

async function getFile(key: string) {
  try {
    const data = await s3Helper.getFile(key);

    if (data instanceof Error) {
      throw data;
    }

    return data;
  } catch(e) {
    console.error(e.message);
    return null;
  }
}

async function moveFile(sourceKey: string, key: string) {
  // copy file
  let result = await s3Helper.copyFile(sourceKey, key);
  if (result instanceof Error) {
    throw result;
  }

  // remove source file
  result = await s3Helper.deleteFile(sourceKey);
  if (result instanceof Error) {
    throw result;
  }
}

export const importFile = async (documentNo: string, companyName: string) => {
  const file = await fetchFileFromWS(documentNo, WEBSERVICE_FILE, companyName);

  if (file && file.data) {
    return await fileHelper.uploadImportedFile(file.data, documentNo, file.extention);
  }

  return null;
}

export const fileHelper = {
  uploadFile,
  uploadImportedFile,
  deleteFile,
  getFile,
  moveFile,
  importFile,
};
