import MSQSoapClient from "../../node-webservices/dist";
import {
  WEBSERVICE_URL,
  WEBSERVICE_USERNAME,
  WEBSERVICE_PASSWORD,
  WEBSERVICE_PAGE_SIZE,
  WEBSERVICE_MAX_COUNT
} from "./constants";

const wait = (n) => new Promise(resolve => setTimeout(resolve, n));

export function generateItems(data: any) {
  return Object.entries(data).map(([key, value]) => ({
    code: key,
    description: value
  }));
}

export const getSoapClient = (companyName: string, pageType: string = "Page") => (
  new MSQSoapClient({
    credentials: {
      url: `${WEBSERVICE_URL}/${companyName}/${pageType}/`,
      username: WEBSERVICE_USERNAME,
      password: WEBSERVICE_PASSWORD,
      workstation: "",
      domain: ""
    }
  })
);

export const getDataFromWS = async (
  page,
  companyName,
  filters = {},
  options = {
    bookmarkKey: null,
    size: WEBSERVICE_PAGE_SIZE,
    maxCount: WEBSERVICE_MAX_COUNT
  },
) => {
  let result = [];

  try {
    const soapClient = getSoapClient(companyName);

    // console.time('getDataFromWS');

    result = await soapClient.fetchAsJSON(page, filters, options);

    // console.timeEnd('getDataFromWS');
  } catch (e) {
    if (e.message !== 'Cannot read property \'map\' of undefined') {
      console.log(e.message);
      console.error("SOAP request for getting data failed!", companyName, page);
    }
  }

  return result;
}

export const getDataRecursively = async (
  page: string,
  companyName: string,
  callback,
  filters = {},
  options = {
    bookmarkKey: null,
    size: WEBSERVICE_PAGE_SIZE,
    maxCount: WEBSERVICE_MAX_COUNT
  },
  total = 0,
) => {
  try {
    let wsData = await getDataFromWS(
      page,
      companyName,
      filters,
      options
    );

    const newTotal = wsData.length + total;

    console.log(`Fetched ${wsData.length} (${newTotal} total)`);

    await callback(wsData);

    if (
      wsData.length > 0 &&
      wsData.length === options.size
      && newTotal < options.maxCount // Limit the number of entities to import for testing purposes
    ) {
      const lastKey = wsData[wsData.length - 1].Key.split('').join(''); // Make an actual copy of a string to avoid memory leak via reference-to-parent
      console.log(`Looking for more on the next page...`, lastKey);

      wsData = []; // Clear the data to avoid memory leak
      options.bookmarkKey = lastKey;

      return await getDataRecursively(
        page,
        companyName,
        callback,
        filters,
        options,
        newTotal
      );
    } else {
      wsData = []; // Clear the data to avoid memory leak
      return newTotal;
    }
  } catch (e) {
    console.error("Recursive SOAP request for getting  failed!", e.message);
    console.error("Last bookmark_key", options.bookmarkKey);
  }
  return total;
};

export const getDataItemsRecursively = async (
  page: string,
  companyName: string,
  filters = {},
  options = {
    bookmarkKey: null,
    size: WEBSERVICE_PAGE_SIZE,
    maxCount: WEBSERVICE_MAX_COUNT
  },
  items = [],
) => {
  try {
    await wait(50);
    let wsData = await getDataFromWS(
      page,
      companyName,
      filters,
      options
    );

    items = items.concat(...wsData);

    // console.log(`Fetched ${wsData.length} (${newItems.length} total)`);

    if (
      wsData.length > 0 &&
      wsData.length === options.size
      && items.length < options.maxCount // Limit the number of entities to import for testing purposes
    ) {
      const lastKey = wsData[wsData.length - 1].Key;
      console.log(`Looking for more on the next page ${page}`, lastKey);

      wsData = [];
      return await getDataItemsRecursively(
        page,
        companyName,
        filters,
        {
          ...options,
          bookmarkKey: lastKey
        },
        items
      );
    } else {
      wsData = [];
      return items;
    }
  } catch (e) {
    console.error("Recursive SOAP request for getting  failed!", e.message);
    console.error("Last bookmark_key", options.bookmarkKey);
  }
  return items;
};

export const updateDataInWS = async (
  page,
  companyName,
  data = {},
) => {
  let result = [];

  try {
    const soapClient = getSoapClient(companyName);

    console.time('updateDataInWS');

    result = await soapClient.update(page, data);

    console.timeEnd('updateDataInWS');
  } catch (e) {
    console.error("SOAP request for updating data failed!", companyName, page);
  }

  return result;
}

export const fetchFileFromWS = async (
  documentNo,
  page,
  companyName,
) => {
  let result = [];

  try {
    const soapClient = getSoapClient(companyName, 'Codeunit');

    console.time('fetchFileFromWS');

    result = await soapClient.fetchFileAsJson(documentNo, page);

    console.timeEnd('fetchFileFromWS');
  } catch (e) {
    console.error("SOAP request for getting file failed!", companyName, page, e);
  }

  if (result && result.length) {
    return result[0];
  } else {
    return null;
  }
}

export function getCode(description: string, entities: any[], defaultCode = 'unknown'): string {
  const result = entities.find((kind) => kind.description === description );

  return result ? result.code : defaultCode;
}

export async function seedEntity(values, createCallback, getCallback) {
  const items = generateItems(
    values
  );

  for (let i = 0; i < items.length; i++) {
    await createCallback(items[i]);
  }

  return await getCallback();
}

export const convertUnitValue = (value: string) =>  {
  switch (value) {
    case 'm²':
    case 'm_x00B2_': return 'M2';
    case 'm¹':
    case 'm_x00B9_': return 'M1';
    case 'st': return 'STUKS';
    default: throw new Error('Unknown value of Unit: ' + value);
  }
};
