const mongoose = require("mongoose");
const mailer = require("nodemailer");
const translate = require("../helpers/translate");

// const BrandingModel = require('../models/Branding')

module.exports = async (
  user,
  emailData,
  subjectKey,
  bodyKey,
  attachments = null
) => {
  let mailTransport;
  const auth = {};
  if (process.env.SMTP_USER) {
    auth.user = `${process.env.SMTP_USER}`;
  }
  if (process.env.SMTP_PASS) {
    auth.pass = `${process.env.SMTP_PASS}`;
  }

  if (process.env.ENVIRONMENT.toUpperCase() == "PRODUCTION") {
    mailTransport = mailer.createTransport({
      // host: process.env.SMTP_HOST, // smtp.office365.com
      // port: Number(process.env.SMTP_PORT), // 587
      host: `${process.env.SMTP_HOST}`,
      port: `${process.env.SMTP_PORT}`,
      secure: false, // Use TLS (not SSL) on port 587
      auth: auth,
      tls: {
        ciphers: "TLSv1.2", // Office365 requires TLS 1.2 or higher
        rejectUnauthorized: false, // Optional, only if you encounter certificate issues
      },
    });

    // mailTransport = mailer.createTransport({
    //   // host: "smtpout.secureserver.net",
    //   host: `${process.env.SMTP_HOST}`,
    //   secure: true,
    //   secureConnection: false, // TLS requires secureConnection to be false
    //   tls: {
    //     ciphers: "SSLv3",
    //   },
    //   requireTLS: true,
    //   port: `${process.env.SMTP_PORT}`,
    //   // port: 465,
    //   debug: true,
    //   auth: auth,
    // });
  } else if (
    process.env.ENVIRONMENT.toUpperCase() == "DEV" ||
    process.env.ENVIRONMENT.toUpperCase() == "UAT"
  ) {
    console.log("I am in dev or uat");
    // host: "smtpout.secureserver.net",
    mailTransport = mailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "d05c7c68838a49",
        pass: "5e53a865314c3e",
      },
    });
    // mailTransport = mailer.createTransport({
    //   host: `${process.env.SMTP_HOST}`,
    //   port: `${process.env.SMTP_PORT}`, // or 587 for TLS
    //   secure: false, // true for 465, false for other ports
    //   auth: auth,
    // });
  } else {
    console.log("Not in (dev,uat,production)");
    mailTransport = mailer.createTransport({
      host: `${process.env.SMTP_HOST}`,
      port: `${process.env.SMTP_PORT}`,
      secure: false,
      auth: auth,
      // auth,
    });
  }
  console.log("user =>", user);
  mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: user.email,
    cc: user.emailCC && user.emailCC,
  };

  mailOptions.subject = translate("emailTemplates", subjectKey);
  let replaceData = Object.assign(emailData, {
    LOGO_URL: process.env.FILE_LOGO_URL + "logo/",
    PRIMARY_COLOR: "",
    // SUBJECT: emailData.subject,
    // DESCRIPTION: emailData.description,
    // CONTACTVIA: emailData.contactVia,
    // CNIC_NUMBER: emailData && emailData.cnic ? emailData.cnic : null,
  });
  mailOptions.html = translate("emailTemplates", bodyKey, replaceData);

  if (attachments) {
    mailOptions.attachments = attachments;
  }
  console.log("send email end--------");

  return await mailTransport.sendMail(mailOptions);
};
