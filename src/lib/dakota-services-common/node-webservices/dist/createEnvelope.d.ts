declare type EnvelopeParamType = {
    [key: string]: string | string[] | {
        [key: string]: string | string[];
    };
};
export interface EnvelopeConfig {
    action: string;
    page: string;
    parameters?: EnvelopeParamType;
    bookmarkKey?: string;
    size?: number;
}
export declare const paramsToQuery: (params: any, index?: number, results?: string[]) => string[];
/**
 * Creates SOAP request envelope to be later
 * passed as request body to MSQ webservices
 *
 * @param config EnvelopeConfig
 */
declare const createEnvelope: (config: EnvelopeConfig) => string;
export default createEnvelope;
