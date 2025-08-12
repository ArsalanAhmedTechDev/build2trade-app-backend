// includes
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const sanitize = require("mongo-sanitize");

// Models
const CitiesModel = require("../../models/Cities");
const ServiceRequestModel = require("../../models/ServiceRequests");
const FundPricesModel = require("../../models/FundPrices");
const NotificationStatusModel = require("../../models/NotificationStatus");
const SingleNotificationModel = require("../../models/SingleNotification");
const ComplaintTypesModel = require("../../models/ComplaintTypes");
const SettingModel = require("../../models/Settings");
const TradesModel = require("../../models/Trades");
const SubTradesModel = require("../../models/SubTrades");
const {
  filterPolicies,
} = require("../../controllers/Customer/CustomerController");

const {
  sendResponse,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
  authenticate,
  getPolicyDetails,
} = require("../../helpers/utils");

// module name
let moduleName;
let responseMsgs;
var lang = "english";
// const coreAPIUrl = process.env.CORE_API_URL;

module.exports = {
  getPolicyDropdown,
  getAllListings,
  getAllConfigurations,
};

/** Get All Listings For Dropdowns model **/
async function getAllListings(request, response) {
  try {
    console.log("ALL LISTING API...............");
    lang = request.header("lang") ? request.header("lang") : lang;
    moduleName = await getModuleNameFromLanguage(
      lang,
      "ConfigurationsController"
    );
    responseMsgs = await getResponseMsgsFromLanguage(
      lang,
      "ConfigurationsController"
    );

    // let cities = await City.find({});
    let data = {};
    let cities = await CitiesModel.find({});
    data.cities = cities;
    if (data) {
      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.lovsFetched,
        // "All Listings fetched successfully",
        data
      );
    }

    return sendResponse(
      response,
      moduleName,
      500,
      0,
      responseMsgs.lovsNotFetched
      // "Failed to get all listings"
    );
  } catch (error) {
    console.log("--- Get All Listings API Error ---", error);
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

async function getServiceRequestDropdown(lang) {
  try {
    let serviceRequests = await ServiceRequestModel.find({
      status: "active",
      isAgent: false,
    });

    if (!serviceRequests || serviceRequests.length === 0) {
      return false;
    }

    // Transform the data
    const transformedData = serviceRequests.map((item) => ({
      label: item.title[lang], // Dynamically access the title property using the lang variable
      value: item._id,
    }));

    return transformedData;
  } catch (error) {
    console.error("--- Get Service Request Dropdown API Error ---", error);
    return false;
  }
}

/** Get Policy Dropdown **/
async function getPolicyDropdown(cnic) {
  try {
    let auth = await authenticate();
    console.log("this is the auth response----", auth);

    if (auth) {
      let policy = await getPolicyDetails(cnic, auth);

      if (policy) {
        let filteredPolicies = filterPolicies(policy);

        if (!filteredPolicies || filteredPolicies.length === 0) {
          return false;
        }

        console.log("filteredPolicies", filteredPolicies);
        // Transform the data
        const transformedData = filteredPolicies.map((item) => ({
          label: item.PolicyNo,
          value: item.PolicyNo,
        }));

        return transformedData;
      }
      return false;
    }
    return false;
  } catch (error) {
    console.log("--- Get Policy Dropdown API Error ---", error);
    return false;
  }
}

async function getComplaintTypesDropdown(lang) {
  try {
    let complaintTypeData = await ComplaintTypesModel.find({
      status: "active",
    });

    if (!complaintTypeData || complaintTypeData.length === 0) {
      return false;
    }

    // Transform the data
    const transformedData = complaintTypeData.map((item) => ({
      label: item.title[lang], // Dynamically access the title property using the lang variable
      value: item._id,
    }));

    return transformedData;
  } catch (error) {
    console.error("--- Get Complaint Types Dropdown API Error ---", error);
    return false;
  }
}

// /** Get All Configurations **/
// async function getAllConfigurations(request, response) {
//   try {
//     console.log("ALL LISTING API...............");

//     lang = request.header("lang") ? request.header("lang") : lang;
//     moduleName = await getModuleNameFromLanguage(
//       lang,
//       "ConfigurationsController"
//     );
//     responseMsgs = await getResponseMsgsFromLanguage(
//       lang,
//       "ConfigurationsController"
//     );

//     // return sendResponse(
//     //   response,
//     //   moduleName,
//     //   200,
//     //   1,
//     //   responseMsgs.recordFetched,
//     //   {
//     //     dailyfundprices: {
//     //       latestTransactionDate: "2024-12-31T00:00:00.000Z",
//     //     },
//     //     notifications: {
//     //       unreadCount: 0,
//     //     },
//     //     singleNotification: {
//     //       isShow: true,
//     //       fileName: "customerNotifications/file-1745872113119.png",
//     //     },
//     //     serviceRequestsDropdown: [
//     //       {
//     //         label: "Change Fund",
//     //         value: "674d91cb2d8c8d4bfda09bfe",
//     //       },
//     //       {
//     //         label: "ddsadas",
//     //         value: "674f14d3a7ffb27592fbefc6",
//     //       },
//     //     ],
//     //     policiesDropdown: [
//     //       {
//     //         label: "UL2023/000001168-1",
//     //         value: "UL2023/000001168-1",
//     //       },
//     //       {
//     //         label: "5PUL2023000002375-1",
//     //         value: "5PUL2023000002375-1",
//     //       },
//     //       {
//     //         label: "5PUL2024000004800-1",
//     //         value: "5PUL2024000004800-1",
//     //       },
//     //     ],
//     //     complaintTypesDropdown: [
//     //       {
//     //         label: "Test case 1",
//     //         value: "682737d729157a340191a293",
//     //       },
//     //     ],
//     //   }
//     // );

//     const userId = request.user._id;
//     const userCnic = request.user.cnic;

//     const data = {
//       dailyfundprices: {},
//       notifications: {
//         unreadCount: 0,
//       },
//       singleNotification: {
//         isShow: false,
//         fileName: "",
//       },
//       settings: {},
//       serviceRequestsDropdown: [],
//       policiesDropdown: [],
//       complaintTypesDropdown: [],
//     };

//     // Get the start of today//
//     const startOfToday = new Date();
//     startOfToday.setHours(0, 0, 0, 0);

//     // Query to count unread notifications for the "New" section
//     const unreadCount = await NotificationStatusModel.countDocuments({
//       userId: new ObjectId(userId),
//       readStatus: false,
//       createdAt: { $gte: startOfToday }, // Created today
//     });
//     data.notifications.unreadCount = unreadCount || 0;

//     // Retrieve the latest transaction date from FundPricesModel
//     const fundPricesTransactionDate = await FundPricesModel.findOne({})
//       .sort({ transactionDate: -1 })
//       .select("transactionDate");
//     data.dailyfundprices.latestTransactionDate =
//       fundPricesTransactionDate?.transactionDate || null;

//     let serviceRequests = await getServiceRequestDropdown(lang);
//     if (serviceRequests) {
//       data.serviceRequestsDropdown = serviceRequests || "";
//     }

//     let complaintTypes = await getComplaintTypesDropdown(lang);
//     if (complaintTypes) {
//       data.complaintTypesDropdown = complaintTypes || "";
//     }

//     let policies = await getPolicyDropdown(request.user.cnic);
//     if (policies) {
//       data.policiesDropdown = policies || "";
//     }

//     // Find the first document where the Agent Code matches
//     const singleNotificationUser = await SingleNotificationModel.findOne({
//       "customer.cnics": userCnic,
//     });

//     if (
//       singleNotificationUser &&
//       singleNotificationUser.customer &&
//       singleNotificationUser.customer.fileName
//     ) {
//       data.singleNotification.isShow = true;
//       data.singleNotification.fileName =
//         singleNotificationUser.customer.fileName;
//     }

//     // Find customer settings (only isCashValueShow)
//     const customerOnly = await SettingModel.findOne(
//       {},
//       { "customer.isCashValueShow": 1, _id: 0 }
//     );

//     // Set directly inside data.setting
//     data.setting = {
//       isCashValueShow: customerOnly?.customer?.isCashValueShow ?? null,
//     };

//     if (data) {
//       return sendResponse(
//         response,
//         moduleName,
//         200,
//         1,
//         responseMsgs.recordFetched,
//         data
//       );
//     }

//     return sendResponse(
//       response,
//       moduleName,
//       500,
//       0,
//       responseMsgs.recordNotFound
//     );
//   } catch (error) {
//     console.log("--- Get All Configurations API Error ---", error);
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

/** Get All Configurations **/
async function getAllConfigurations(request, response) {
  try {
    console.log("ALL LISTING API...............");

    const data = {
      notifications: {
        unreadCount: 0,
      },
      tradesDropdown: [],
      tradesWithSubTrades: [],
    };

    // Get trades
    let TradesData = await TradesModel.find({
      status: "active",
    });

    if (TradesData && TradesData.length) {
      // TradesDropdown as it is
      data.tradesDropdown = TradesData.map((item) => ({
        label: item.title,
        value: item._id,
      }));

      // TradesWithSubTrades
      const tradesWithSubTrades = await Promise.all(
        TradesData.map(async (trade) => {
          const subTrades = await SubTradesModel.find({
            tradeId: trade._id,
            status: "active",
            $or: [
              { type: "manual" },
              { createdBy: request.user._id }
            ]
          });

          return {
            type: trade.type,
            label: trade.title,
            value: trade._id,
            subTrades: subTrades.map((sub) => ({
              type: sub.type,
              label: sub.title,
              value: sub._id,
            })),
          };
        })
      );

      data.tradesWithSubTrades = tradesWithSubTrades;
    }

    return sendResponse(
      response,
      moduleName,
      200,
      1,
      "Configurations fetched successfully",
      data
    );
  } catch (error) {
    console.log("--- Get All Configurations API Error ---", error);
    return sendResponse(
      response,
      moduleName,
      500,
      0,
      "Something went wrong, please try again later."
    );
  }
}
