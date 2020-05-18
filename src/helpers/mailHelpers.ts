import * as ejs from "ejs";
import * as fs from "fs";
import * as path from "path";

import {
  SendMailOptions,
  SentMessageInfo,
} from "nodemailer";

import { sendMail } from "../lib/dakota-services-common/helpers/mailHelper";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'dakota@dakcalc.nl';

const renderAskQuestion = (name, email, question) => {
  const templatePath = path.resolve(
    __dirname,
    "../templates",
    "askQuestion.ejs"
  );
  const template = fs.readFileSync(templatePath, {
    encoding: "UTF-8"
  });

  return ejs.render(template, {
    name,
    email,
    question
  });
};

export const sendAskQuestionEmail = (
  name,
  email,
  question,
  soCode
): Promise<SentMessageInfo> => {
  return new Promise((resolve, reject) => {

    const message: SendMailOptions = {
      from:
        CONTACT_EMAIL,
      to: email,
      subject: `Question for ${soCode}`,
      html: renderAskQuestion(name, email, question),
    };

    sendMail(message)
      .then(resolve)
      .catch(reject);
  });
};

export const sendLogMomentEmail = (
  email,
  entityType,
): Promise<SentMessageInfo> => {
  return new Promise((resolve, reject) => {

    const message: SendMailOptions = {
      from:
        CONTACT_EMAIL,
      to: email,
      subject: `Log moment update of ${entityType}`,
      html: `<div>Some email</div>`,
    };

    sendMail(message)
      .then(resolve)
      .catch(reject);
  });
};
