// includes
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const sanitize = require("mongo-sanitize");

// Models
const FaqsModel = require("../../models/Faqs");

// helper functions
// const systemLogsHelper = require("../../helpers/system-logs");

const {
  sendResponse,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
} = require("../../helpers/utils");

// module name
let moduleName;
let responseMsgs;
var lang = "english";

module.exports = {
  getAll,
};

/** Get all Faqs **/
async function getAll(request, response) {
  let params = request.query;

  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(lang, "FaqsController");
  responseMsgs = await getResponseMsgsFromLanguage(lang, "FaqsController");

  try {
    const model = await FaqsModel;

    let page = params.startAt ? parseInt(params.startAt) : 1;
    let perPage = params.perPage ? parseInt(params.perPage) : 50;
    let sortBy = { createdAt: -1 };

    const $aggregate = [];

    // Match filters
    if (params.status) {
      $aggregate.push({
        $match: {
          status: { $eq: params.status },
        },
      });
    }

    if (params.keyword) {
      const key = params.keyword;
      $aggregate.push({
        $match: {
          $or: [
            {
              [`title.${lang}`]: RegExp(key, "i"),
            },
          ],
        },
      });
    }

    // Project only the selected language fields
    $aggregate.push({
      $project: {
        _id: 1,
        title: `$title.${lang}`,
        description: `$description.${lang}`,
        status: 1,
        createdBy: 1,
        createdAt: 1,
      },
    });

    let data = await model
      .aggregate($aggregate)
      .sort(sortBy)
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    // For total count
    const countAgg = [...$aggregate.slice(0, -1)]; // exclude the projection
    countAgg.push({ $count: "total" });

    const count = await model.aggregate(countAgg).exec();
    const total = count.length ? count[0].total : 0;

    const respData = {
      faqs: data,
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
      responseMsgs.recordFetched || "FAQs fetched",
      respData
    );
  } catch (error) {
    console.log("--- getAll API error ---", error);
    return sendResponse(
      response,
      moduleName,
      500,
      0,
      responseMsgs.error_500 || "Something went wrong, please try again later."
    );
  }
}
