const locale = process.env.LOCALE || "en";

const systemLogs = require(`./${locale}/systemLogs`);
const timelineMessages = require(`./${locale}/timelineMessages`);
const emailTemplates = require(`./${locale}/email-templates`);
const pdfTemplates = require(`./${locale}/pdf-templates`);

module.exports = {
  systemLogs,
  timelineMessages,
  emailTemplates,
  pdfTemplates,
};
