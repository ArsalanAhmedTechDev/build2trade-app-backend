// includes
const moment = require("moment");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const bcrypt = require("bcryptjs");
const sanitize = require("mongo-sanitize");
// const CryptoJS = require('../helpers/CryptoJS')
const salt = parseInt(process.env.SALT);

// Models
const UserModel = require("../../models/Customers");
const Role = require("../../models/Role");
const RoleType = require("../../models/RoleType");
const AccessToken = require("../../models/OauthToken");
const RefreshToken = require("../../models/OauthRefreshToken");

// helper functions
const systemLogsHelper = require("../../helpers/system-logs");
const {
  sendResponse,
  generateToken,
  checkKeysExist,
  setUserResponse,
  authenticate,
  getPolicyDetails,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
} = require("../../helpers/utils");
const externalApiCall = require("../../helpers/external-api-call");

// module name
// const moduleName = "Authentication";
let moduleName;
let responseMsgs;
var lang = "english";

module.exports = {
  login,
  signup,
  updatePin,
  logout,
  checkAuth,
  customerExist,
  loginCheck,
};

/** authenticate user and generate access token **/
async function loginCheck(request, response) {
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(lang, "AuthController");
  responseMsgs = await getResponseMsgsFromLanguage(lang, "AuthController");
  let params = request.body;

  // enable once the frontend encryption is done
  // let params = CryptoJS.decrypt(request.body.data)

  // check if the required keys are missing or not
  let checkKeys = await checkKeysExist(params, ["cnic", "pin"]);
  if (checkKeys) {
    return sendResponse(response, moduleName, 422, 0, checkKeys);
  }
  try {
    /** find user record by CNIC **/
    let user = await UserModel.findOne({
      cnic: sanitize(params.cnic),
    });
    if (user) {
      /** if user is archived **/
      if (user.status != "active") {
        // return error
        return sendResponse(
          response,
          moduleName,
          422,
          0,
          responseMsgs.accountStatusMsg + user.status
          // "Your account is " + user.status
        );
      }

      /** if user account is locked **/
      if (user.isLocked) {
        let message =
          // "User is locked until " +
          responseMsgs.userLockedMsg +
          moment(user.lockedAt).add(10, "minutes").format("LT z");

        return sendResponse(response, moduleName, 422, 0, message);
      }

      /** find permissions associated to user role **/
      let role = await Role.findOne({
        _id: sanitize(user.roleId),
      });
      if (role && role.status == "archived") {
        /*** return error response  ***/
        // return sendResponse(response, moduleName, 422, 0, "Role is archived");
        return sendResponse(
          response,
          moduleName,
          422,
          0,
          responseMsgs.userRoleMsg
        );
      }
      // let roleType = await RoleType.findOne({_id: sanitize(role.roleTypeId)})
      // if(!roleType || roleType.title != 'Customers')
      // {
      //     return sendResponse(response,moduleName,422,0,"You are not authorized to login")
      // }
      /** if user record exists and is active **/
      if (bcrypt.compareSync(params.pin, user.password)) {
        let getResp = {
          phoneNumber: user.phoneNumber,
          isPasswordCreated: user.isPasswordCreated,
        };

        await UserModel.findOneAndUpdate(
          { _id: sanitize(user._id) },
          {
            $set: {
              loginAttempts: 0,
            },
            $unset: { lockedAt: 1 },
          },
          { useFindAndModify: false }
        );

        //create system logs
        let systemLogsData = {
          userId: user._id,
          userIp: request.ip,
          roleId: user.roleId,
          module: moduleName,
          action: "login",
          data: getResp,
        };
        let systemLogs = await systemLogsHelper.composeSystemLogs(
          systemLogsData
        );

        if (!user.isPasswordCreated) {
          // send otp
          const headers = {
            channel: "web",
          };
          let sendOTP = await externalApiCall(
            process.env.APP_API_URL + "otp/generate",
            getResp,
            headers
          );
          if (sendOTP && sendOTP.token) {
            console.log("his is the response-----", sendOTP);
            getResp = {
              ...getResp,
              token: sendOTP.token,
            };
            return sendResponse(
              response,
              moduleName,
              200,
              1,
              responseMsgs.OtpSentMsg,
              // "OTP has been sent",
              getResp
            );
          }
          return sendResponse(
            response,
            moduleName,
            200,
            0,
            responseMsgs.OtpNotSentMsg,
            // "Unable to send OTP",
            getResp
          );
        } else {
          return sendResponse(
            response,
            moduleName,
            200,
            0,
            responseMsgs.CustomerCreatedByAdminMsg,
            // "Customer is created by Admin",
            getResp
          );
        }
      } else {
        await user.incrementLoginAttempts();
        // return sendResponse(response, moduleName, 422, 0, "Invalid Pin");
        return sendResponse(
          response,
          moduleName,
          422,
          0,
          responseMsgs.InvalidPinMsg
        );
      }
    } else {
      // return sendResponse(response, moduleName, 422, 0, "Invalid CNIC");
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        responseMsgs.InvalidCnicMsg
      );
    }
  } catch (error) {
    console.log("--- login API error ---", error);
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

/* Check customer Phone Number from their core system */
async function checkCustomerPhoneNumber(data) {
  try {
    const auth = await authenticate();
    if (auth) {
      const policy = await getPolicyDetails(data, auth);

      if (policy?.Policies?.length) {
        return policy;
      }
    }
    return false;
  } catch (error) {
    console.log("--- GET Customer's From 5th Pillar API Error ---", error);
    return false;
  }
}
/* Check customer from their core system */
async function customerExist(request, response) {
  try {
    lang = request.header("lang") ? request.header("lang") : lang;
    moduleName = await getModuleNameFromLanguage(lang, "AuthController");
    responseMsgs = await getResponseMsgsFromLanguage(lang, "AuthController");

    let body = request.body;
    let filter = [];
    let customerExists = false;
    // let responseMsg = "Customer does not exist.";
    let responseMsg = responseMsgs.CustomerNotExists;
    let check = null;
    if (body.phoneNumber) {
      filter.push({ phoneNumber: body.phoneNumber });
    }
    if (body.cnic) {
      filter.push({ cnic: body.cnic });
    }

    check = await UserModel.countDocuments({
      $or: filter,
    });
    if (check && check > 0) {
      customerExists = true;
      // responseMsg = "Customer already exists.";
      responseMsg = responseMsgs.CustomerAlreadyExists;
      return sendResponse(response, moduleName, 200, 1, responseMsg, {
        customerExists: customerExists,
        isCustomerExistsIn5thPillar: false,
        isPhoneNumberValidated: false,
      });
    } else {
      let customerData = await checkCustomerPhoneNumber(body.cnic);
      // let customerData = {
      //   Policies: [
      //     {
      //       OwnerInfo: {
      //         Mobile: "03333222222",
      //       },
      //     },
      //   ],
      // };
      console.log("Get Customer Data From 5th Pillar API", customerData);

      if (customerData && customerData.Policies) {
        // const phoneNumbers = new Set(
        //   customerData.Policies.map(
        //     (element) => element?.OwnerInfo?.Mobile //in mobile number we have this "03333078583" count each character then check if it exceeds from 11 numbers then return response which is this
        //   ).filter(Boolean)
        // );

        // Extract phone numbers from customer policies and filter out invalid entries
        // const phoneNumbers = new Set(
        //   customerData.Policies.map((element) => {
        //     const phone = element?.OwnerInfo?.Mobile;

        //     // Check if phone number exceeds 11 characters
        //     if (phone && phone.length > 11) {
        //       return sendResponse(
        //         response,
        //         moduleName,
        //         422, // or appropriate error code
        //         0,
        //         responseMsgs.InvalidPhoneNumberLength,
        //         {
        //           customerExists: customerExists,
        //           isCustomerExistsIn5thPillar: true,
        //           isPhoneNumberValidated: false,
        //         }
        //       );
        //     }
        //     return phone;
        //   }).filter((phone) => phone && phone.length === 11) // Ensure phone number is exactly 11 digits
        // );

        // // Convert each phone number into the required format +92-XXX-XXXXXXX and add title, value structure
        // const distinctPhoneNumbers = [...phoneNumbers].map((phone) => {
        //   // Format the number to +92-XXX-XXXXXXX
        //   const formattedPhone =
        //     "+92-" + phone.slice(1, 4) + "-" + phone.slice(4);

        //   // Create title by masking the middle 4 digits
        //   const maskedPhone =
        //     "+92-" + phone.slice(1, 4) + "-XXXX" + phone.slice(-3);

        //   // Return object with title and value
        //   return {
        //     title: maskedPhone,
        //     value: formattedPhone,
        //   };
        // });

        // console.log("distinctPhoneNumbers", distinctPhoneNumbers);

        const phoneNumbers = new Set(
          customerData.Policies.map((element) => {
            let phone = element?.OwnerInfo?.Mobile;

            // Check if the phone number exceeds 11 characters
            if (phone && phone.length > 11) {
              return sendResponse(
                response,
                moduleName,
                422, // or appropriate error code
                0,
                responseMsgs.InvalidPhoneNumberLength,
                {
                  customerExists: customerExists,
                  isCustomerExistsIn5thPillar: true,
                  isPhoneNumberValidated: false,
                }
              );
            }

            // If phone exists, take only the last 10 digits
            if (phone) {
              phone = phone.slice(-10); // Get last 10 digits
            }

            return phone;
          }).filter((phone) => phone && phone.length === 10) // Ensure phone number is exactly 10 digits
        );

        // Format each distinct phone number into +92-XXX-XXXXXXX and add title, value structure
        const distinctPhoneNumbers = [...phoneNumbers].map((phone) => {
          const formattedPhone =
            "+92-" + phone.slice(0, 3) + "-" + phone.slice(3);
          const maskedPhone =
            "+92-" + phone.slice(0, 3) + "-XXXX" + phone.slice(-3);

          return {
            title: maskedPhone,
            value: formattedPhone,
          };
        });

        console.log("distinctPhoneNumbers", distinctPhoneNumbers);

        if (distinctPhoneNumbers.length) {
          const payloadPhoneNumber = body.phoneNumber;

          // Directly compare only with the 'value' field as both are in the same format
          const matchedPhoneNumber = distinctPhoneNumbers.find(
            (phone) => phone.value === payloadPhoneNumber
          );

          if (matchedPhoneNumber) {
            console.log(`Match found: ${matchedPhoneNumber}`);
            return sendResponse(
              response,
              moduleName,
              200,
              1,
              responseMsgs.CustomerExistsIn5thillar,
              {
                customerExists: customerExists,
                isCustomerExistsIn5thPillar: true,
                isPhoneNumberValidated: true,
              }
            );
          }

          console.log("No match found");
          return sendResponse(
            response,
            moduleName,
            200,
            1,
            responseMsgs.CustomerNotValidatedFrom5thillar,
            {
              customerExists: customerExists,
              isCustomerExistsIn5thPillar: true,
              isPhoneNumberValidated: false,
              phoneNumbers: distinctPhoneNumbers,
            }
          );
        }
      } else {
        return sendResponse(
          response,
          moduleName,
          200,
          1,
          responseMsgs.CustomerNotExistsIn5thPillar,
          {
            customerExists: customerExists,
            isCustomerExistsIn5thPillar: false,
            isPhoneNumberValidated: false,
          }
        );
      }

      // return sendResponse(response, moduleName, 200, 1, responseMsg, {
      //   customerExists: customerExists,
      // });
    }
  } catch (err) {
    console.log("---- User Existence check error ----", err);
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

/** authenticate user and generate access token **/
async function login(request, response) {
  try {
    lang = request.header("lang") ? request.header("lang") : lang;
    moduleName = await getModuleNameFromLanguage(lang, "AuthController");
    responseMsgs = await getResponseMsgsFromLanguage(lang, "AuthController");
    const { cnic, pin } = request.body;
    var isCustomerExistsIn5thPillar = false;
    var isPhoneNumberValidated = false;
    var phoneNumbers = [];

    // Check if required keys are missing
    const missingKeys = await checkKeysExist({ cnic, pin }, ["cnic", "pin"]);
    if (missingKeys) {
      return sendResponse(response, moduleName, 422, 0, missingKeys);
    }

    /** Find user by CNIC **/
    const user = await UserModel.findOne({ cnic: sanitize(cnic) });
    if (!user) {
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        responseMsgs.InvalidCnicMsg
      );
    }

    // Check user status
    if (user.status !== "active") {
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        `${responseMsgs.accountStatusMsg} ${user.status}`
      );
    }

    // Check if user is locked
    if (user.isLocked) {
      const lockUntil = moment(user.lockedAt).add(10, "minutes").format("LT z");
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        `${responseMsgs.userLockedMsg} ${lockUntil}`
      );
    }

    /** Check role status **/
    const role = await Role.findById(sanitize(user.roleId));
    if (role && role.status === "archived") {
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        responseMsgs.userRoleMsg
      );
    }

    if (user?.isPhoneNumberValidated === true) {
      isCustomerExistsIn5thPillar = true;
      isPhoneNumberValidated = true;
      phoneNumbers = [];
    }

    // Check customer in core system and update role if necessary
    if (role?.title === "Guest" || user?.isPhoneNumberValidated === true) {
      let customer5thPillarDetails = await checkCustomerPhoneNumber(cnic);
      // let customer5thPillarDetails = {
      //   Policies: [
      //     {
      //       OwnerInfo: {
      //         Mobile: "+923333222222",
      //       },
      //     },
      //   ],
      // };
      if (customer5thPillarDetails) {
        const memberRole = await Role.findOne({ title: "Member" });
        const updatedUser = await UserModel.findOneAndUpdate(
          { cnic },
          { roleId: memberRole._id, updatedAt: new Date() },
          { new: true }
        );
        if (updatedUser) {
          await systemLogsHelper.composeSystemLogs({
            userId: updatedUser._id,
            userIp: request.ip,
            roleId: updatedUser.roleId,
            module: moduleName,
            action: "login",
            data: updatedUser,
          });
        }

        // var phoneNumbers = new Set(
        //   customer5thPillarDetails.Policies.map(
        //     (element) => element?.OwnerInfo?.Mobile
        //   ).filter(Boolean)
        // );

        // // Convert each phone number into the required format +92-XXX-XXXXXXX and add title, value structure
        // var distinctPhoneNumbers = [...phoneNumbers].map((phone) => {
        //   // Format the number to +92-XXX-XXXXXXX
        //   const formattedPhone =
        //     "+92-" + phone.slice(1, 4) + "-" + phone.slice(4);

        //   // Create title by masking the middle 4 digits
        //   const maskedPhone =
        //     "+92-" + phone.slice(1, 4) + "-XXXX" + phone.slice(-3);

        //   // Return object with title and value
        //   return {
        //     title: maskedPhone,
        //     value: formattedPhone,
        //   };
        // });

        var phoneNumbers = new Set(
          customer5thPillarDetails.Policies.map((element) => {
            let phone = element?.OwnerInfo?.Mobile;

            // Check if the phone number exceeds 11 characters
            if (phone && phone.length > 13) {
              return sendResponse(
                response,
                moduleName,
                422, // or appropriate error code
                0,
                responseMsgs.InvalidPhoneNumberLength,
                {
                  isCustomerExistsIn5thPillar: true,
                  isPhoneNumberValidated: false,
                }
              );
            }

            // If phone exists, take only the last 10 digits
            if (phone) {
              phone = phone.slice(-10); // Get last 10 digits
            }

            return phone;
          }).filter((phone) => phone && phone.length === 10) // Ensure phone number is exactly 10 digits
        );

        // Format each distinct phone number into +92-XXX-XXXXXXX and add title, value structure
        const distinctPhoneNumbers = [...phoneNumbers].map((phone) => {
          const formattedPhone =
            "+92-" + phone.slice(0, 3) + "-" + phone.slice(3);
          const maskedPhone =
            "+92-" + phone.slice(0, 3) + "-XXXX" + phone.slice(-3);

          return {
            title: maskedPhone,
            value: formattedPhone,
          };
        });

        console.log("distinctPhoneNumbers", distinctPhoneNumbers);

        if (distinctPhoneNumbers.length) {
          var payloadPhoneNumber = user.phoneNumber;

          // Directly compare only with the 'value' field as both are in the same format
          var matchedPhoneNumber = distinctPhoneNumbers.find(
            (phone) => phone.value === payloadPhoneNumber
          );

          if (matchedPhoneNumber) {
            console.log(`Match found: ${matchedPhoneNumber}`);

            isCustomerExistsIn5thPillar = true;
            isPhoneNumberValidated = true;
            phoneNumbers = [];

            // write a update boolean query here for user.isPhoneNumberValidated;
            const updatedUser = await UserModel.findOneAndUpdate(
              { cnic },
              { isPhoneNumberValidated: true, updatedAt: new Date() },
              { new: true }
            );
            if (updatedUser) {
              await systemLogsHelper.composeSystemLogs({
                userId: updatedUser._id,
                userIp: request.ip,
                roleId: updatedUser.roleId,
                module: moduleName,
                action: "login",
                data: updatedUser,
              });
            }

            // return sendResponse(
            //   response,
            //   moduleName,
            //   200,
            //   1,
            //   responseMsg.CustomerExistsIn5thillar,
            //   {
            //     customerExists: customerExists,
            //     isCustomerExistsIn5thPillar: true,
            //     isPhoneNumberValidated: true,
            //   }
            // );
          } else {
            console.log(
              "User Phone Number Not Matched with 5th Pillar Policies"
            );
            isCustomerExistsIn5thPillar = true;
            isPhoneNumberValidated = false;
            phoneNumbers = distinctPhoneNumbers;
            // return sendResponse(
            //   response,
            //   moduleName,
            //   200,
            //   1,
            //   responseMsg.CustomerNotValidatedFrom5thillar,
            //   {
            //     customerExists: customerExists,
            //     isCustomerExistsIn5thPillar: true,
            //     isPhoneNumberValidated: false,
            //     phoneNumbers: distinctPhoneNumbers,
            //   }
            // );
          }
        }
      }
    }
    /** Validate user PIN **/
    if (bcrypt.compareSync(pin, user.password)) {
      // Add the fields to the user object
      user.isCustomerExistsIn5thPillar = isCustomerExistsIn5thPillar;
      user.isPhoneNumberValidated = isPhoneNumberValidated;
      user.phoneNumbers = phoneNumbers;

      await UserModel.updateOne(
        { _id: user._id },
        { $set: { preferredLanguage: lang } }
      );
      user.preferredLanguage = lang;

      // Call setUserResponse with the updated user object
      const getResp = await setUserResponse(user);

      console.log("Login Response => ", getResp);

      await UserModel.findByIdAndUpdate(
        user._id,
        { loginAttempts: 0, loginAt: new Date(), $unset: { lockedAt: 1 } },
        { useFindAndModify: false }
      );

      // Create system logs
      await systemLogsHelper.composeSystemLogs({
        userId: user._id,
        userIp: request.ip,
        roleId: user.roleId,
        module: moduleName,
        action: "login",
        data: getResp,
      });

      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.loginMsg,
        getResp
      );
    } else {
      await user.incrementLoginAttempts();
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        responseMsgs.InvalidPinMsg
      );
    }
  } catch (error) {
    console.error("--- login API error ---", error);
    return sendResponse(response, moduleName, 500, 0, responseMsgs.error_500);
  }
}

