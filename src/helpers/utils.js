const AccessToken = require("../models/OauthToken");
const RefreshToken = require("../models/OauthRefreshToken");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");
const moment = require("moment");
var FormData = require("form-data");
const { param, body } = require("express-validator");
const sanitize = require("mongo-sanitize");
const externalAPICall = require("../helpers/external-api-form-call");
const externalAPICallOptimize = require("../helpers/external-api-from-call-optimize");
const BookCall = require("../models/BookCall");
const axios = require("axios");

// const coreAPIUrl  = "https://uat-tms.5thpillartakaful.com/"//process.env.CORE_API_URL
// const coreAPIUsername  = "3P.PingUp"//process.env.CORE_API_USERNAME
// const coreAPIPassword  = "Aasdf12@"//process.env.CORE_API_PASSWORD

const coreAPIUrl = process.env.CORE_API_URL;
const coreAPIEndpoint = process.env.CORE_API_ENDPOINT;
const coreAPIUsername = process.env.CORE_API_USERNAME;
const coreAPIPassword = process.env.CORE_API_PASSWORD;
// const externalAPICall = require("../helpers/external-api-form-call");
const externalAPIFormDataCall = require("../helpers/external-api-form-data-call");

/** 5th Pillar CRM authentication with the core system **/
const crmCoreAPIUrl = process.env.CRM_CORE_API_URL;
const crmCoreAPIEmail = process.env.CRM_CORE_API_EMAIL;
const crmCoreAPIPassword = process.env.CRM_CORE_API_PASSWORD;

const { OAuth2Client } = require("google-auth-library");
const appleSignin = require("apple-signin-auth");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const  googleResponse = ticket.getPayload();
  console.log("googleResponse", googleResponse);
  return googleResponse
}

async function verifyAppleIdToken(idToken) {
  return await appleSignin.verifyIdToken(idToken, {
    audience: process.env.APPLE_CLIENT_ID,
    ignoreExpiration: false,
  });
}

async function authenticateLoginCRM() {
  try {
    console.log(crmCoreAPIUrl, crmCoreAPIEmail, crmCoreAPIPassword);

    let body = {
      email: crmCoreAPIEmail,
      password: crmCoreAPIPassword,
    };
    let response = await externalAPICall(
      crmCoreAPIUrl + "login",
      body,
      "POST",
      true
    );
    if (response) {
      console.log("CRM login API Data  ", response);
      return response.Data.AccessKey;
    }
    return false;
  } catch (e) {
    console.log("CRM core system API error ---- ", e);
    return false;
  }
}

/** get Complaint Setup **/
async function getComplaintSetup(token) {
  try {
    let headers = {
      Authorization: "Bearer " + token,
    };

    console.log("get complaint setup Api headers", headers);
    let response = await externalAPICall(
      crmCoreAPIUrl + "get-complaint-setup",
      {},
      "GET",
      false,
      headers
    );
    if (response) {
      return response;
    }
    return false;
  } catch (e) {
    console.log("CRM core system API error ---- ", e);
    return false;
  }
}

/** Create Request Form in CRM **/
async function createRequestFormInCRM(token, formData) {
  try {
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${crmCoreAPIUrl}save-task`,
      headers: {
        Authorization: `Bearer ${token}`,
        ...formData.getHeaders(), // Include headers from FormData
      },
      data: formData,
    };

    const response = await axios(config);
    return response.data; // Return the API response
  } catch (error) {
    console.error("Error creating request form in CRM:", error.message);
    return false;
  }
}

/** Create Complaint Request in CRM **/
async function createComplaintRequestInCRM(token, formData) {
  try {
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${crmCoreAPIUrl}create-complaint`,
      headers: {
        Authorization: `Bearer ${token}`,
        ...formData.getHeaders(), // Include headers from FormData
      },
      data: formData,
    };

    const response = await axios(config);
    return response.data; // Return the API response
  } catch (error) {
    console.error("Error creating request form in CRM:", error.message);
    return false;
  }
}

/** Get All Complaints From CRM **/
async function getAllComplaintsFromCRM(token, cnic) {
  try {
    let url = crmCoreAPIUrl + "get-complaint-status";
    url += `?cnic=${encodeURIComponent(cnic)}`;

    let headers = {
      Authorization: "Bearer " + token,
    };

    // Make the API call
    let response = await externalAPIFormDataCall(
      url,
      {},
      "GET",
      false,
      headers
    );

    if (response) {
      return response;
    }
    return false;
  } catch (e) {
    console.log("CRM core system API error ---- ", e);
    return false;
  }
}

