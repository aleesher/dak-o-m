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
require("mocha");
const MSQSOAPClient_1 = require("../MSQSOAPClient");
describe("SOAPClient", () => {
    it("Should fetch CPE data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            const soapClient = new MSQSOAPClient_1.default({
                credentials: {
                    url: "https://webserviceslive.dakota.nl:7057/DakotaLive/WS/Duwel%20BV/Page/",
                    username: "CPE_WS",
                    password: "2018Duwel@!=",
                    workstation: "",
                    domain: ""
                }
            });
            const data = yield soapClient.fetchAsJSON("CPE_Item_WS", {});
            console.log(data);
        });
    });
    it("Should fetch Dakota Calc APP data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            const soapClient = new MSQSOAPClient_1.default({
                credentials: {
                    url: "https://webservicesaccept.dakota.nl:7067/Dakotaaccept/WS/Page/",
                    username: "CALCAPP_WS",
                    password: "WS2019!2Second",
                    workstation: "",
                    domain: ""
                }
            });
            const data = yield soapClient.fetchAsJSON("Calcapp_Try_out_Quote_WS", {});
            console.log(data);
        });
    });
});
//# sourceMappingURL=MSQSOAPClient.test.js.map