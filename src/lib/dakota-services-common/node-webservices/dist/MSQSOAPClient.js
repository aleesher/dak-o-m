"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const createEnvelope_1 = require("./createEnvelope");
const xml2js = require("xml2js");
const NTLMClient_1 = require("./NTLMClient");
const DEFAULT_RETRY_COUNT = 5;
class MSQSOAPClient {
    constructor(config) {
        this.parseXML = (xmlData) => new Promise((resolve, reject) => {
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
        this.soapRequest = (action, page, parameters, bookmarkKey, size, retryCounter = 0) => __awaiter(this, void 0, void 0, function* () {
            let soapBody = createEnvelope_1.default({
                action,
                page,
                parameters,
                bookmarkKey,
                size
            });
            try {
                const result = yield this.ntlmClient.request(action, soapBody, page);
                soapBody = ""; // Clean the variable to avoid memory leak;
                return result;
            }
            catch (e) {
                const errorMessage = e.response && e.response.body
                    ? e.response.body.split(">").join(">\n")
                    : e;
                if (e.response) {
                    console.error(`Webservices encountered an error with statuscode: ${e.response.statusCode}
        and body:\n${errorMessage}`);
                }
                else {
                    console.error("Webservices encountered an error without response", e);
                }
                if (retryCounter < this.retryCount) {
                    console.log(`Retrying [${retryCounter + 1}] webservices request...`);
                    return yield this.soapRequest(action, page, parameters, bookmarkKey, size, retryCounter + 1);
                }
                else {
                    console.error(`Webservices failed permanently after ${constants_1.WEBSERVICE_RETRIES} retries`);
                    throw e;
                }
            }
        });
        this.ntlmClient = new NTLMClient_1.default(config.credentials);
        this.retryCount = config.retryCount || DEFAULT_RETRY_COUNT;
    }
    fetchAsJSON(page, filter = {}, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookmarkKey, size } = options;
            let xmlResult = yield this.soapRequest(constants_1.ReadMultiple, page, filter, bookmarkKey, size);
            const jsBody = yield this.parseXML(xmlResult);
            xmlResult = ""; // Clear the variable to avoid memory leak
            return jsBody[constants_1.SOAPEnvelope][constants_1.SOAPBody][0][constants_1.ReadMultiple_Result][0][constants_1.ReadMultiple_Result][0][page].map(item => {
                Object.keys(item).forEach(key => {
                    // We get the results in array form, always as the first and only element of the array
                    item[key] = Array.isArray(item[key]) ? item[key][0] : item[key];
                });
                return item;
            });
        });
    }
    update(page, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const xmlResult = yield this.soapRequest(constants_1.Update, page, options);
            const jsBody = yield this.parseXML(xmlResult);
            return jsBody[constants_1.SOAPEnvelope][constants_1.SOAPBody][0][constants_1.Update_Result][0][page].map(item => {
                Object.keys(item).forEach(key => {
                    // We get the results in array form, always as the first and only element of the array
                    item[key] = Array.isArray(item[key]) ? item[key][0] : item[key];
                });
                return item;
            });
        });
    }
    fetchFileAsJson(documentNo, page) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const xmlResult = yield this.ntlmClient.request(constants_1.GetFile, soapBody, page);
            const jsBody = yield this.parseXML(xmlResult);
            return jsBody[constants_1.SOAPEnvelope][constants_1.SOAPBody][0][constants_1.GetFile_Result].map(item => {
                Object.keys(item).forEach(key => {
                    // We get the results in array form, always as the first and only element of the array
                    item[key] = Array.isArray(item[key]) ? item[key][0] : item[key];
                });
                return item;
            });
        });
    }
}
exports.default = MSQSOAPClient;
//# sourceMappingURL=MSQSOAPClient.js.map