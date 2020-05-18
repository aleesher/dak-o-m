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
const agentkeepalive_1 = require("agentkeepalive");
const httpntlm = require("httpntlm");
const request = require("request-promise");
request.defaults({
    timeout: 1000 * 60 * 10 // MILLISECONDS * SECONDS * MINUTES
});
const constants_1 = require("./constants");
const keepAliveAgent = new agentkeepalive_1.HttpsAgent({
    timeout: 1000 * 60 * 10
});
const ntlm = httpntlm.ntlm;
class NTLMClient {
    constructor(credentials) {
        /**
         * This function is for doing the actual request to the CPE webservices.
         * It sets up the authentication with their server using the NTLM request response authentication.
         * @param action The operation to be executed on the specified page
         * @param soapBody The request body in XML format. A wrong format will return a 400 Bad Request error
         * @param page The page on which the action will be executed
         */
        this.request = (action, soapBody, page) => __awaiter(this, void 0, void 0, function* () {
            const NTLMMessages = {
                type1: "",
                type2: "",
                type3: ""
            };
            // Create some thing from the credentials
            NTLMMessages.type1 = ntlm.createType1Message(this.credentials);
            let result;
            const requestUrl = this.credentials.url + page;
            const getRequestHeaders = (authorizarion) => ({
                "Content-Type": constants_1.XML_CONTENT_TYPE,
                Connection: constants_1.CONNECTION_KEEP_ALIVE,
                Authorization: authorizarion,
                soapaction: `${constants_1.PREFIX_MS_DYNAMICS}/${page.toLowerCase()}:${action}`
            });
            // Request 1: This request goes to the server and expects a 401 response
            // This response contains a header which contains the data create the type data
            try {
                // No, we don't set the result here, we do that in the error, because that is supposed to happen
                // Such are the ways of Windows Authentication (NTLM)
                yield request.post({
                    url: requestUrl,
                    body: soapBody,
                    headers: getRequestHeaders(NTLMMessages.type1),
                    agent: keepAliveAgent
                });
            }
            catch (error) {
                // Yes, we need the error. NTLM stuff, first request needs a 401 response.
                if (error && error.statusCode === 401) {
                    result = error.response;
                }
                else {
                    console.error("First NTLM request did not return 401");
                    throw error;
                }
            }
            if (!result || !result.headers[constants_1.NTLM_RESPONSE_AUTH_HEADER]) {
                throw new Error(`${constants_1.NTLM_RESPONSE_AUTH_HEADER} header not found on response of first request`);
            }
            NTLMMessages.type2 = ntlm.parseType2Message(result.headers[constants_1.NTLM_RESPONSE_AUTH_HEADER]);
            NTLMMessages.type3 = ntlm.createType3Message(NTLMMessages.type2, this.credentials);
            // Request 2, goes to the server with the final NTLM authorization token and the body of our request
            // This one will return our desired result
            return yield request.post({
                url: requestUrl,
                body: soapBody,
                headers: getRequestHeaders(NTLMMessages.type3),
                followRedirect: false,
                agent: keepAliveAgent
            });
        });
        this.credentials = credentials;
    }
}
exports.default = NTLMClient;
//# sourceMappingURL=NTLMClient.js.map