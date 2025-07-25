// includes
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// Models
const ProductModel = require("../../models/MabrurProducts");
const ProductDetailsModel = require("../../models/MabrurProductDetails");

// helper functions
const systemLogsHelper = require("../../helpers/system-logs");
const {
  sendResponse,
  checkKeysExist,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
} = require("../../helpers/utils");

// module name
// const moduleName = "Hajj/Umrah Planner";
// var lang = "english";
let moduleName;
let responseMsgs;
var lang = "english";

module.exports = {
  getAll,
  getPlan,
  getPlanTest,
  getDetails,
};

/** Get all records **/
// async function getAllOld(request, response) {
//   let params = request.query;
//   lang = request.header("lang") ? request.header("lang") : lang;
//   moduleName = await getModuleNameFromLanguage(
//     lang,
//     "HajjUmmrahPlannerController"
//   );
//   responseMsgs = await getResponseMsgsFromLanguage(
//     lang,
//     "HajjUmmrahPlannerController"
//   );

//   try {
//     /** set model to fetch all **/
//     const model = await ProductModel;

//     /** page number for pagination **/
//     let page = params.startAt ? parseInt(params.startAt) : 1;

//     /**  per page **/
//     let perPage = params.perPage ? parseInt(params.perPage) : 10;

//     /**  how to sort the list  **/
//     let sortBy = { createdAt: -1 };

//     $aggregate = [
//       {
//         $lookup: {
//           from: "systemUsers",
//           localField: "createdBy",
//           foreignField: "_id",
//           as: "createdByDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$createdByDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $match: {
//           status: "active",
//         },
//       },
//     ];
//     let $project = {
//       _id: "$_id",
//       title: "$title." + lang,
//       description: "$description." + lang,
//       productType: "$productType." + lang,
//       status: "$status",
//       createdBy: "$createdByDetails.fullName",
//       isAvailable: "$isAvailable",
//       createdAt: "$createdAt",
//     };

//     let data = await model
//       .aggregate([$aggregate])
//       .project($project)
//       .sort(sortBy)
//       .skip(perPage * (page - 1))
//       .limit(perPage)
//       .exec();

//     console.log("data", data);

//     $aggregate.push({
//       $count: "total",
//     });
//     const count = await model.aggregate($aggregate).exec();

//     const total = count.length ? count[0].total : 0;

//     //create system logs
//     let systemLogsData = {
//       userId: request.user._id,
//       userIp: request.ip,
//       roleId: request.user.roleId,
//       module: moduleName,
//       action: "getAll",
//       data: data,
//     };
//     let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

//     let respData = {
//       mabrurProducts: data,
//       pagination: {
//         total: total,
//         perPage: perPage,
//         current: page,
//         first: 1,
//         last: total ? Math.ceil(total / perPage) : 1,
//         next: page < Math.ceil(total / perPage) ? page + 1 : "",
//       },
//     };
//     return sendResponse(
//       response,
//       moduleName,
//       200,
//       1,
//       responseMsgs.productsFetched,
//       // "Products fetched",
//       respData
//     );
//   } catch (error) {
//     console.log("--- getAll API error ---", error);
//     return sendResponse(
//       response,
//       moduleName,
//       500,
//       0,
//       responseMsgs.error_500
//       // "Something went wrong, please try again later."
//     );
//   }
// }

/** Get all records **/

