export const WEBSERVICE_FILE = 'D2FunctiesWS';

export const WEBSERVICE_URL =
  process.env.WEBSERVICE_URL ||
  "https://webservicesaccept.dakota.nl:7067/Dakotaaccept/WS";

export const WEBSERVICE_USERNAME = process.env.WEBSERVICE_USERNAME || '';
export const WEBSERVICE_PASSWORD = process.env.WEBSERVICE_PASSWORD || '';

export const WEBSERVICE_PAGE_SIZE = process.env.WEBSERVICE_PAGE_SIZE
  ? parseInt(process.env.WEBSERVICE_PAGE_SIZE)
  : 50;

export const WEBSERVICE_MAX_COUNT = process.env.WEBSERVICE_MAX_COUNT
  ? parseInt(process.env.WEBSERVICE_MAX_COUNT)
  : 100;
