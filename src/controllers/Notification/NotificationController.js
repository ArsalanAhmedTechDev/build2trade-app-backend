// Models
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const sanitize = require("mongo-sanitize");
const NotificationsModel = require("../../models/Notifications");
const NotificationStatusModel = require("../../models/NotificationStatus");

// helper functions
const systemLogsHelper = require("../../helpers/system-logs");
const {
  sendResponse,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
} = require("../../helpers/utils");

// module name
// const moduleName = 'Notifications'
// var lang= "english"
let moduleName;
let responseMsgs;
var lang = "english";

module.exports = {
  // getAllOld,
  markReadNotification,
  getAll,
};
// /** Get all records * */
// async function getAllOld(request, response) {
//   let params = request.query;
//   lang = request.header("lang") ? request.header("lang") : lang;
//   moduleName = await getModuleNameFromLanguage(lang, "NotificationController");
//   responseMsgs = await getResponseMsgsFromLanguage(
//     lang,
//     "NotificationController"
//   );

//   try {
//     /** set model to fetch all **/
//     const model = await NotificationsModel;

//     /**  how to sort the list  **/
//     let sortBy = { createdAt: -1 };

//     $aggregate = [
//       // {
//       //     $lookup: {
//       //         from: "systemUsers",
//       //         localField: "createdBy",
//       //         foreignField: "_id",
//       //         as: "createdByDetails"
//       //     }
//       // },
//       // {
//       //     $unwind: {
//       //         path: '$createdByDetails',
//       //         preserveNullAndEmptyArrays:true,
//       //     },
//       // },
//     ];

//     let $project = {
//       _id: 0,
//       title: "$title." + lang,
//       message: "$message." + lang,
//       createdAt: "$createdAt",
//     };

//     let data = await model
//       .aggregate([$aggregate])
//       .project($project)
//       .sort(sortBy)
//       .limit(6)
//       .exec();

//     let mod = categorizeNotificationsOld(data);
//     console.log("----data----", data);
//     console.log("----data----", mod);

//     //create system logs
//     let systemLogsData = {
//       userId: request.user._id,
//       userIp: request.ip,
//       roleId: request.user.roleId,
//       module: moduleName,
//       action: "getAll",
//       data: mod,
//     };
//     let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

//     let respData = {
//       notifications: mod,
//     };
//     return sendResponse(
//       response,
//       moduleName,
//       200,
//       1,
//       responseMsgs.recordFetched,
//       // "Records fetched",
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

// const categorizeNotificationsOld = (notifications) => {
//   const currentDate = new Date();
//   const oneDay = 24 * 60 * 60 * 1000;
//   const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));
//   const startOfTomorrow = new Date(startOfToday.getTime() + oneDay);
//   const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * oneDay);
//   const thirtyDaysAgo = new Date(startOfToday.getTime() - 30 * oneDay);

//   const periods = {
//     New: [],
//     "Past 7 days": [],
//     "Past 30 days": [],
//   };
//   notifications.forEach((notification) => {
//     const createdAt = new Date(notification.createdAt);
//     const formattedNotification = {
//       title: notification.title,
//       message: notification.message,
//       time: createdAt.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//     };

//     if (createdAt >= startOfToday && createdAt < startOfTomorrow) {
//       periods["New"].push(formattedNotification);
//     } else if (createdAt >= sevenDaysAgo && createdAt < startOfToday) {
//       periods["Past 7 days"].push(formattedNotification);
//     } else if (createdAt >= thirtyDaysAgo && createdAt < sevenDaysAgo) {
//       periods["Past 30 days"].push(formattedNotification);
//     }
//   });

//   return [
//     { period: "New", notifications: periods["New"] },
//     { period: "Past 7 days", notifications: periods["Past 7 days"] },
//     { period: "Past 30 days", notifications: periods["Past 30 days"] },
//   ].filter((period) => period.notifications.length > 0);
// };

