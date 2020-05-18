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
declare class MSQSOAPClient {
    private retryCount;
    private ntlmClient;
    constructor(config: MSQWSConfigInterface);
    fetchAsJSON(page: any, filter?: {}, options?: {
        bookmarkKey?: string;
        size?: number;
    }): Promise<any>;
    update(page: any, options?: {}): Promise<any>;
    fetchFileAsJson(documentNo: any, page: any): Promise<any>;
    private parseXML;
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
    private soapRequest;
}
export default MSQSOAPClient;