/** Get All Request Forms From CRM **/
async function getAllRequestFormsFromCRM(token, membership_numbers) {
  try {
    let url = crmCoreAPIUrl + "get-task-detail";

    if (membership_numbers.length > 0) {
      // Extract values and join only if there's more than one item
      const membershipNos = membership_numbers
        .map((item) => item.value)
        .join(membership_numbers.length > 1 ? "," : "");
      url += `?membership_no=${encodeURIComponent(membershipNos)}`;
    }

    let headers = {
      Authorization: "Bearer " + token,
    };

    // Make the API call
    let response = await externalAPIFormDataCall(
      url,
      {},
      "GET",
      false,
      headers
    );

    if (response) {
      return response;
    }
    return false;
  } catch (e) {
    console.log("CRM core system API error ---- ", e);
    return false;
  }
}

function sendResponse(response, module, code, status, message, data = {}) {
  response.status(code).json({
    status: status ? true : false,
    message: message,
    heading: module,
    data: data,
  });
}
function checkKeysExist(obj, keysArray) {
  for (const key of keysArray) {
    if (!obj.hasOwnProperty(key)) {
      return `${key} not found in the object.`;
    }
  }
  return null; // All keys exist
}
async function generateToken(data) {
  let params = data;

  // token expiration date
  var tokenExpirationDate = moment().add(1, "seconds");
  // refresh token expiration
  var refreshTokenExpirationDate = moment().add(5, "hours");
  //create access token
  let accessToken = new AccessToken();
  accessToken.name = "Token";
  accessToken.userId = params.user._id;
  accessToken.clientId = params.clientId;
  accessToken.scopes = params.permissions;
  accessToken.revokedAt = null;
  accessToken.expiresAt = tokenExpirationDate;
  let accessTokenResponse = await accessToken.save();
  if (accessTokenResponse) {
    //create refresh token
    let refreshTokenRecord = new RefreshToken();
    refreshTokenRecord.accessTokenId = accessTokenResponse._id;
    refreshTokenRecord.revokedAt = null;
    refreshTokenRecord.expiredAt = refreshTokenExpirationDate;
    let refreshTokenResponse = await refreshTokenRecord.save();
    // create jwt token
    const token = jwt.sign(
      {
        userId: params.user._id,
        accessTokenId: accessTokenResponse._id,
        clientId: params.clientId,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: params.permissions,
      },
      process.env.CLIENT_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      {
        userId: params.user._id,
        clientId: params.clientId,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: params.permissions,
      },
      process.env.CLIENT_SECRET,
      { expiresIn: "5h" }
    );
    return {
      accessToken: token,
      refreshToken: refreshToken,
      tokenExpirationDate: tokenExpirationDate,
    };
  } else {
    return false;
  }
}

async function sanitizeObject(obj) {
  const sanitizedObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === "object" && value !== null) {
        // Recursively sanitize nested objects or arrays
        sanitizedObj[key] = Array.isArray(value)
          ? value.map((item) => sanitizeObject(item))
          : sanitizeObject(value);
      } else {
        // Sanitize the value
        sanitizedObj[key] = sanitize(value);
      }
    }
  }
  return sanitizedObj;
}

async function setUserResponse(data, setToken = true) {
  let role = await Role.findOne({
    _id: sanitize(data.roleId),
  });

  let token = null;
  if (setToken) {
    // generate access token and refresh token
    let requestParams = {
      user: data,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      permissions: role.permissions,
    };
    token = await generateToken(requestParams);
  }

  let respData = {
    accessToken: setToken ? token.accessToken : null,
    refreshToken: setToken ? token.refreshToken : null,
    expiresIn: setToken ? token.tokenExpirationDate : null,
    // isCustomerExistsIn5thPillar: data.isCustomerExistsIn5thPillar
    //   ? data.isCustomerExistsIn5thPillar
    //   : false,
    isPhoneNumberValidated: data.isPhoneNumberValidated
      ? data.isPhoneNumberValidated
      : false,
          isEmailValidated: data.isEmailValidated
      ? data.isEmailValidated
      : false,
    // phoneNumbers: data.phoneNumbers ? data.phoneNumbers : [],
    user: {
      _id: data._id,
      fullName: data.fullName,
      roleId: data.roleId,
      email: data.email,
      // cnic: data.cnic,
      // bookACall: data.bookACall ? data.bookACall : false,
      phoneNumber: data.phoneNumber,
      roleName: role.title,
      image: data.image,
      notifications: data.notifications,
      preferredLanguage: data.preferredLanguage
        ? data.preferredLanguage
        : "english",
      createdAt: data.createdAt,
      loginAt: data.loginAt,
      isManuallyCreated: data.isManuallyCreated,
      isPasswordCreated: data.isPasswordCreated,
    },
  };

  return respData;
}

