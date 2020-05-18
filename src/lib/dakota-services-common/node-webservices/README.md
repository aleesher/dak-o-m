# MSQ Node.JS WebServices wrapper

This library provides implementation to fetch data from MSQ WebServices.

### Installation

Add following section to your `package.json` file's `dependencies` section:

```json
{
  "name": "your-app-name",
  "dependencies": {
    "node-webservices": "git+ssh://git@gitlab.com:second-company/msq/node-webservices#master"
  }
}
```

And run installation by executing:

```bash
$ npm i node-webservices
```

### Usage

By default package exports `MSQSOAPClient` class, which has `fetchAsJSON()` method:

```typescript
import MSQSOAPClient from "node-webservices";

const soapClient = new MSQSOAPClient({
  credentials: {
    url: "WEB_SERVICE_BASE_URL",
    username: "USER",
    password: "PASSWORD",
    // Last two are used by NLTM
    workstation: "",
    domain: ""
  },
  retryCount: 10 // Default: 5
});

const data = await soapClient.fetchAsJSON(
  "WebService_METHOD",
  {},
  {
    size: 10 // Limits number of items from the webservices
  }
);
```

Check `./lib/tests/MSQSOAPClient.test.ts` file for examples.

---

> Made with ❤️ in Second Company
