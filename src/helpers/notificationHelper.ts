import * as Request from "request";
import {
  SERVICE_ORDER_STATUS_ANOTHER_COMPANY_NEEDED,
  SERVICE_ORDER_STATUS_MECHANIC_TRAVELLING,
  SERVICE_ORDER_STATUS_PLANNED,
  SERVICE_ORDER_STATUS_QUCIKFIX_ANOTHER_COMPANY_NEEDED,
  SERVICE_ORDER_STATUS_UNPLANNED,
  SERVICE_ORDER_STATUS_WORK_COMPLETED
} from "../constants";
import { ServiceOrder } from "../generated/prisma-client";
import { sendMail } from "../lib/dakota-services-common/helpers/mailHelper";
import { getCompany, getOutdatedSOs, getServiceOrderNotifications } from "./external";
import { createHash } from "crypto";

interface UpdateIProps {
  smsBody: string;
  tel: any;
}

interface GetMessageIProps {
  so: ServiceOrder;
  stage: string;
  token: string;
  tel?: string;
}
export const sendUpdateNotification = async ({ smsBody, tel }: UpdateIProps) => {
  return new Promise((resolve, reject) => {
    const payload = { recipients: tel, originator: process.env.SMS_SENDER, body: smsBody };
    Request.post(
      {
        url: process.env.SMS_PROVIDER_URL,
        headers: {
          Authorization: `AccessKey ${process.env.SMS_AUTH_HEADER}`,
        },
        body: payload,
        json: true,
      },
      (err, respBody, resp) => {
        if (err || respBody.statusCode !== 200) {
          reject(err);
        }
        resolve(resp)
      });
  });
};

export const getMessage = ({ so, stage, token, tel }: GetMessageIProps): string => {

  const link = `${process.env.EXTERNAL_PORTAL_URL}/track?token=${token}`;
  if (SERVICE_ORDER_STATUS_UNPLANNED.includes(stage)) {
    return `Uw melding is ontvangen, u zal binnenkort meer informatie ontvangen over de datum en tijdstip waarop de lekkage wordt gerepareerd. Meer info: ${link}`;
  } else if (SERVICE_ORDER_STATUS_PLANNED.includes(stage)) {
    return `Goed nieuws! We komen de daklekkage repareren op ${so.startDate}. U kunt ons verwachten tussen ${so.startTime} en ${so.startTime}. Meer info: ${link}`;
  } else if (SERVICE_ORDER_STATUS_MECHANIC_TRAVELLING.includes(stage)) {
    return `Onze monteur is nu naar u onderweg, hij verwacht om [time] bij u aan te komen. Meer info: ${link}`;
  } else if (SERVICE_ORDER_STATUS_WORK_COMPLETED.includes(stage)) {
    return `Goed nieuws! We hebben de daklekkage verholpen. Meer info: ${link}`;
  } else if (SERVICE_ORDER_STATUS_ANOTHER_COMPANY_NEEDED.includes(stage) || SERVICE_ORDER_STATUS_QUCIKFIX_ANOTHER_COMPANY_NEEDED.includes(stage)) {
    return `Jammer! We hebben de lekkage niet kunnen oplossen, we moeten een vervolgafspraak maken. Meer info: ${link} of bel ${tel}`;
  }

  return "";
};

export const checkServices = async () => {
  const notifications = await getServiceOrderNotifications(false);

  for (const note of notifications) {
    try {
      await sendNotification(note);
    } catch (e) {

    }
  }

  const now = new Date();
  now.setHours(now.getHours() + 2);
  const sos = await getOutdatedSOs(now.toISOString(), SERVICE_ORDER_STATUS_UNPLANNED[0]);

  for (const so of sos) {
    const company = await getCompany(so.companyCode);

    if (!company) {
      continue;
    }

    const token = createHash('sha1')
      .update(`${so.id}|${so.actualReferencePoint}`)
      .digest('hex');

    const msg = getRepairDelayMessage({ so, token, tel: company.phone, stage: "0" });

    try {
      await sendNotification({ smsText: msg, orderOwnerPhone: company.phone });
    } catch (e) {

    }
  }
  // check outdated service order past 24hrs and send reminder
};

export const getRepairDayReminder = ({ token }: GetMessageIProps): string =>
  `Onze monteur is nu naar u onderweg, hij verwacht om [time] bij u aan te komen. Meer info: ${process.env.EXTERNAL_PORTAL_URL}/track?token=${token}`;

export const getRepairDelayMessage = ({ so, token, tel }: GetMessageIProps) =>
  `Het is zover! Morgen, op ${so.startDate} tussen ${so.startTime} en ${so.startTime} komen we de lekkage oplossen. Meer info: ${process.env.EXTERNAL_PORTAL_URL}/track?token=${token}. Verhinderd? Bel dan ${tel}`;

export const getQuickAppointmentMessage = ({ so, token, tel }: GetMessageIProps) =>
  `Goed nieuws! We komen de daklekkage repareren op ${so.startDate}, u kunt ons verwachten tussen ${so.startTime} en ${so.startTime}. Meer info: ${process.env.EXTERNAL_PORTAL_URL}/track?token=${token}`;

export const sendNotification = async notification => {
  const now = new Date().getHours();

  if (now >= 8 && now <= 20) {
    try {
      await sendUpdateNotification({
        smsBody: notification.smsText,
        tel: notification.orderOwnerPhone
      });
    } catch (e) {
      if (notification.orderOwnerEmail) {
        const message = {
          from:
            notification.companyEmail || "dakota@dakcalc.nl",
          to: notification.orderOwnerEmail,
          subject: notification.emailSubject,
          html: notification.emailHtmlBody,
        };
        try {
          await sendMail(message);
          return true;
        } catch (e) {
          return false;
        }
      }
    }
  }

  return false;
};
