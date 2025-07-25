// includes
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const sanitize = require("mongo-sanitize");
const axios = require("axios");
const zlib = require("zlib");
// const sharp = require("sharp");
// const im = require("imagemagick-native");
const FormData = require("form-data"); // Ensure form-data is installed

// Models
const ServiceRequestModel = require("../../models/ServiceRequests");
// const RequestFormModel = require("../../models/RequestForms");

// helper functions
const systemLogsHelper = require("../../helpers/system-logs");
const {
  sendResponse,
  checkKeysExist,
  updateLanguageContent,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
  authenticateLoginCRM,
  createRequestFormInCRM,
  getAllRequestFormsFromCRM,
} = require("../../helpers/utils");
const {
  getPolicyDropdown,
} = require("../../controllers/Configurations/ConfigurationsController");

// module name
// const moduleName = 'Products'
// var lang= "english"
let moduleName;
let responseMsgs;
var lang = "english";

module.exports = {
  getById,
  create,
  getAll,
};

/** Get Service Request by Id **/
async function getById(request, response) {
  let params = request.params;
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "ServiceRequestController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "ServiceRequestController"
  );

  try {
    /** set model to fetch **/
    const model = await ServiceRequestModel;

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
        _id: new ObjectId(params.serviceRequestId),
      },
    });

    let $project = {
      _id: "$_id",
      title: "$title." + lang,
      type: "$type",
      category: "$category",
      subCategory: "$subCategory",
      ISM: "$ISM",
      tags: "$tags." + lang,
      description: "$description." + lang,
      content: "$content." + lang,
      isZakatDoc: "$isZakatDoc",
      isAgent: "$isAgent",
      status: "$status",
      createdBy: "$createdByDetails.fullName",
      files: "$files." + lang,
      createdAt: "$createdAt",
    };

    let data = await model.aggregate([$aggregate]).project($project).exec();
    let responseData = null;
    if (data && data.length && data.length > 0) {
      responseData = data[0];
    }
    //create system logs
    let systemLogsData = {
      userId: request.user._id,
      userIp: request.ip,
      roleId: request.user.roleId,
      module: moduleName,
      action: "getById",
      data: responseData,
    };
    let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

    return sendResponse(
      response,
      moduleName,
      200,
      1,
      responseMsgs.serviceRequestFetched,
      // "Service Request fetched",
      responseData
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

/** Create Service Request **/
async function create(request, response) {
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "ServiceRequestController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "ServiceRequestController"
  );
  const { body: params, user, ip } = request;

  // Check if required keys are missing
  const missingKeys = await checkKeysExist(params, [
    "_id",
    "membershipNo",
    "uploads",
  ]);
  if (missingKeys) {
    return sendResponse(response, moduleName, 422, 0, missingKeys);
  }

  try {
    // Prepare request form data dynamically
    let serviceRequest = await ServiceRequestModel.findOne({
      _id: sanitize(params._id),
      status: "active",
      isAgent: false,
    });

    if (!serviceRequest) {
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        responseMsgs.serviceRequestNotFound
        // "Service Request Not found"
      );
    }

    const fileStorageLocation = process.env.FILE_SERVICE_URL;
    // Initialize FormData
    const formData = new FormData();

    // Add string fields to formData
    formData.append("CategoryId", serviceRequest?.category?.id || "");
    formData.append("SubCategoryId", serviceRequest?.subCategory?.id || "");
    formData.append("IsmId", serviceRequest?.ISM?.id || "");
    formData.append("MembershipNo", params?.membershipNo);

    if (serviceRequest?.tags?.english) {
      var tagNames =
        Array.isArray(serviceRequest.tags.english) &&
        serviceRequest.tags.english.length > 0
          ? serviceRequest.tags.english.map((tag) => tag.label).join(", ")
          : "";
    }
    if (serviceRequest?.files?.english) {
      const files = serviceRequest.files.english;

      // Generate comma-separated file names
      var fileNames =
        Array.isArray(files) && files.length > 0
          ? files.map((file) => file.label).join(", ")
          : "";
    }

    if (params.uploads) {
      // Extract all file paths from params.uploads
      const filePaths = Object.values(params.uploads);
      const fetchedFiles = await fetchFilesBinaryData(
        filePaths,
        fileStorageLocation
      );

      fetchedFiles.forEach((file, index) => {
        if (file) {
          // Append file with a dynamic extension
          formData.append(
            `files[]`,
            file.data,
            `file${index}.${file.extension}`
          );
          // formData.append(`files[]`, file.data);
        }
      });

      console.log("Files appended to formData successfully.");

      //   fetchedFiles.forEach((file, index) => {
      //     // formData.append(`files[${index}]`, file, `file${index}.png`); // Add file names if necessary
      //     formData.append(`files[]`, file); // Add file names if necessary
      //   });
    }
    // Add description field
    formData.append(
      "Description",
      `I am requesting a ${serviceRequest.title.english} as part of the system functionality. All prerequisites for this change have been fulfilled, and the required forms ${tagNames}, ${fileNames} have been attached to this request for verification and processing.`
    );
    if (formData) {
      console.log("==== Final Form Data ====", formData);

      const auth = await authenticateLoginCRM();
      if (auth) {
        const requestFormSent = await createRequestFormInCRM(auth, formData);
        console.log(
          "Request Form Response From 5th pillar API",
          requestFormSent
        );

        if (requestFormSent && requestFormSent?.StatusCode === "200") {
          return sendResponse(
            response,
            moduleName,
            200,
            1,
            responseMsgs.requestFormCreated,
            requestFormSent?.Data
            // "Request Form has been created successfully"
          );
        } else {
          return sendResponse(
            response,
            moduleName,
            422,
            0,
            responseMsgs.requestFormNotCreated
            // "Getting Error From 5th Pillar API"
          );
        }
      }
    }
  } catch (error) {
    console.error("--- Create Request Form API Error ---", error);
    return sendResponse(
      response,
      moduleName,
      500,
      0,
      responseMsgs.error_500
      //   "Something went wrong, please try again later."
    );
  }
}