/** to get the content according to the language **/
async function updateLanguageContent(
  obj,
  preferredLanguage,
  visited = new Set()
) {
  if (visited.has(obj)) {
    return; // If we've seen this object before, avoid infinite recursion
  }
  visited.add(obj); // Mark this object as visited

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    // Check if the value is an object and contains the keys 'english' and 'urdu'
    if (
      value &&
      typeof value === "object" &&
      "english" in value &&
      "urdu" in value
    ) {
      // Set the object's value to the value of the preferred language, if available
      obj[key] = value[preferredLanguage] || value["english"]; // Default to 'english' if preferred language is not available
    } else if (value && typeof value === "object") {
      // If the value is an object, recursively call this function
      updateLanguageContent(value, preferredLanguage, visited);
    }
  });
  return obj; // Return the updated object
}

/** authentication with the core system **/
async function authenticate() {
  try {
    console.log(coreAPIUrl, coreAPIPassword, coreAPIUsername);

    let body = {
      username: coreAPIUsername,
      password: coreAPIPassword,
      grant_type: "password",
    };
    let response = await externalAPICall(
      coreAPIUrl + "token",
      body,
      "POST",
      true
    );
    if (response) {
      return response.access_token;
    }
    return false;
  } catch (e) {
    console.log("core system API error ---- ", e);
    return false;
  }
}

/** get policy **/
async function getPolicyDetails(cnic, token) {
  try {
    let body = {
      CustomerCNIC: cnic.replace(/-/g, ""),
      SearchType: "Insured",
    };
    let headers = {
      Authorization: "Bearer " + token,
    };
    let response = await externalAPICall(
      coreAPIEndpoint + "Fetch",
      body,
      "POST",
      false,
      headers
    );
    if (response) {
      return response;
    }
    return false;
  } catch (e) {
    console.log("core system API error ---- ", e);
    return false;
  }
}

/** get policy By Policy No. **/
async function getPolicyDetailsByPolicyNo(cnic, policyNo, token) {
  try {
    let body = {
      CustomerCNIC: cnic.replace(/-/g, ""),
      PMDNo: policyNo,
      SearchType: "Insured",
    };
    let headers = {
      Authorization: "Bearer " + token,
    };
    let response = await externalAPICall(
      coreAPIEndpoint + "Fetch",
      body,
      "POST",
      false,
      headers
    );
    if (response) {
      return response;
    }
    return false;
  } catch (e) {
    console.log("core system API error ---- ", e);
    return false;
  }
}

/** get PmdDocs * */
async function getPmdDocs(policyNo, token) {
  try {
    let body = {
      PMDNo: policyNo,
    };
    let headers = {
      Authorization: "Bearer " + token,
    };
    let response = await externalAPICall(
      coreAPIEndpoint + "PMDDocuments",
      body,
      "POST",
      false,
      headers
    );
    if (response) {
      return response;
    }
    return false;
  } catch (e) {
    console.log("core system API error ---- ", e);
    return false;
  }
}

/** get PmdDocs * */
async function getPmdDocumentDownload(ApiPayload, token) {
  try {
    let body = ApiPayload;
    let headers = {
      Authorization: "Bearer " + token,
    };
    let response = await externalAPICall(
      coreAPIEndpoint + "PMDDocuments/Download",
      body,
      "POST",
      false,
      headers
    );
    if (response) {
      return response;
    }
    return false;
  } catch (e) {
    console.log("core system API error ---- ", e);
    return false;
  }
}

async function getModuleNameFromLanguage(language, controllerKey) {
  let moduleName;

  // Load language-specific module names
  if (language === "english") {
    moduleName = require("./enResponseMessages").ModuleNames;
  } else {
    moduleName = require("./urResponseMessages").ModuleNames;
  }

  // Fetch the corresponding module name based on the controller key
  return moduleName[controllerKey] || null;
}

async function getResponseMsgsFromLanguage(language, controllerKey) {
  let responseMsgs;
  let commonMsgs;

  if (language === "english") {
    responseMsgs = require("./enResponseMessages").ControllerWiseMsgs[
      controllerKey
    ];
    commonMsgs = require("./enResponseMessages").CommonMsgs;
  } else {
    responseMsgs = require("./urResponseMessages").ControllerWiseMsgs[
      controllerKey
    ];
    commonMsgs = require("./urResponseMessages").CommonMsgs;
  }

  // If responseMsgs is undefined, just return commonMsgs
  responseMsgs = responseMsgs
    ? { ...responseMsgs, ...commonMsgs }
    : { ...commonMsgs };

  return responseMsgs;
}

module.exports = {
  verifyGoogleIdToken,
  verifyAppleIdToken,
  authenticateLoginCRM,
  getComplaintSetup,
  createComplaintRequestInCRM,
  getAllComplaintsFromCRM,
  createRequestFormInCRM,
  getAllRequestFormsFromCRM,
  sendResponse,
  generateToken,
  sanitizeObject,
  checkKeysExist,
  setUserResponse,
  updateLanguageContent,
  authenticate,
  getPolicyDetails,
  getPolicyDetailsByPolicyNo,
  getPmdDocs,
  getPmdDocumentDownload,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
};