async function getAll(request, response) {
  let params = request.query;
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "HajjUmmrahPlannerController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "HajjUmmrahPlannerController"
  );
  try {
    const model = await ProductModel;

    let page = params.startAt ? parseInt(params.startAt) : 1;
    let perPage = params.perPage ? parseInt(params.perPage) : 10;
    let sortBy = { createdAt: -1 };

    // const $aggregate = [
    //   {
    //     $lookup: {
    //       from: "systemUsers",
    //       localField: "createdBy",
    //       foreignField: "_id",
    //       as: "createdByDetails",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$createdByDetails",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "mabrurProductDetails",
    //       localField: "_id",
    //       foreignField: "productId",
    //       as: "productDetails",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$productDetails",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $match: {
    //       status: "active",
    //       // "productDetails.growthRate": "0.06",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       title: { $first: "$title." + lang },
    //       description: { $first: "$description." + lang },
    //       productType: { $first: "$productType." + lang },
    //       status: { $first: "$status" },
    //       createdBy: { $first: "$createdByDetails.fullName" },
    //       isAvailable: { $first: "$isAvailable" },
    //       createdAt: { $first: "$createdAt" },
    //       agesArray: {
    //         $push: {
    //           age: "$productDetails.age",
    //           term: "$productDetails.term",
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       title: 1,
    //       description: 1,
    //       productType: 1,
    //       status: 1,
    //       createdBy: 1,
    //       isAvailable: 1,
    //       createdAt: 1,
    //       config: {
    //         agesArray: {
    //           $map: {
    //             input: {
    //               $setUnion: {
    //                 $map: {
    //                   input: "$agesArray",
    //                   as: "ageItem",
    //                   in: "$$ageItem.age",
    //                 },
    //               },
    //             },
    //             as: "age",
    //             in: {
    //               // title: { $toString: "$$age" },
    //               title: "$$age",
    //               // Get the minimum term directly instead of as an object
    //               min: {
    //                 $min: {
    //                   $map: {
    //                     input: {
    //                       $filter: {
    //                         input: "$agesArray",
    //                         as: "item",
    //                         cond: { $eq: ["$$item.age", "$$age"] },
    //                       },
    //                     },
    //                     as: "item",
    //                     in: "$$item.term", // Get only the term
    //                   },
    //                 },
    //               },
    //               // Get the maximum term directly instead of as an object
    //               max: {
    //                 $max: {
    //                   $map: {
    //                     input: {
    //                       $filter: {
    //                         input: "$agesArray",
    //                         as: "item",
    //                         cond: { $eq: ["$$item.age", "$$age"] },
    //                       },
    //                     },
    //                     as: "item",
    //                     in: "$$item.term", // Get only the term
    //                   },
    //                 },
    //               },
    //               step: {
    //                 $size: {
    //                   $filter: {
    //                     input: "$agesArray",
    //                     as: "item",
    //                     cond: { $eq: ["$$item.age", "$$age"] },
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // ];

    const $aggregate = [
      {
        $match: { status: "active" },
      },
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
      {
        $lookup: {
          from: "mabrurProductDetails",
          localField: "_id",
          foreignField: "productId",
          as: "productDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          status: "active",
          // "productDetails.growthRate": "0.06",
        },
      },
      // Step 1: Group by productId and find the minimum growthRate
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title." + lang },
          description: { $first: "$description." + lang },
          productType: { $first: "$productType." + lang },
          status: { $first: "$status" },
          createdBy: { $first: "$createdByDetails.fullName" },
          isAvailable: { $first: "$isAvailable" },
          createdAt: { $first: "$createdAt" },
          minGrowthRate: { $min: "$productDetails.growthRate" }, // Find the smallest growth rate per product
          productDetails: { $push: "$productDetails" },
        },
      },
      // Step 2: Filter only the details where growthRate matches minGrowthRate
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          productType: 1,
          status: 1,
          createdBy: 1,
          isAvailable: 1,
          createdAt: 1,
          productDetails: {
            $filter: {
              input: "$productDetails",
              as: "detail",
              cond: { $eq: ["$$detail.growthRate", "$minGrowthRate"] }, // Only keep smallest growthRate
            },
          },
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          description: { $first: "$description" },
          productType: { $first: "$productType" },
          status: { $first: "$status" },
          createdBy: { $first: "$createdBy" },
          isAvailable: { $first: "$isAvailable" },
          createdAt: { $first: "$createdAt" },
          agesArray: {
            $push: {
              age: "$productDetails.age",
              term: "$productDetails.term",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          productType: 1,
          status: 1,
          createdBy: 1,
          isAvailable: 1,
          createdAt: 1,
          config: {
            agesArray: {
              $map: {
                input: {
                  $setUnion: {
                    $map: {
                      input: "$agesArray",
                      as: "ageItem",
                      in: "$$ageItem.age",
                    },
                  },
                },
                as: "age",
                in: {
                  title: "$$age",
                  min: {
                    $min: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$agesArray",
                            as: "item",
                            cond: { $eq: ["$$item.age", "$$age"] },
                          },
                        },
                        as: "item",
                        in: "$$item.term",
                      },
                    },
                  },
                  max: {
                    $max: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$agesArray",
                            as: "item",
                            cond: { $eq: ["$$item.age", "$$age"] },
                          },
                        },
                        as: "item",
                        in: "$$item.term",
                      },
                    },
                  },
                  step: {
                    $size: {
                      $filter: {
                        input: "$agesArray",
                        as: "item",
                        cond: { $eq: ["$$item.age", "$$age"] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ];

    let data = await model
      .aggregate($aggregate)
      .sort(sortBy)
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    // Re-use the same aggregation for counting
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
      mabrurProducts: data,
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
      responseMsgs.productsFetched,
      respData
    );
  } catch (error) {
    console.log("--- getAll API error ---", error);
    return sendResponse(response, moduleName, 500, 0, responseMsgs.error_500);
  }
}

