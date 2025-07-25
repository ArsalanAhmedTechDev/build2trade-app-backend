// includes
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const sanitize = require("mongo-sanitize");

// Models
const FundManagerReportsModel = require("../../models/FundManagerReports");

// helper functions
const systemLogsHelper = require("../../helpers/system-logs");
const {
  sendResponse,
  checkKeysExist,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
} = require("../../helpers/utils");

// module name
// const moduleName = "FMR";
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
  moduleName = await getModuleNameFromLanguage(
    lang,
    "FundManagerReportsController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "FundManagerReportsController"
  );

  try {
    /** set model to fetch **/
    const model = await FundManagerReportsModel;

    $aggregate = [
      {
        $lookup: {
          from: "systemUsers",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $unwind: {
          path: "$createdByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    $aggregate.push({
      $match: {
        _id: new ObjectId(params.fmrId),
      },
    });

    let $project = {
      _id: "$_id",
      title: "$title." + lang,
      description: "$description." + lang,
      status: "$status",
      createdBy: "$createdByDetails.fullName",
      image: "$image",
      file: "$file",
      createdAt: "$createdAt",
    };
    let data = await model.aggregate([$aggregate]).project($project).exec();

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
      fundManagerReports: data[0],
    };
    return sendResponse(
      response,
      moduleName,
      200,
      1,
      responseMsgs.frmFetched,
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

/** Get all FMRs **/
async function getAll(request, response) {
  let params = request.query;
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "FundManagerReportsController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "FundManagerReportsController"
  );

  try {
    /** set model to fetch all **/
    const model = await FundManagerReportsModel;

    /** page number for pagination **/
    let page = params.startAt ? parseInt(params.startAt) : 1;

    /**  per page **/
    let perPage = params.perPage ? parseInt(params.perPage) : 10;

    /**  how to sort the list  **/
    let sortBy = { createdAt: -1 };

    $aggregate = [
      {
        $lookup: {
          from: "systemUsers",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $unwind: {
          path: "$createdByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

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
              "title.english": RegExp(key, "i"),
            },
          ],
        },
      });
    }

    let $project = {
      _id: "$_id",
      title: "$title." + lang,
      description: "$description." + lang,
      status: "$status",
      createdBy: "$createdByDetails.fullName",
      image: "$image",
      file: "$file",
      createdAt: "$createdAt",
    };

    let data = await model
      .aggregate([$aggregate])
      .project($project)
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
    let systemLogsData = {
      userId: request.user._id,
      userIp: request.ip,
      roleId: request.user.roleId,
      module: moduleName,
      action: "getAll",
      data: data,
    };
    let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

    let respData = {
      fundManagerReports: data,
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
      responseMsgs.frmFetched,
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
