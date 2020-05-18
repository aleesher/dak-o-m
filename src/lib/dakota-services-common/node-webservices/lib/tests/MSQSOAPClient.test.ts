import "mocha";
import { expect } from "chai";
import MSQSOAPClient from "../MSQSOAPClient";

describe("SOAPClient", () => {
  it.skip("Should fetch CPE data", async function() {
    this.timeout(120000);

    const soapClient = new MSQSOAPClient({
      credentials: {
        url:
          "https://webserviceslive.dakota.nl:7057/DakotaLive/WS/Duwel%20BV/Page/",
        username: "CPE_WS",
        password: "2018Duwel@!=",
        workstation: "",
        domain: ""
      }
    });

    const data = await soapClient.fetchAsJSON(
      "CPE_Item_WS",
      {},
      {
        size: 100
      }
    );

    expect(data.length).equal(100);
  });

  it.skip("Should fetch CPE data with pagination", async function() {
    this.timeout(120000);

    const soapClient = new MSQSOAPClient({
      credentials: {
        url:
          "https://webserviceslive.dakota.nl:7057/DakotaLive/WS/Duwel%20BV/Page/",
        username: "CPE_WS",
        password: "2018Duwel@!=",
        workstation: "",
        domain: ""
      }
    });

    const firstPageData = await soapClient.fetchAsJSON(
      "CPE_Item_WS",
      {},
      {
        size: 10
      }
    );
    expect(firstPageData.length).equal(10);

    const lastKey = firstPageData[firstPageData.length - 1].Key;

    const secondPageData = await soapClient.fetchAsJSON(
      "CPE_Item_WS",
      {},
      {
        bookmarkKey: lastKey,
        size: 10
      }
    );

    const duplicateKeys = secondPageData.filter(({ Key }) =>
      firstPageData.find(item => item.Key === Key)
    );

    expect(duplicateKeys.length).equal(0);
    expect(secondPageData.length).equal(10);
  });

  it.skip("Should fetch Dakota Calc APP data", async function() {
    this.timeout(120000);

    const soapClient = new MSQSOAPClient({
      credentials: {
        url: "https://webservicesaccept.dakota.nl:7067/Dakotaaccept/WS/Page/",
        username: "CALCAPP_WS",
        password: "WS2019!2Second",
        workstation: "",
        domain: ""
      }
    });

    const data = await soapClient.fetchAsJSON(
      "Calcapp_TryoutQuote_WS",
      {},
      {
        size: 100
      }
    );

    expect(data.length).equal(100);
  });

  it("Should update data", async function() {
    this.timeout(120000);

    const soapClient = new MSQSOAPClient({
      credentials: {
        url: "https://webservicesaccept.dakota.nl:7067/Dakotaaccept/WS/Consolidated%20Nederland%20BV/Page/",
        username: "ProjectApp",
        password: "", // Set password for testing
        workstation: "",
        domain: ""
      }
    });

    const data = await soapClient.update(
      "DDProjectAppProjecten",
      {
        DDProjectAppProjecten: {
          Key: "", // Set the key
          PercentageGereed: "12"
        },
      },
    );

    expect(data.length).equal(1);
  });
});
