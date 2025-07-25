// includes
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// Models
const TeamMembersModel = require("../../models/TeamMembers");

// helper functions
const systemLogsHelper = require("../../helpers/system-logs");
const {
  sendResponse,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
} = require("../../helpers/utils");

// module name
// const moduleName = "Team Members";
// var lang = "english";
let moduleName;
let responseMsgs;
var lang = "english";

module.exports = {
  getById,
  getAll,
};
/** Get record by Id **/
async function getById(request, response) {
  let params = request.params;
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(lang, "TeamMemberController");
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "TeamMemberController"
  );

  try {
    /** set model to fetch **/
    const model = await TeamMembersModel;

    $aggregate = [];

    $aggregate.push({
      $match: {
        _id: new ObjectId(params.id),
      },
    });

    let data = await model.aggregate([$aggregate]).exec();

    //create system logs
    let systemLogsData = {
      userId: request.user._id,
      userIp: request.ip,
      roleId: request.user.roleId,
      module: moduleName,
      action: "getById",
      data: data,
    };
    let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

    let respData = {
      form: data[0],
    };
    return sendResponse(
      response,
      moduleName,
      200,
      1,
      responseMsgs.recordFetched,
      // "Record fetched",
      respData
    );
  } catch (error) {
    console.log("--- getById API error ---", error);
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

/** Get all records **/
async function getAll(request, response) {
  let params = request.query;
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(lang, "TeamMemberController");
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "TeamMemberController"
  );
  try {
    /** set model to fetch all **/
    const model = await TeamMembersModel;

    /** page number for pagination **/
    let page = params.startAt ? parseInt(params.startAt) : 1;

    /**  per page **/
    let perPage = params.perPage ? parseInt(params.perPage) : 10;

    /**  how to sort the list  **/
    let sortBy = { createdAt: -1 };

    $aggregate = [];

    /** filter via status  **/
    if (params.status) {
      $aggregate.push({
        $match: {
          status: {
            $eq: params.status,
          },
        },
      });
    }

    /** filter via title  **/

    if (params.keyword) {
      let key = params.keyword;

      $aggregate.push({
        $match: {
          $or: [
            {
              title: RegExp(key, "i"),
            },
          ],
        },
      });
    }

    let data = await model
      .aggregate([$aggregate])
      .sort(sortBy)
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    $aggregate.push({
      $count: "total",
    });
    const count = await model.aggregate($aggregate).exec();

    const total = count.length ? count[0].total : 0;

    //create system logs
    // let systemLogsData = {
    //     userId: request.user._id,
    //     userIp: request.ip,
    //     roleId: request.user.roleId,
    //     module: moduleName,
    //     action: 'getAll',
    //     data: data,
    // }
    // let systemLogs = await systemLogsHelper.composeSystemLogs(
    //     systemLogsData
    // )

    let respData = {
      teamMembers: data,
      pagination: {
        total: total,
        perPage: perPage,
        current: page,
        first: 1,
        last: total ? Math.ceil(total / perPage) : 1,
        next: page < Math.ceil(total / perPage) ? page + 1 : "",
      },
    };
    return sendResponse(
      response,
      moduleName,
      200,
      1,
      responseMsgs.recordFetched,
      // "Records fetched",
      respData
    );
  } catch (error) {
    console.log("--- getAll API error ---", error);
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
