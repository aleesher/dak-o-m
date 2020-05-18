import * as _ from "lodash";
import { PREFIX_MS_DYNAMICS, READ_MULTIPLE_ACTION } from "./constants";

type EnvelopeParamType = { [key: string]: string | string[] | { [key: string]: string | string[] } };

export interface EnvelopeConfig {
  action: string;
  page: string;
  parameters?: EnvelopeParamType;
  bookmarkKey?: string;
  size?: number;
}

export const paramsToQuery = (params, index = 0, results: string[] = []) => {
  _.forIn(params, (value, key) => {
    const tabs = '\t'.repeat(0);
    const openTag = `<cpe:${key}>`;
    const closeTag = `</cpe:${key}>`;
    results.push(tabs + openTag);
    if (Array.isArray(value)) {
      value.forEach((valueItem) => paramsToQuery(valueItem, index + 1, results));
    } else if (typeof (value) === 'object') {
      paramsToQuery(value, index + 1, results);
    } else {
      results.push(tabs + '' + value);
    }
    results.push(tabs + closeTag);
  });
  return results;
};

/**
 * Creates SOAP request envelope to be later
 * passed as request body to MSQ webservices
 *
 * @param config EnvelopeConfig
 */
const createEnvelope = (config: EnvelopeConfig): string => {
  const firstPart = [
    `<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" ` +
      `xmlns:cpe=\"${PREFIX_MS_DYNAMICS}/${config.page.toLowerCase()}\">`,
    ` <soap:Header/>`,
    ` <soap:Body>`,
    ` <cpe:${config.action}>`
  ];

  const parameters = config.parameters || {};
  if (config.action === READ_MULTIPLE_ACTION) {
    // For parameters which use the complicated filter, we need to make use of a predefined format
    Object.keys(parameters).forEach(key => {
      // If the value part of the key value object is an array, join it with |, making it an OR query for this field
      // This is an expected use case (getting prices for a specific set of materials)
      if (Array.isArray(parameters[key])) {
        parameters[key] = (parameters[key] as string[]).join("|");
      }
      firstPart.push(
        `\t<cpe:filter>`,
        `\t\t<cpe:Field>${key}</cpe:Field>`,
        `\t\t<cpe:Criteria>${parameters[key]}</cpe:Criteria>`,
        `\t</cpe:filter>`
      );
    });
  } else {
    firstPart.push(paramsToQuery(parameters).join(''));
  }

  if (config.bookmarkKey) {
    firstPart.push(`<cpe:bookmarkKey>${config.bookmarkKey}</cpe:bookmarkKey>`);
  }
  if (config.size) {
    firstPart.push(`<cpe:setSize>${config.size}</cpe:setSize>`);
  }
  const finalPart = firstPart.concat([
    ` </cpe:${config.action}>`,
    ` </soap:Body>`,
    `</soap:Envelope>`
  ]);

  return finalPart.join("\n");
};

export default createEnvelope;
