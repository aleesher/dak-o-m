import {
  SendMailOptions,
  SentMessageInfo,
  TransportOptions
} from "nodemailer";
import * as nodemailer from "nodemailer";

const smtpTransportOptions: TransportOptions = {
  service: 'gmail',
  auth: {
    user: 'dakota@dakcalc.nl',
    pass: 'XLLAzU4HaArnK4HJ'
  }
} as any;

const transporter =
  process.env.MAIL_TRANSPORT_JSON === "true"
    ? nodemailer.createTransport({
      jsonTransport: true
    })
    : nodemailer.createTransport(smtpTransportOptions);

export const sendMail = (options :SendMailOptions) : Promise<SentMessageInfo>  => {
  return new Promise((resolve, reject) => {
  transporter
      .sendMail(options)
      .then(resolve)
      .catch(reject);
  });
};

