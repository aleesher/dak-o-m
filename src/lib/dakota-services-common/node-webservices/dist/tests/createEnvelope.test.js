"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createEnvelope_1 = require("../createEnvelope");
const chai_1 = require("chai");
require("mocha");
describe("SOAP Envelops", () => {
    it("should create simple envelope", () => {
        const result = createEnvelope_1.default({
            action: "TEST_ACTION",
            page: "TEST_PAGE"
        });
        const expectedEnvelope = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cpe="urn:microsoft-dynamics-schemas/page/test_page">
 <soap:Header/>
 <soap:Body>
 <cpe:TEST_ACTION>
 </cpe:TEST_ACTION>
 </soap:Body>
</soap:Envelope>`;
        chai_1.expect(result).to.equal(expectedEnvelope);
    });
    it("should create envelope with filters", () => {
        const result = createEnvelope_1.default({
            action: "TEST_ACTION",
            page: "TEST_PAGE",
            parameters: {
                PARAM: "TEST",
                FOO: "BAR"
            }
        });
        const expectedEnvelope = [
            '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cpe="urn:microsoft-dynamics-schemas/page/test_page">',
            " <soap:Header/>",
            " <soap:Body>",
            " <cpe:TEST_ACTION>",
            "\t<cpe:PARAM>TEST</cpe:PARAM>",
            "\t<cpe:FOO>BAR</cpe:FOO>",
            " </cpe:TEST_ACTION>",
            " </soap:Body>",
            "</soap:Envelope>"
        ].join("\n");
        chai_1.expect(result).to.equal(expectedEnvelope);
    });
});
//# sourceMappingURL=createEnvelope.test.js.map