/** Get details **/
async function getDetails(request, response) {
  let params = request.params;
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "HajjUmmrahPlannerController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "HajjUmmrahPlannerController"
  );
  try {
    /** set model to fetch **/
    const model = await ProductDetailsModel;

    $aggregate = {
      $match: {
        productId: new ObjectId(params.productId),
      },
    };
    let $project = {
      _id: "$_id",
      age: "$age",
      term: "$term",
    };

    let data = await model.aggregate([$aggregate]).project($project).exec();

    //create system logs
    let systemLogsData = {
      userId: request.user._id,
      userIp: request.ip,
      roleId: request.user.roleId,
      module: moduleName,
      action: "getDetails",
      data: data,
    };
    let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

    let respData = {
      mabrurProductDetails: data,
    };
    return sendResponse(
      response,
      moduleName,
      200,
      1,
      responseMsgs.productsFetched,
      // "Products fetched",
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

/** Get plan **/
async function getPlan(request, response) {
  let params = request.query;
  let growthRate = params.growthRate ? params.growthRate : "0.1";
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "HajjUmmrahPlannerController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "HajjUmmrahPlannerController"
  );

  try {
    /** set model to fetch ***/
    const model = await ProductDetailsModel;

    $aggregate = [
      {
        $lookup: {
          from: "mabrurProducts",
          localField: "_id",
          foreignField: "productId",
          as: "mabrurProduct",
        },
      },
      {
        $unwind: {
          path: "$mabrurProduct",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    console.log("params---", params);
    let filter = {
      productId: new ObjectId(params.productId),
      age: parseInt(params.age),
      term: parseInt(params.term),
      // growthRate:growthRate
    };
    $aggregate.push({
      $match: filter,
    });

    let data = await model.aggregate([$aggregate]).exec();

    if (data && data.length && data.length > 0) {
      //create system logs
      let systemLogsData = {
        userId: request.user._id,
        userIp: request.ip,
        roleId: request.user.roleId,
        module: moduleName,
        action: "getPlan",
        data: data,
      };
      let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

      let savingJourneyData = mapSavingsData(data, growthRate);
      let profitJourneyData = {
        profits: savingJourneyData.contribution,
        returns: savingJourneyData.returns,
      };

      let respData = {
        valuation: mapValutionData(data),
        savingJourney: savingJourneyData,
        profitJourney: profitJourneyData,
      };
      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.productsFetched,
        // "Products fetched",
        respData
      );
    } else {
      filter = {
        productId: new ObjectId(params.productId),
        age: parseInt(params.age),
      };
      let getTerms = await ProductDetailsModel.find(filter, {
        _id: 0,
        term: 1,
      });
      if (getTerms && getTerms.length && getTerms.length > 0) {
        const terms = getTerms.map((item) => item.term);
        const distinctTerms = Array.from(new Set(terms));

        return sendResponse(
          response,
          moduleName,
          422,
          0,
          responseMsgs.termsMsg + distinctTerms
          // "Please use the following terms for the given age in selected product. " +
          //   distinctTerms
        );
      }
    }

    return sendResponse(
      response,
      moduleName,
      422,
      0,
      responseMsgs.recordNotFound
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

function mapValutionData(data) {
  // Step 1: Find the record with the lowest growth rate
  const lowestGrowthRateRecord = data.reduce((lowest, current) => {
    return parseFloat(current.growthRate) < parseFloat(lowest.growthRate)
      ? current
      : lowest;
  }, data[0]);

  // Step 2: Extract required details from the lowest growth rate record
  const output = {
    age: lowestGrowthRateRecord.age,
    term: lowestGrowthRateRecord.term,
    annualContribution: lowestGrowthRateRecord.annualContribution,
    deathBenefit: lowestGrowthRateRecord.deathBenefit,
    estimatedData: {},
  };

  // Step 3: Collect the last year's value from each growth rate and format key as specified
  data.forEach((item) => {
    const rateKey = `${(parseFloat(item.growthRate) * 100).toFixed(0)}per`;
    output.estimatedData[rateKey] = item.years[item.years.length - 1];
  });

  return output;
}
function mapSavingsData(data, growthRate) {
  const filteredRecords = data.filter(
    (record) => record.growthRate === growthRate.toString()
  );

  let currentYear = new Date().getFullYear();
  let arry = [];
  // Space for additional logic
  filteredRecords.forEach((record) => {
    // Example of additional logic: Calculate a simple projected growth
    let s = record.years[record.years.length - 1];
    let c = record.annualContribution * record.term;

    record.savingValue = s;
    record.contribution = c;
    record.returns = s - c;
    record.matrix = growthRate;

    for (let i = 0; i < record.years.length; i++) {
      arry.push({
        year: currentYear + i,
        contribution: record.annualContribution * (i + 1),
        return: record.years[i],
        زرتعاون: record.annualContribution * (i + 1),
        نفع: record.years[i],
      });
    }
    record.graphData = arry;
  });

  return filteredRecords[0];
}

/** Get plan **/
async function getPlanTest(request, response) {
  let params = request.query;
  let growthRate = params.growthRate ? params.growthRate : "0.1";
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "HajjUmmrahPlannerController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "HajjUmmrahPlannerController"
  );

  try {
    /** set model to fetch ***/
    const model = await ProductDetailsModel;

    $aggregate = [
      {
        $lookup: {
          from: "mabrurProducts",
          localField: "_id",
          foreignField: "productId",
          as: "mabrurProduct",
        },
      },
      {
        $unwind: {
          path: "$mabrurProduct",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    console.log("params---", params);
    let filter = {
      productId: new ObjectId(params.productId),
      age: parseInt(params.age),
      term: parseInt(params.term),
      // growthRate:growthRate
    };
    $aggregate.push({
      $match: filter,
    });

    let data = await model.aggregate([$aggregate]).exec();

    if (data && data.length && data.length > 0) {
      //create system logs
      let systemLogsData = {
        userId: request.user._id,
        userIp: request.ip,
        roleId: request.user.roleId,
        module: moduleName,
        action: "getPlan",
        data: data,
      };
      let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);
      // console.log("Data ==>> ", data);

      const distinctGrowthRates = getDistinctGrowthRates(data);
      console.log("Growth Rates ==> ", distinctGrowthRates); // Output: [ '0.06', '0.1', '0.13' ]

      let savingJourneyDataFirst = mapSavingsDataTest(
        data,
        distinctGrowthRates[0]
      );
      let profitJourneyDataFirst = {
        profits: savingJourneyDataFirst.contribution,
        returns: savingJourneyDataFirst.returns,
      };

      let savingJourneyDataSecond = mapSavingsDataTest(
        data,
        distinctGrowthRates[1]
      );

      let savingJourneyDataThird = mapSavingsDataTest(
        data,
        distinctGrowthRates[2]
      );
      let profitJourneyDataThird = {
        profits: savingJourneyDataThird.contribution,
        returns: savingJourneyDataThird.returns,
      };

      // Merging graphData for both journeys
      let mergedGraphData = savingJourneyDataFirst.graphData.map(
        (firstData, index) => {
          let thirdData = savingJourneyDataThird.graphData[index]; // Get corresponding second growth rate data
          return {
            year: firstData.year, // Year remains the same
            contribution: firstData.contribution, // Contribution remains the same
            returnFirst: firstData.return, // Return from first growth rate(0.06)
            returnThird: thirdData.return, // Return from second growth rate (0.13)
            زرتعاون: firstData["زرتعاون"], // کل تعاون کی رقم
            نفع_پہلی_شرح: firstData["نفع"], // پہلی شرح نمو (0.06) کے لیے نفع
            نفع_تیسری_شرح: thirdData["نفع"], // دوسری شرح نمو (0.13) کے لیے نفع
          };
        }
      );

      // // Remove graphData from saving journeys
      delete savingJourneyDataFirst.graphData;
      delete savingJourneyDataSecond.graphData;
      delete savingJourneyDataThird.graphData;
      const mapValuationData = mapValutionDataTest(data, distinctGrowthRates);
      const estimatedData = mapValuationData.estimatedData;
      delete mapValuationData.estimatedData;
      let respData = {
        valuation: mapValuationData,
        estimatedData: estimatedData,
        savingJourneyFirst: savingJourneyDataFirst,
        profitJourneyFirst: profitJourneyDataFirst,
        savingJourneySecond: savingJourneyDataSecond,
        savingJourneyThird: savingJourneyDataThird,
        profitJourneyThird: profitJourneyDataThird,
        graphData: mergedGraphData,
      };
      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.productsFetched,
        // "Products fetched",
        respData
      );
    } else {
      filter = {
        productId: new ObjectId(params.productId),
        age: parseInt(params.age),
      };
      let getTerms = await ProductDetailsModel.find(filter, {
        _id: 0,
        term: 1,
      });
      if (getTerms && getTerms.length && getTerms.length > 0) {
        const terms = getTerms.map((item) => item.term);
        const distinctTerms = Array.from(new Set(terms));

        return sendResponse(
          response,
          moduleName,
          422,
          0,
          responseMsgs.termsMsg + distinctTerms
          // "Please use the following terms for the given age in selected product. " +
          //   distinctTerms
        );
      }
    }

    return sendResponse(
      response,
      moduleName,
      422,
      0,
      responseMsgs.recordNotFound
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
function getDistinctGrowthRates(data) {
  return [...new Set(data.map((item) => item.growthRate))].sort(
    (a, b) => a - b
  );
}
function mapValutionDataTest(data, distinctGrowthRates) {
  // Step 1: Find the record with the lowest growth rate
  const lowestGrowthRateRecord = data.reduce((lowest, current) => {
    return parseFloat(current.growthRate) < parseFloat(lowest.growthRate)
      ? current
      : lowest;
  }, data[0]);

  console.log("lowestGrowthRateRecord ==> ", lowestGrowthRateRecord);

  // Step 2: Extract required details from the lowest growth rate record
  const output = {
    age: lowestGrowthRateRecord.age,
    term: lowestGrowthRateRecord.term,
    annualContribution: lowestGrowthRateRecord.annualContribution,
    deathBenefit: lowestGrowthRateRecord.deathBenefit,
    estimatedData: {},
  };

  console.log("output", output);

  // Step 3: Collect the last year's value from each growth rate and format key as specified
  // data.forEach((item) => {
  //   const rateKey = `${(parseFloat(item.growthRate) * 100).toFixed(0)}per`;
  //   output.estimatedData[rateKey] = item.years[item.years.length - 1];
  // });

  // data.forEach((item) => {
  //   if (item.growthRate === "0.06") return; // Skip this item

  //   const rateKey = `${(parseFloat(item.growthRate) * 100).toFixed(0)}per`;
  //   output.estimatedData[rateKey] = item.years[item.years.length - 1];
  // });

  let count = 0;
  data.sort((a, b) => parseFloat(a.growthRate) - parseFloat(b.growthRate));

  data.forEach((item) => {
    // if (item.growthRate === "0.06") return; // Skip this item
    if (item.growthRate === distinctGrowthRates[1]) return; // Skip this item

    count++;
    const key = count === 1 ? "first" : count === 2 ? "third" : `key${count}`;
    output.estimatedData[key] = {
      title: (parseFloat(item.growthRate) * 100).toFixed(0),
      value: item.years[item.years.length - 1],
    };
  });

  return output;
}
function mapSavingsDataTest(data, growthRate) {
  const filteredRecords = data.filter(
    (record) => record.growthRate === growthRate.toString()
  );

  let currentYear = new Date().getFullYear();
  let arry = [];
  // Space for additional logic
  filteredRecords.forEach((record) => {
    // Example of additional logic: Calculate a simple projected growth
    console.log("Record === >", record);
    let s = record.years[record.years.length - 1];
    let c = record.annualContribution * record.term;

    console.log("s", s);
    console.log("c", c);

    record.savingValue = s;
    record.contribution = c;
    record.returns = s - c;
    record.matrix = growthRate;

    for (let i = 0; i < record.years.length; i++) {
      arry.push({
        year: currentYear + i,
        contribution: record.annualContribution * (i + 1),
        return: record.years[i],
        زرتعاون: record.annualContribution * (i + 1),
        نفع: record.years[i],
      });
    }
    record.graphData = arry;
  });

  return filteredRecords[0];
}