//** function to fetch files from server **/
async function fetchFilesBinaryData(files, fileStorageLocation) {
  console.log("Fetching Files from Paths:", files);

  const filePromises = files.map(async (file) => {
    const fileUrl = `${fileStorageLocation}/${file}`;
    try {
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer", // Ensure binary data is fetched
      });

      // Extract the file extension dynamically
      const fileExtension = file.split(".").pop(); // Get the part after the last dot

      // Convert file size to MB or KB
      const fileSizeInBytes = Buffer.byteLength(response.data); // Get file size in bytes
      const fileSizeInKB = fileSizeInBytes / 1024; // Convert to KB
      const fileSizeInMB = fileSizeInKB / 1024; // Convert to MB

      // Print file size
      if (fileSizeInMB >= 1) {
        console.log(`${file}: ${fileSizeInMB.toFixed(2)} MB`);
      } else {
        console.log(`${file}: ${fileSizeInKB.toFixed(2)} KB`);
      }
      return {
        data: Buffer.from(response.data), // File data as Buffer
        extension: fileExtension, // File extension
      };
    } catch (error) {
      console.error(`Error fetching file from URL: ${fileUrl}`, error.message);
      return null; // Return null for failed files
    }
  });

  // Await all promises and filter out failed ones
  const fetchedFiles = (await Promise.all(filePromises)).filter(
    (file) => file !== null
  );

  // Log any skipped files (optional)
  if (fetchedFiles.length < files.length) {
    console.warn(
      `Skipped ${files.length - fetchedFiles.length} files due to errors.`
    );
  }

  return fetchedFiles; // Return an array of objects { data, extension }
}

