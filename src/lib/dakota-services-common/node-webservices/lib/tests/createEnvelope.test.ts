import createEnvelope from "../createEnvelope";
import { expect } from "chai";
import "mocha";

describe("SOAP Envelops", () => {
  it("should create simple envelope", () => {
    const result = createEnvelope({
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

    expect(result).to.equal(expectedEnvelope);
  });

  it("should create envelope with filters", () => {
    const result = createEnvelope({
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
      "<cpe:PARAM>TEST</cpe:PARAM>"
       + "<cpe:FOO>BAR</cpe:FOO>",
      " </cpe:TEST_ACTION>",
      " </soap:Body>",
      "</soap:Envelope>"
    ].join("\n");

    expect(result).to.equal(expectedEnvelope);
  });

  it("should create envelope with nested filters", () => {
    const result = createEnvelope({
      action: "Update",
      page: "DDProjectAppProjecten",
      parameters: {
        DDProjectAppProjecten: {
          Key: "36;mfIAAAJ7/0MARQAxADEAMAAyADMANwAwADI=11;305699012200;",
          PercentageGereed: "11"
        },
      }
    });

    const expectedEnvelope = [
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cpe="urn:microsoft-dynamics-schemas/page/ddprojectappprojecten">',
      " <soap:Header/>",
      " <soap:Body>",
      " <cpe:Update>",
      "<cpe:DDProjectAppProjecten>"
       + "<cpe:Key>36;mfIAAAJ7/0MARQAxADEAMAAyADMANwAwADI=11;305699012200;</cpe:Key>"
       + "<cpe:PercentageGereed>11</cpe:PercentageGereed>"
       + "</cpe:DDProjectAppProjecten>",
      " </cpe:Update>",
      " </soap:Body>",
      "</soap:Envelope>"
    ].join("\n");

    expect(result).to.equal(expectedEnvelope);
  });
});
