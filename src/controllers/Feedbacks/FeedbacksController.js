// includes
const mongoose = require("mongoose");
const moment = require("moment");
const ObjectId = mongoose.Types.ObjectId;
const sanitize = require("mongo-sanitize");

// Models
const FeedbackModel = require("../../models/Feedbacks");

// helper functions
const systemLogsHelper = require("../../helpers/system-logs");

const {
  sendResponse,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
} = require("../../helpers/utils");

// module name
// const moduleName = "Feedback";
let moduleName;
let responseMsgs;
var lang = "english";

module.exports = {
  createFeedback,
  getFeedbackByUserId,
};

/** Create Record in Feedback model **/
async function createFeedback(request, response) {
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(lang, "FeedbacksController");
  responseMsgs = await getResponseMsgsFromLanguage(lang, "FeedbacksController");

  let params = request.body;
  let channel = request.header("channel") ? request.header("channel") : "web";

  try {
    // Sanitize the input to prevent NoSQL injection
    params = sanitize(params);

    // **NEW**: prevent duplicate feedback creation by the same user
    // const existing = await FeedbackModel.findOne({
    //   createdBy: request.user._id,
    // });
    // if (existing) {
    //   return sendResponse(
    //     response,
    //     moduleName,
    //     422, // or 409 if you prefer HTTP Conflict
    //     0,
    //     responseMsgs.feedbackAlreadyExistMsg
    //     // "You have already created feedback"
    //   );
    // }

    // Create new Feedback record
    params.createdBy = request.user._id; // Assuming the user is authenticated
    console.log("Payload ==> ", params);
    let feedback = new FeedbackModel(params);

    let savedRecord = await feedback.save();

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
      console.log("Created Data", savedRecord);
      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.feedbackCreatedMsg,
        savedRecord
      );
    }

    return sendResponse(
      response,
      moduleName,
      422,
      0,
      responseMsgs.feedbackNotCreated
    );
  } catch (error) {
    console.log("--- Create Feedback API Error ---", error);
    return sendResponse(response, moduleName, 500, 0, responseMsgs.error_500);
  }
}

/** Get Feedback by User ID **/
async function getFeedbackByUserId(request, response) {
  let lang = request.header("lang") ? request.header("lang") : "en";
  const moduleName = await getModuleNameFromLanguage(
    lang,
    "FeedbacksController"
  );
  const responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "FeedbacksController"
  );

  try {
    // return sendResponse(
    //   response,
    //   moduleName,
    //   200,
    //   1,
    //   responseMsgs.recordFetched || "Feedback retrieved successfully",
    //   {
    //     _id: "68382bfe0404510e4135f526",
    //     overallExperience: "5",
    //     generalFeedback: "4",
    //     fifthPillarExperience: "3",
    //     productSatisfaction: "2",
    //     serviceQuality: "1",
    //     comment: "Test",
    //     status: "active",
    //     createdBy: "671bc9c15df9e0105d549ec4",
    //     createdAt: "2025-05-29T09:42:22.701Z",
    //     __v: 0,
    //     id: "68382bfe0404510e4135f526",
    //   }
    // );
    // Find feedback by the currently authenticated user
    const feedback = await FeedbackModel.findOne({
      createdBy: request.user._id,
    }).sort({ createdAt: -1 }); // Newest first

    if (!feedback) {
      // return sendResponse(
      //   response,
      //   moduleName,
      //   404,
      //   0,
      //   responseMsgs.recordNotFound || "Feedback not found"
      // );
      feedback = {
        overallExperience: "",
        generalFeedback: "",
        fifthPillarExperience: "",
        productSatisfaction: "",
        serviceQuality: "",
        comment: "",
        status: "active",
      };
      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.recordFetched || "Feedback retrieved successfully",
        feedback
      );
    }

    return sendResponse(
      response,
      moduleName,
      200,
      1,
      responseMsgs.recordFetched || "Feedback retrieved successfully",
      feedback
    );
  } catch (error) {
    console.log("--- Get Feedback By User ID API Error ---", error);
    // return sendResponse(response, moduleName, 500, 0, responseMsgs.error_500);
    feedback = {
      overallExperience: "",
      generalFeedback: "",
      fifthPillarExperience: "",
      productSatisfaction: "",
      serviceQuality: "",
      comment: "",
      status: "active",
    };
    return sendResponse(
      response,
      moduleName,
      200,
      1,
      responseMsgs.recordFetched || "Feedback retrieved successfully",
      feedback
    );
  }
}