/** Get All Request Forms **/
async function getAll(request, response) {
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(
    lang,
    "ServiceRequestController"
  );
  responseMsgs = await getResponseMsgsFromLanguage(
    lang,
    "ServiceRequestController"
  );
  try {
    // Prepare request form data dynamically
    const { user } = request;

    // if (user?.cnic) {
    //   // Fetch user policies
    //   let policies = await getPolicyDropdown(user.cnic);

    //   if (!policies || policies.length === 0) {
    //     return sendResponse(
    //       response,
    //       moduleName,
    //       200,
    //       1,
    //       responseMsgs.policiesNotFound
    //     );
    //   }
    //   console.log("User Policies:", policies);

    //   // Authenticate with CRM
    //   const auth = await authenticateLoginCRM();
    //   if (!auth) {
    //     return sendResponse(
    //       response,
    //       moduleName,
    //       200,
    //       1,
    //       responseMsgs.authFailed
    //     );
    //   }

    //   // Array to collect policy data
    //   const collectedPoliciesData = [];
    //   const getAllRequestForms = await getAllRequestFormsFromCRM(
    //     auth,
    //     policies
    //   );
    //   console.log(
    //     "Request Forms Response From 5th Pillar API:",
    //     getAllRequestForms
    //   );

    //   // If request forms were successfully fetched, push to array
    //   if (getAllRequestForms?.StatusCode === "200") {
    //     for (const element of getAllRequestForms?.Data) {
    //       if (
    //         ["onhold", "pause", "resume"].includes(
    //           element.TicketStatus?.toLowerCase()
    //         )
    //       ) {
    //         element.TicketStatus = "In Progress";
    //       }
    //       collectedPoliciesData.push(element);
    //     }

    //     // Sort the data by InitiationDate in descending order
    //     collectedPoliciesData.sort((a, b) => {
    //       const dateA = new Date(a.InitiationDate);
    //       const dateB = new Date(b.InitiationDate);

    //       return dateB - dateA; // Sorting in descending order
    //     });
    //   }
    //   // }

    //   // Return collected data after processing all policies
    //   if (collectedPoliciesData.length > 0) {
    //     return sendResponse(
    //       response,
    //       moduleName,
    //       200,
    //       1,
    //       responseMsgs.requestFormsFetched,
    //       { requestForms: collectedPoliciesData } // Return the array with all collected policy data
    //     );
    //   }

    //   // If no request forms are successfully fetched
    //   return sendResponse(
    //     response,
    //     moduleName,
    //     200,
    //     1,
    //     responseMsgs.recordNotFound
    //   );
    // }

    // Fetch user policies & Authenticate CRM concurrently

    if (!user?.cnic) {
      return sendResponse(
        response,
        moduleName,
        400,
        1,
        responseMsgs.customerNotFound
      );
    }
    const [policies, auth] = await Promise.all([
      getPolicyDropdown(user.cnic),
      authenticateLoginCRM(),
    ]);

    if (!policies?.length) {
      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.policiesNotFound
      );
    }

    if (!auth) {
      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.authFailed
      );
    }

    console.log("User Policies:", policies);

    // Fetch request forms from CRM
    const getAllRequestForms = await getAllRequestFormsFromCRM(auth, policies);
    console.log(
      "Request Forms Response From 5th Pillar API:",
      getAllRequestForms
    );

    if (
      getAllRequestForms?.StatusCode !== "200" ||
      !getAllRequestForms?.Data?.length
    ) {
      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.recordNotFound
      );
    }

    // Process and sort the response data
    const collectedPoliciesData = getAllRequestForms.Data.map((element) => ({
      ...element,
      TicketStatus: ["onhold", "pause", "resume"].includes(
        element.TicketStatus?.toLowerCase()
      )
        ? "In Progress"
        : element.TicketStatus,
    })).sort((a, b) => new Date(b.InitiationDate) - new Date(a.InitiationDate));

    return sendResponse(
      response,
      moduleName,
      200,
      1,
      responseMsgs.requestFormsFetched,
      {
        requestForms: collectedPoliciesData,
      }
    );
  } catch (error) {
    console.error("--- Create Request Form API Error ---", error);
    return sendResponse(
      response,
      moduleName,
      500,
      0,
      responseMsgs.error_500
      //   "Something went wrong, please try again later."
    );
  }
}
