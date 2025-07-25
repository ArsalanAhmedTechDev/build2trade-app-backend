// includes
const mongoose = require("mongoose");
const moment = require("moment");
const ObjectId = mongoose.Types.ObjectId;
const sanitize = require("mongo-sanitize");

// Models
const FundsModel = require("../../models/Funds");
const FundPricesModel = require("../../models/FundPrices");
const FundCategoryModel = require("../../models/FundCategory");

// helper functions
const systemLogsHelper = require("../../helpers/system-logs");
const {
  sendResponse,
  updateLanguageContent,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
} = require("../../helpers/utils");

// module name
// const moduleName = "Daily Fund Prices";
let moduleName;
var lang = "english";

module.exports = {
  getAll,
  getArchive,
  getUnitPrices,
  getHistory,
};

/** Get all records **/
async function getAll(request, response) {
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "DailyFundPricesController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "DailyFundPricesController"
  );

  let params = request.query;

  try {
    /** set model to fetch all **/
    const model = await FundsModel;

    $aggregate = [
      {
        $lookup: {
          from: "fundCategory",
          localField: "fundCategoryId",
          foreignField: "_id",
          as: "fundCategory",
        },
      },
      {
        $unwind: {
          path: "$fundCategory",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    if (params && params.fundId) {
      $aggregate.push({
        $match: {
          _id: new ObjectId(params.fundId),
        },
      });
    }

    let $project = {
      title: "$title." + lang,
      fundCode: "$fundCode",
      status: "$status",
      createdAt: "$createdAt",
      fundCategory: "$fundCategory.title." + lang,
      risk: "$fundCategory.risk." + lang,
      transactionDate: "$fundPrices.transactionDate",
      offerPrice: "$fundPrices.offerPrice",
      bidPrice: "$fundPrices.bidPrice",
    };
    $aggregate.push({
      $sort: {
        title: -1, // Sorts `title` field in descending order
      },
    });
    let data = await model.aggregate([$aggregate]).project($project).exec();

    let respData = {
      funds: data,
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
function formatPrices(prices) {
  // This function will need to format the prices as per your requirement
  // This is a placeholder to illustrate the process
  return prices.map((price) => ({
    date: price.transactionDate.toISOString().split("T")[0],
    bidPrice: price.bidPrice,
    offerPrice: price.offerPrice,
    fundCode: price.fundCode,
  }));
}

async function getArchive(request, response) {
  let params = request.query;
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "DailyFundPricesController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "DailyFundPricesController"
  );
  try {
    const startDate = new Date(params.from);
    const endDate = new Date(params.to);

    // Ensure the date includes the whole day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    console.log("start date", startDate);
    console.log("end date", endDate);

    /** set model to fetch all **/
    const model = await FundsModel;

    $aggregate = [
      {
        $lookup: {
          from: "fundPrices",
          localField: "_id",
          foreignField: "fundId",
          as: "fundPrices",
        },
      },
      {
        $unwind: {
          path: "$fundPrices",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "fundCategory",
          localField: "fundCategoryId",
          foreignField: "_id",
          as: "fundCategory",
        },
      },
      {
        $unwind: {
          path: "$fundCategory",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    $aggregate.push({
      $match: {
        "fundPrices.transactionDate": {
          $gte: startDate,
          $lte: endDate,
        },
      },
    });
    let $project = {
      title: "$title." + lang,
      fundCode: "$fundCode",
      status: "$status",
      createdAt: "$createdAt",
      fundCategory: "$fundCategory.title." + lang,
      risk: "$fundCategory.risk." + lang,
      transactionDate: "$fundPrices.transactionDate",
      offerPrice: "$fundPrices.offerPrice",
      bidPrice: "$fundPrices.bidPrice",
    };

    let data = await model.aggregate([$aggregate]).project($project).exec();

    //create system logs
    let systemLogsData = {
      userId: request.user._id,
      userIp: request.ip,
      roleId: request.user.roleId,
      module: moduleName,
      action: "getUnitPrices",
      data: data,
    };
    let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

    let formatData = groupByDate(data);
    // if(request.header('channel') && request.header('channel')!='web')
    // {
    //     formatData=groupByDate(data)
    // }
    // else
    // {
    //     formatData = groupByTitle(data)
    // }

    let respData = {
      archivePrices: formatData,
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
    console.log("--- getUnitPrices API error ---", error);
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

function groupByDate(prices) {
  const groupedByDate = {};

  prices.forEach((price) => {
    const dateKey = price.transactionDate; // Normalize date to YYYY-MM-DD format
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push({
      title: price.title,
      fundCategory: price.fundCategory,
      offerPrice: price.offerPrice,
      bidPrice: price.bidPrice,
      risk: price.risk,
    });
  });

  return Object.keys(groupedByDate).map((date) => ({
    date: date,
    prices: groupedByDate[date],
  }));
}

function groupByTitle(prices) {
  const groupedByTitle = {};

  prices.forEach((price) => {
    const titleKey = price.title;
    if (!groupedByTitle[titleKey]) {
      groupedByTitle[titleKey] = [];
    }
    groupedByTitle[titleKey].push({
      transactionDate: price.transactionDate,
      fundCategory: price.fundCategory,
      offerPrice: price.offerPrice,
      bidPrice: price.bidPrice,
      risk: price.risk,
    });
  });

  return Object.keys(groupedByTitle).map((title) => ({
    title: title,
    prices: groupedByTitle[title],
  }));
}

/** Get unit prices**/
async function getUnitPrices(request, response) {
  let params = request.query;
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "DailyFundPricesController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "DailyFundPricesController"
  );
  try {
    const startDate = new Date(params.transactionDate);
    const endDate = new Date(params.transactionDate);

    // Ensure the date includes the whole day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    console.log("start date", startDate);
    console.log("end date", endDate);

    /** set model to fetch all **/
    const model = await FundsModel;

    $aggregate = [
      {
        $lookup: {
          from: "fundPrices",
          localField: "_id",
          foreignField: "fundId",
          as: "fundPrices",
        },
      },
      {
        $unwind: {
          path: "$fundPrices",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "fundCategory",
          localField: "fundCategoryId",
          foreignField: "_id",
          as: "fundCategory",
        },
      },
      {
        $unwind: {
          path: "$fundCategory",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    $aggregate.push({
      $match: {
        "fundPrices.transactionDate": {
          $gte: startDate,
          $lte: endDate,
        },
      },
    });
    let $project = {
      title: "$title." + lang,
      fundCode: "$fundCode",
      status: "$status",
      createdAt: "$createdAt",
      fundCategory: "$fundCategory.title." + lang,
      risk: "$fundCategory.risk." + lang,
      transactionDate: "$fundPrices.transactionDate",
      offerPrice: "$fundPrices.offerPrice",
      bidPrice: "$fundPrices.bidPrice",
    };
    let data = await model.aggregate([$aggregate]).project($project).exec();

    //create system logs
    let systemLogsData = {
      userId: request.user._id,
      userIp: request.ip,
      roleId: request.user.roleId,
      module: moduleName,
      action: "getUnitPrices",
      data: data,
    };
    let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

    let respData = {
      unitPrices: data,
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
    console.log("--- getUnitPrices API error ---", error);
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

/** Get history for graph**/
async function getHistory(request, response) {
  let params = request.params;
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "DailyFundPricesController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "DailyFundPricesController"
  );
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    console.log("-----last date----", thirtyDaysAgo);

    let filter = {
      status: "active",
      transactionDate: { $gte: thirtyDaysAgo },
    };
    if (params && params.fundId) {
      filter = {
        fundId: new ObjectId(params.fundId),
        status: "active",
        transactionDate: { $gte: thirtyDaysAgo },
      };
    }

    let respData = null;

    if (request.header("channel") && request.header("channel") == "web") {
      const history = await FundPricesModel.find(filter, {
        _id: 0,
        transactionDate: 1,
        offerPrice: 1,
        bidPrice: 1,
      }).sort({ transactionDate: 1 });
      respData = {
        history: history,
      };
    } else {
      /** set model to fetch all **/
      const offerPrices = await FundPricesModel.find(filter, {
        _id: 0,
        transactionDate: 1,
        offerPrice: 1,
      }).sort({ transactionDate: 1 });

      const bidPrices = await FundPricesModel.find(filter, {
        _id: 0,
        transactionDate: 1,
        bidPrice: 1,
      }).sort({ transactionDate: 1 });
      respData = {
        offerPrices: offerPrices,
        bidPrices: bidPrices,
      };
    }

    //create system logs
    let systemLogsData = {
      userId: request.user._id,
      userIp: request.ip,
      roleId: request.user.roleId,
      module: moduleName,
      action: "getHistory",
      data: respData,
    };
    let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

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
