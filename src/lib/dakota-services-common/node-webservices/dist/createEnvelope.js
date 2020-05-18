"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const constants_1 = require("./constants");
exports.paramsToQuery = (params, index = 0, results = []) => {
    _.forIn(params, (value, key) => {
        const tabs = '\t'.repeat(0);
        const openTag = `<cpe:${key}>`;
        const closeTag = `</cpe:${key}>`;
        results.push(tabs + openTag);
        if (Array.isArray(value)) {
            value.forEach((valueItem) => exports.paramsToQuery(valueItem, index + 1, results));
        }
        else if (typeof (value) === 'object') {
            exports.paramsToQuery(value, index + 1, results);
        }
        else {
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
const createEnvelope = (config) => {
    const firstPart = [
        `<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" ` +
            `xmlns:cpe=\"${constants_1.PREFIX_MS_DYNAMICS}/${config.page.toLowerCase()}\">`,
        ` <soap:Header/>`,
        ` <soap:Body>`,
        ` <cpe:${config.action}>`
    ];
    const parameters = config.parameters || {};
    if (config.action === constants_1.READ_MULTIPLE_ACTION) {
        // For parameters which use the complicated filter, we need to make use of a predefined format
        Object.keys(parameters).forEach(key => {
            // If the value part of the key value object is an array, join it with |, making it an OR query for this field
            // This is an expected use case (getting prices for a specific set of materials)
            if (Array.isArray(parameters[key])) {
                parameters[key] = parameters[key].join("|");
            }
            firstPart.push(`\t<cpe:filter>`, `\t\t<cpe:Field>${key}</cpe:Field>`, `\t\t<cpe:Criteria>${parameters[key]}</cpe:Criteria>`, `\t</cpe:filter>`);
        });
    }
    else {
        firstPart.push(exports.paramsToQuery(parameters).join(''));
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
exports.default = createEnvelope;
//# sourceMappingURL=createEnvelope.js.map