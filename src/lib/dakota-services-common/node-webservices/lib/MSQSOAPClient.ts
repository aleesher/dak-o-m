import {
  WEBSERVICE_RETRIES,
  SOAPEnvelope,
  SOAPBody,
  ReadMultiple_Result,
  ReadMultiple,
  Update,
  Update_Result,
  GetFile,
  GetFile_Result
} from "./constants";
import createEnvelope from "./createEnvelope";
import * as xml2js from "xml2js";
import NTLMClient from "./NTLMClient";

export interface MSQWSCredentials {
  url: string;
  username: string;
  password: string;
  workstation?: string;
  domain?: "";
}

export interface MSQWSConfigInterface {
  credentials: MSQWSCredentials;
  retryCount?: number;
}

const DEFAULT_RETRY_COUNT = 5;

class MSQSOAPClient {
  private retryCount: number;
  private ntlmClient: NTLMClient;

  constructor(config: MSQWSConfigInterface) {
    this.ntlmClient = new NTLMClient(config.credentials);
    this.retryCount = config.retryCount || DEFAULT_RETRY_COUNT;
  }

  async fetchAsJSON(
    page,
    filter = {},
    options: { bookmarkKey?: string; size?: number } = {}
  ) {
    const { bookmarkKey, size } = options;

    let xmlResult = await this.soapRequest(
      ReadMultiple,
      page,
      filter as any,
      bookmarkKey,
      size
    );
    const jsBody = await this.parseXML(xmlResult);
    xmlResult = ""; // Clear the variable to avoid memory leak
    return jsBody[SOAPEnvelope][SOAPBody][0][ReadMultiple_Result][0][
      ReadMultiple_Result
    ][0][page].map(item => {
      Object.keys(item).forEach(key => {
        // We get the results in array form, always as the first and only element of the array
        item[key] = Array.isArray(item[key]) ? item[key][0] : item[key];
      });
      return item;
    });
  }

  async update(
    page,
    options = {},
  ) {
    const xmlResult = await this.soapRequest(
      Update,
      page,
      options as any,
    );
    const jsBody = await this.parseXML(xmlResult);
    return jsBody[SOAPEnvelope][SOAPBody][0][Update_Result][0][page].map(item => {
      Object.keys(item).forEach(key => {
        // We get the results in array form, always as the first and only element of the array
        item[key] = Array.isArray(item[key]) ? item[key][0] : item[key];
      });
      return item;
    });
  }

  async fetchFileAsJson(
    documentNo,
    page,
  ) {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:d2f="urn:microsoft-dynamics-schemas/codeunit/D2FunctiesWS">
        <soapenv:Header/>
        <soapenv:Body>
          <d2f:GetFile>
              <d2f:documentNo>${documentNo}</d2f:documentNo>
              <d2f:extention></d2f:extention>
              <d2f:data></d2f:data>
          </d2f:GetFile>
        </soapenv:Body>
      </soapenv:Envelope>
    `;
    const xmlResult = await this.ntlmClient.request(GetFile, soapBody, page);

    const jsBody = await this.parseXML(xmlResult) as any;

    return jsBody[SOAPEnvelope][SOAPBody][0][GetFile_Result].map(item => {
      Object.keys(item).forEach(key => {
        // We get the results in array form, always as the first and only element of the array
        item[key] = Array.isArray(item[key]) ? item[key][0] : item[key];
      });
      return item;
    });
  }

  private parseXML = (xmlData: string) =>
    new Promise((resolve, reject) => {
      xml2js.parseString(xmlData, (error, result) => {
        if (error) {
          reject(error);
        }

        resolve(result);
      });
    });

  /**
   * @author Gerdinand Hardeman
   * This function is for doing requests to the CPE webservices
   * Example request: doSOAPRequest('ReadMultiple', 'CPE_UitbesteedMaterieel_WS', { hello: 'world'});
   * Real life example: doSOAPRequest('ReadMultiple', 'cpe_item_ws', { No: ['100000', '100001'] });
   * @param action The operation to be executed on the specified page
   * @param page The page on which the action will be called
   * @param parameters Any parameters needed to be supplied for the action in a key value object format
   * @param bookmarkKey From which result to start reading, for pagination. Pass last key value
   * @param size How much results to take, for pagination
   * The value in this key value object can be an array format
   * In this case, the value will be converted into a '|' separated string (equivalent to OR)
   * @returns XML string result
   */
  private soapRequest = async (
    action: string,
    page: string,
    parameters: { [s: string]: string | string[] },
    bookmarkKey?: string,
    size?: number,
    retryCounter: number = 0
  ): Promise<string> => {
    let soapBody = createEnvelope({
      action,
      page,
      parameters,
      bookmarkKey,
      size
    });

    try {
      const result = await this.ntlmClient.request(action, soapBody, page);
      soapBody = ""; // Clean the variable to avoid memory leak;
      return result;
    } catch (e) {
      const errorMessage =
        e.response && e.response.body
          ? e.response.body.split(">").join(">\n")
          : e;

      if (e.response) {
        console.error(
          `Webservices encountered an error with statuscode: ${
            e.response.statusCode
          }
        and body:\n${errorMessage}`
        );
      } else {
        console.error("Webservices encountered an error without response", e);
      }
      if (retryCounter < this.retryCount) {
        console.log(`Retrying [${retryCounter + 1}] webservices request...`);
        return await this.soapRequest(
          action,
          page,
          parameters,
          bookmarkKey,
          size,
          retryCounter + 1
        );
      } else {
        console.error(
          `Webservices failed permanently after ${WEBSERVICE_RETRIES} retries`
        );
        throw e;
      }
    }
  };
}

export default MSQSOAPClient;
