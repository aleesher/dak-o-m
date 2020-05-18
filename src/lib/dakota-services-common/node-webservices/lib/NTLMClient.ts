import { HttpsAgent } from "agentkeepalive";
import * as httpntlm from "httpntlm";
import * as request from "request-promise";

request.defaults({
  timeout: 1000 * 60 * 10 // MILLISECONDS * SECONDS * MINUTES
});

import {
  NTLM_RESPONSE_AUTH_HEADER,
  XML_CONTENT_TYPE,
  CONNECTION_KEEP_ALIVE,
  PREFIX_MS_DYNAMICS
} from "./constants";
import { MSQWSCredentials } from "./MSQSOAPClient";

const keepAliveAgent = new HttpsAgent({
  timeout: 1000 * 60 * 10
});
const ntlm = httpntlm.ntlm;

interface NTLMMessageTypes {
  type1: string;
  type2: string;
  type3: string;
}

class NTLMClient {
  private credentials: MSQWSCredentials;

  constructor(credentials: MSQWSCredentials) {
    this.credentials = credentials;
  }

  /**
   * This function is for doing the actual request to the CPE webservices.
   * It sets up the authentication with their server using the NTLM request response authentication.
   * @param action The operation to be executed on the specified page
   * @param soapBody The request body in XML format. A wrong format will return a 400 Bad Request error
   * @param page The page on which the action will be executed
   */
  public request = async (action: string, soapBody: string, page: string) => {
    const NTLMMessages: NTLMMessageTypes = {
      type1: "",
      type2: "",
      type3: ""
    };

    // Create some thing from the credentials
    NTLMMessages.type1 = ntlm.createType1Message(this.credentials);
    let result;

    const requestUrl = this.credentials.url + page;
    const getRequestHeaders = (authorizarion: string) => ({
      "Content-Type": XML_CONTENT_TYPE,
      Connection: CONNECTION_KEEP_ALIVE,
      Authorization: authorizarion,
      soapaction: `${PREFIX_MS_DYNAMICS}/${page.toLowerCase()}:${action}`
    });

    // Request 1: This request goes to the server and expects a 401 response
    // This response contains a header which contains the data create the type data
    try {
      // No, we don't set the result here, we do that in the error, because that is supposed to happen
      // Such are the ways of Windows Authentication (NTLM)
      await request.post({
        url: requestUrl,
        body: soapBody,
        headers: getRequestHeaders(NTLMMessages.type1),
        agent: keepAliveAgent
      });
    } catch (error) {
      // Yes, we need the error. NTLM stuff, first request needs a 401 response.
      if (error && error.statusCode === 401) {
        result = error.response;
      } else {
        console.error("First NTLM request did not return 401");
        throw error;
      }
    }
    if (!result || !result.headers[NTLM_RESPONSE_AUTH_HEADER]) {
      throw new Error(
        `${NTLM_RESPONSE_AUTH_HEADER} header not found on response of first request`
      );
    }

    NTLMMessages.type2 = ntlm.parseType2Message(
      result.headers[NTLM_RESPONSE_AUTH_HEADER]
    );
    NTLMMessages.type3 = ntlm.createType3Message(
      NTLMMessages.type2,
      this.credentials
    );

    // Request 2, goes to the server with the final NTLM authorization token and the body of our request
    // This one will return our desired result
    return await request.post({
      url: requestUrl,
      body: soapBody,
      headers: getRequestHeaders(NTLMMessages.type3),
      followRedirect: false,
      agent: keepAliveAgent
    });
  };
}

export default NTLMClient;