/** register user and generate access token **/
async function signup(request, response) {
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(lang, "AuthController");
  responseMsgs = await getResponseMsgsFromLanguage(lang, "AuthController");

  let params = request.body;

  // check if the required keys are missing or not
  let checkKeys = await checkKeysExist(params, [
    "fullName",
    "phoneNumber",
    // "cnic",
    "email",
    "password",
  ]);
  if (checkKeys) {
    return sendResponse(response, moduleName, 422, 0, checkKeys);
  }
  try {
    // check if user is already exists
    let check = await UserModel.countDocuments({
      $or: [
        { cnic: params.cnic },
        { phoneNumber: params.phoneNumber },
        // { email: params.email },
      ],
    });
    if (check && check > 0) {
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        responseMsgs.CustomerExistsMsg
        // "Customer already exists with the given CNIC or Phone Number"
      );
    }

    let hashPin = await bcrypt.hashSync(params.pin, salt);

    var user = new UserModel();
    user.fullName = params.fullName;
    user.email = params.email;
    user.phoneNumber = params.phoneNumber;
    user.cnic = params.cnic;
    user.password = hashPin;
    user.preferredLanguage = lang;
    user.channel = request.header("channel")
      ? request.header("channel")
      : "web";

    // check customer from the core system
    let customerDetails = await checkCustomer(params);
    // console.log('------',customerDetails)
    let getRole = "";
    if (customerDetails) {
      getRole = await Role.findOne({ title: "Member" });
    } else {
      getRole = await Role.findOne({ title: "Guest" });
    }

    user.roleId = params.roleId ? params.roleId : getRole._id;
    user.isPhoneNumberValidated =
      params?.isPhoneNumberValidated ?? user.isPhoneNumberValidated;

    // create a new system user record
    console.log("User => ", user);
    let data = await user.save();
    console.log("data => ", data);
    // if created successfully

    if (data) {
      //create system logs
      let systemLogsData = {
        userId: data._id,
        userIp: request.ip,
        roleId: data.roleId,
        module: moduleName,
        action: "signup",
        data: data,
      };
      let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);
      let getResp = await setUserResponse(data);
      console.log("Get Response  => ", getResp);
      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.CustomerCreatedMsg,
        // "Customer has been created successfully",
        getResp
      );
    }
  } catch (error) {
    console.log("--- Signup API Error ---", error);

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

/** update pin and generate access token **/
async function updatePin(request, response) {
  try {
    lang = request.header("lang") ? request.header("lang") : lang;
    moduleName = await getModuleNameFromLanguage(lang, "AuthController");
    responseMsgs = await getResponseMsgsFromLanguage(lang, "AuthController");

    let params = request.body;

    let hashPin = await bcrypt.hashSync(params.pin, salt);

    let user = await UserModel.findOneAndUpdate(
      {
        $and: [
          { phoneNumber: params.phoneNumber },
          // { cnic: params.cnic }
        ],
      },
      {
        password: hashPin,
        isPasswordCreated: true,
        updatedAt: new Date(),
      },
      {
        new: true,
      }
    );

    if (user) {
      let getResp = await setUserResponse(user);

      return sendResponse(
        response,
        moduleName,
        200,
        1,
        responseMsgs.UserPinUpdatedMsg
        // "Pin updated successfully"
      );
    } else {
      // return sendResponse(response, moduleName, 422, 0, "User does not exists");
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        responseMsgs.UserNotExists
      );
    }
  } catch (error) {
    console.log("--- Pin Update API Error ---", error);
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

/** logout user and delete the access token **/
async function logout(request, response) {
  try {
    lang = request.header("lang") ? request.header("lang") : lang;
    moduleName = await getModuleNameFromLanguage(lang, "AuthController");
    responseMsgs = await getResponseMsgsFromLanguage(lang, "AuthController");

    // get userId from request
    let params = request.body;

    // check if the required keys are missing or not
    let checkKeys = await checkKeysExist(params, ["userId"]);
    if (checkKeys) {
      return sendResponse(response, moduleName, 422, 0, checkKeys);
    }
    // revoke access token
    let token = await AccessToken.updateMany(
      { userId: params.userId },
      { revoked: true, revokedAt: moment(), updatedAt: moment() },
      { upsert: true, useFindAndModify: false }
    );

    // revoke refresh token
    await RefreshToken.findOneAndUpdate(
      { accessTokenId: token._id },
      { revoked: true, revokedAt: moment(), updatedAt: moment() },
      { upsert: true, useFindAndModify: false }
    );

    //create system logs
    let systemLogsData = {
      userId: params.userId,
      userIp: request.ip,
      roleId: "",
      module: moduleName,
      action: "logout",
      data: [],
    };
    let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

    return sendResponse(
      response,
      moduleName,
      200,
      1,
      responseMsgs.CustomerLogdOutMsg
      // "Customer has been logout successfully"
    );
  } catch (error) {
    console.log("--- LOGOUT API ERROR ---", error);
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

/** check customer in core system if its a member or not **/
async function checkCustomer(data) {
  try {
    let auth = await authenticate();
    // console.log('this is the auth response----',auth)

    if (auth) {
      let policy = await getPolicyDetails(data.cnic, auth);
      // console.log('this is the response----',policy)

      if (policy && policy.Policies.length && policy.Policies.length > 0) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.log("--- GET Customer API Error ---", error);
    return false;
  }
}

/** function to check if the user's token is expire or not **/
async function checkAuth(request, response) {
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(lang, "AuthController");
  responseMsgs = await getResponseMsgsFromLanguage(lang, "AuthController");

  // return sendResponse(response, moduleName, 200, 0, "User is still logged in");
  return sendResponse(
    response,
    moduleName,
    200,
    0,
    responseMsgs.UserIsLoggedIn
  );
}
