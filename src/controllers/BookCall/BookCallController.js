// includes
const mongoose = require("mongoose");
const moment = require("moment");
const ObjectId = mongoose.Types.ObjectId;
const sanitize = require("mongo-sanitize");

// Models
const BookCallModel = require("../../models/BookCall");
const CustomerModel = require("../../models/Customers");

// helper functions
const systemLogsHelper = require("../../helpers/system-logs");
const sendEmail = require("../../helpers/send-email");

const {
  sendResponse,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
} = require("../../helpers/utils");

// module name
// const moduleName = "BookCall";
let moduleName;
let responseMsgs;
var lang = "english";
const coreAPIUrl = process.env.CORE_API_URL;

module.exports = {
  createBookCall,
};

/** Create Record in Book Call model **/
async function createBookCall(request, response) {
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(lang, "BookCallController");
  responseMsgs = await getResponseMsgsFromLanguage(lang, "BookCallController");

  let params = request.body;
  let channel = request.header("channel") ? request.header("channel") : "web";

  try {
    // Check if all required keys are present
    let requiredKeys = ["name", "phoneNumber", "email", "city"];
    let missingKeys = requiredKeys.filter((key) => !params[key]);

    if (missingKeys.length) {
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        `Missing required keys: ${missingKeys.join(", ")}`
      );
    }

    // Sanitize the input to prevent NoSQL injection
    params = sanitize(params);

    // Create new BookCall record
    params.createdBy = request.user._id; // Assuming the user is authenticated and their ID is available in request.user
    let bookCall = new BookCallModel(params);

    let savedRecord = await bookCall.save();

    if (savedRecord) {
      // Create system logs
      let systemLogsData = {
        userId: request.user._id,
        userIp: request.ip,
        roleId: request.user.roleId,
        module: moduleName,
        action: "created",
        data: savedRecord,
      };
      await systemLogsHelper.composeSystemLogs(systemLogsData);
      console.log("Created Data", params);

      let updateBookACallStatus = {
        bookACall: true,
      };

      let bookACallStatusUpdated = await CustomerModel.findOneAndUpdate(
        {
          _id: request.user._id,
        },
        updateBookACallStatus,
        {
          new: true,
        }
      );
      const sendTo = process.env.TOEMAIL;
      //   const ccTo = process.env.CC;
      const ccTo = process.env.CC ? process.env.CC.split(",") : null;

      const objTmp = {
        subject: "New Book Call Request",
        CHANNEL: channel ? channel : "N/A",
        NAME: params && params.name ? params.name : "N/A",
        PHONENUMBER: params && params.phoneNumber ? params.phoneNumber : "N/A",
        EMAIL: params && params.email ? params.email : "N/A",
        CITY: params && params.city ? params.city : "N/A",
        JOB: params && params.job ? params.job : "N/A",
        DESIGNATION: params && params.designation ? params.designation : "N/A",
        MESSAGE: params && params.message ? params.message : "N/A",
      };

      console.log("send to", sendTo);
      console.log("cc to", ccTo);
      const user = {
        email: sendTo,
        emailCC: ccTo,
      };
      // const attachments = { path };

      sendEmail(
        user,
        objTmp,
        "newBookCall.subject",
        "newBookCall.body"
        // attachments
      );

      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.bookCallCreatedMsg,
        // "Book call has been created successfully",
        savedRecord
      );
    }

    return sendResponse(
      response,
      moduleName,
      500,
      0,
      responseMsgs.bookCallNotCreated

      // "Failed to create book call"
    );
  } catch (error) {
    console.log("--- Create BookCall API Error ---", error);
    return sendResponse(
      response,
      moduleName,
      500,
      0,
      responseMsgs.error_500
      // "Something went wrong, please try again later."
    );
  }
}
