import { MSQWSCredentials } from "./MSQSOAPClient";
declare class NTLMClient {
    private credentials;
    constructor(credentials: MSQWSCredentials);
    /**
     * This function is for doing the actual request to the CPE webservices.
     * It sets up the authentication with their server using the NTLM request response authentication.
     * @param action The operation to be executed on the specified page
     * @param soapBody The request body in XML format. A wrong format will return a 400 Bad Request error
     * @param page The page on which the action will be executed
     */
    request: (action: string, soapBody: string, page: string) => Promise<any>;
}
export default NTLMClient;