async function markReadNotification(request, response) {
  try {
    lang = request.header("lang") ? request.header("lang") : lang;
    moduleName = await getModuleNameFromLanguage(
      lang,
      "NotificationController"
    );
    responseMsgs = await getResponseMsgsFromLanguage(
      lang,
      "NotificationController"
    );
    const userId = sanitize(request.user._id);
    const notificationId = sanitize(request.body.notificationId);

    // Validate notificationId and userId here if necessary

    const updated = await NotificationStatusModel.findOneAndUpdate(
      { _id: notificationId, userId },
      {
        $set: {
          readStatus: true,
          updatedAt: new Date(),
        },
      },
      { new: true } // Add this option to return the updated document
    );

    if (updated) {
      // Create system logs
      const systemLogsData = {
        userId: request.user._id,
        userIp: request.ip,
        roleId: request.user.roleId,
        module: moduleName,
        action: "updated",
        data: updated,
      };
      await systemLogsHelper.composeSystemLogs(systemLogsData);

      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.updatedMsg
      );
    }
    return sendResponse(
      response,
      moduleName,
      404,
      0,
      responseMsgs.recordNotFound
    );
  } catch (error) {
    console.error("Error in markReadNotification:", error);
    return sendResponse(response, moduleName, 500, 0, responseMsgs.error_500);
  }
}

async function getAll(request, response) {
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(lang, "NotificationController");
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "NotificationController"
  );

  try {
    // Convert user ID to ObjectId
    const userId = request.user._id;
    console.log("userId", userId);
    let data = await NotificationStatusModel.aggregate([
      // Step 1: Match the specific user ID
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      // Step 2: Sort by `createdAt` in descending order
      {
        $sort: {
          createdAt: -1,
        },
      },
      // Step 3: Limit to the 10 most recent records
      {
        $limit: 15,
      },
      // Step 4: Lookup from `notifications` collection
      {
        $lookup: {
          from: "notifications",
          localField: "notificationContentId",
          foreignField: "_id",
          as: "notificationDetails",
        },
      },
      // Unwind the `notificationDetails` array to include the first matched object
      {
        $unwind: "$notificationDetails",
      },
      // Step 5: Project the desired fields
      {
        $project: {
          _id: 1,
          notificationContentId: 1,
          userId: 1,
          readStatus: 1,
          title: `$notificationDetails.title.${lang}`,
          message: `$notificationDetails.message.${lang}`,
          createdAt: 1,
        },
      },
      // Step 6: Group to count readStatus true/false
      {
        $group: {
          _id: null,
          notifications: { $push: "$$ROOT" },
          unReadCount: {
            $sum: { $cond: [{ $eq: ["$readStatus", false] }, 1, 0] },
          },
          readCount: {
            $sum: { $cond: [{ $eq: ["$readStatus", true] }, 1, 0] },
          },
        },
      },
      // Step 7: Format the output
      {
        $project: {
          _id: 0,
          notifications: 1,
          unReadCount: 1,
          readCount: 1,
        },
      },
    ]);

    console.log("Data", data);

    if (data[0]?.notifications) {
      // Step 8: Categorize the notifications
      const categorizedData = categorizeNotifications(data[0].notifications);

      // Step 9: Prepare the response in the required structure
      const respData = {
        notifications: categorizedData,
        unReadCount: data[0]?.unReadCount || 0,
        readCount: data[0]?.readCount || 0,
      };

      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.recordFetched,
        respData
      );
    } else {
      // Handle case where there are no notifications
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        responseMsgs.recordNotFound, // Assuming there's a message for this case
        {
          notifications: [],
          unReadCount: 0,
          readCount: 0,
        }
      );
    }
  } catch (error) {
    console.error("--- getAll API error ---", error);
    return sendResponse(response, moduleName, 500, 0, responseMsgs.error_500);
  }
}

const categorizeNotifications = (notifications) => {
  const currentDate = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));
  const startOfTomorrow = new Date(startOfToday.getTime() + oneDay);
  const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * oneDay);
  const thirtyDaysAgo = new Date(startOfToday.getTime() - 30 * oneDay);

  const periods = {
    New: [],
    "Past 7 days": [],
    "Past 30 days": [],
  };

  notifications.forEach((notification) => {
    const createdAt = new Date(notification.createdAt);
    const formattedNotification = {
      _id: notification._id,
      notificationContentId: notification.notificationContentId,
      userId: notification.userId,
      readStatus: notification.readStatus,
      title: notification.title,
      message: notification.message,
      time: createdAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (createdAt >= startOfToday && createdAt < startOfTomorrow) {
      periods["New"].push(formattedNotification);
    } else if (createdAt >= sevenDaysAgo && createdAt < startOfToday) {
      periods["Past 7 days"].push(formattedNotification);
    } else if (createdAt >= thirtyDaysAgo && createdAt < sevenDaysAgo) {
      periods["Past 30 days"].push(formattedNotification);
    }
  });

  return [
    { period: "New", notifications: periods["New"] },
    { period: "Past 7 days", notifications: periods["Past 7 days"] },
    { period: "Past 30 days", notifications: periods["Past 30 days"] },
  ].filter((period) => period.notifications.length > 0);
};
