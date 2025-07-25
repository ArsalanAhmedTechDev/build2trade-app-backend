// includes
const axios = require('axios');
const otpGenerator = require('otp-generator');
const Moment = require('moment');
const mongoose = require('mongoose');

// Models
const UserModel = require('../../models/Customers');
const OTP = require('../../models/OTP');

// module name
// const moduleName = "OTP Verification";
let moduleName;
let responseMsgs;
var lang = 'english';

// helper function to generate logs
const systemLogsHelper = require('../../helpers/system-logs');
// helper function to hit external API
const externalApiCall = require('../../helpers/external-api-call');
const {
  sendResponse,
  checkKeysExist,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
} = require('../../helpers/utils');

// create & send OTP response codes
// const createOtpResponseCodes = {
//   0: "SMS & email sent successfully.",
//   1: "SMS sent successfully.",
//   2: "Email sent successfully.",
//   3: "SMS & email couldn't be sent.",
//   4: "API account expired",
// };

// // verify OTP response codes
// const verifyOtpResponseCodes = {
//   0: "Success",
//   1: "Invalid OTP",
//   2: "Expired OTP",
// };

// channel type constants
const channelTypes = {
  0: 'Success',
  1: 'Invalid OTP',
  2: 'Expired OTP',
};

module.exports = {
  generateOtp,
  verifyOtp,
};

/** generate & send OTP **/
async function generateOtp(request, response) {
  const body = request.body;
  lang = request.header('lang') ? request.header('lang') : lang;
  moduleName = await getModuleNameFromLanguage(lang, 'OTPController');
  responseMsgs = await getResponseMsgsFromLanguage(lang, 'OTPController');

  let checkKeys = await checkKeysExist(body, ['phoneNumber']);
  if (checkKeys) {
    return sendResponse(response, moduleName, 422, 0, checkKeys);
  }
  let phoneNumber = body.phoneNumber;
  let isdCode = body.isdCode;
  let channel = request.header('channel') ? request.header('channel') : 'web';
  let email = body.email ? body.email : null;
  let otpCall = null;
  let apiToken = null;
  let otpCode = null;
  // let successMessage = "OTP has been generated";
  let successMessage = responseMsgs.otpGenerated;
  try {
    console.log('----phone----', phoneNumber);
    console.log('----phone----', process.env.isOTP);
    if (
      process.env.isOTP &&
      process.env.isOTP === 'true' &&
      phoneNumber !== '+92-336-3864574' &&
      phoneNumber !== '+92-333-3078583'
    ) {
      /**
       * getting API Token from OTP auth
       */
      console.log('----phone3----', phoneNumber);

      apiToken = await otpAuth();
      if (apiToken) {
        const messagePayload = {
          Mobilenumber: phoneNumber.replace(/[+-]/g, ''), // excluding "+" & "-" from the phone number
          Channel: channel == 'android' || channel == 'ios' ? 'app' : 'web',
          RecipientEmail: email,
        };
        const headers = {
          Authorization: 'Bearer ' + apiToken,
        };
        otpCall = await externalApiCall(
          process.env.OTP_SERVICE_MESSAGE_URL,
          messagePayload,
          headers
        );
        console.log('-------otp create response----------', otpCall);
        if (otpCall && otpCall.ResponseCode && otpCall.ResponseCode <= 2) {
          successMessage =
            responseMsgs.createOtpResponseCodes[otpCall.ResponseCode];
        } else {
          return sendResponse(
            response,
            moduleName,
            422,
            0,
            responseMsgs.createOtpResponseCodes[otpCall.ResponseCode]
          );
        }
      } else {
        return sendResponse(
          response,
          moduleName,
          422,
          0,
          responseMsgs.otpAuthFailed
          // "OTP Authentication failed"
        );
      }
    } else {
      // otpCode = otpGenerator.generate(4, {
      //   digits: true,
      //   alphabets: false,
      //   upperCase: false,
      //   specialChars: false,
      // });
      otpCode = 12345;
    }

    /**
     * Saving OTP details locally
     */
    var otp = new OTP();
    otp.phoneNumber = phoneNumber;
    otp.isdCode = isdCode;
    otp.email = email;
    otp.otp = otpCode;
    otp.channel = channel;
    otp.receiverId = otpCall && otpCall.ReceiverId ? otpCall.ReceiverId : null;
    otp.expiresIn = 'OTP expires in 2 minutes';
    otp.apiToken = apiToken;
    otp.createdAt = Moment();
    let data = await otp.save();

    if (data) {
      //create system logs
      let systemLogsData = {
        userId: '',
        userIp: request && request.ip ? request.ip : null,
        roleId: '',
        module: moduleName,
        action: 'generate-otp',
        data: data,
      };
      let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);
      let respData = {
        token: data._id,
        otp: data.otp,
        expiry_time: 120000,
      };
      return sendResponse(
        response,
        moduleName,
        200,
        1,
        successMessage,
        respData
      );
    } else {
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        responseMsgs.unableToSendOtp
        // "Unable to save OTP details, please resend."
      );
    }
  } catch (err) {
    console.log('---- Generate OTP error ----', err);
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

/** Verify OTP **/
async function verifyOtp(request, response) {
  try {
    lang = request.header('lang') ? request.header('lang') : lang;
    moduleName = await getModuleNameFromLanguage(lang, 'OTPController');
    responseMsgs = await getResponseMsgsFromLanguage(lang, 'OTPController');
    const body = request.body;

    // check if the required keys are missing or not
    let checkKeys = await checkKeysExist(body, ['token', 'otp']);
    if (checkKeys) {
      return sendResponse(response, moduleName, 422, 0, checkKeys);
    }

    let token = body.token;
    let otp = body.otp;
    let otpVerified = false;
    let otpCall = null;

    let result = await OTP.findOne({
      _id: new mongoose.Types.ObjectId(token),
      tokenUsed: false,
    });
    if (result && !isOtpExpired(result?.createdAt)) {
      let otpFound = false;
      let createdDate = new Date(result.createdAt);
      let currentDate = new Date();
      let diff = (currentDate.getTime() - createdDate.getTime()) / 1000;
      let seconds = Math.abs(Math.round(diff));
      if (seconds <= 120) {
        otpFound = true;
      }

      if (
        process.env.isOTP &&
        process.env.isOTP === 'true' &&
        result.phoneNumber !== '+92-336-3864574' &&
        result.phoneNumber !== '+92-333-3078583'
      ) {
        let apiToken = otpFound ? result.apiToken : await otpAuth();
        /**
         * getting API Token from OTP auth
         */
        if (apiToken) {
          const verifyPayload = {
            OTP: otp,
            ReceiverId: result.receiverId,
            Channel:
              result.channel == 'android' || result.channel == 'ios'
                ? 'app'
                : 'web',
          };
          const headers = {
            Authorization: 'Bearer ' + apiToken,
          };
          otpCall = await externalApiCall(
            process.env.OTP_SERVICE_VERIFY_URL,
            verifyPayload,
            headers
          );

          if (otpCall && otpCall.ResponseCode && otpCall.ResponseCode == 0) {
            otpVerified = true;
          } else {
            return sendResponse(
              response,
              moduleName,
              422,
              0,
              responseMsgs.verifyOtpResponseCodes[otpCall.ResponseCode]
            );
          }
        } else {
          return sendResponse(
            response,
            moduleName,
            422,
            0,
            responseMsgs.otpAuthFailed
            // "OTP Authentication failed"
          );
        }
      } else {
        otpVerified = result.otp == body.otp ? true : otpVerified;
      }

      if (otpVerified) {
        // update existing OTP's temp record

        await OTP.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(token) },
          {
            tokenUsed: true,
          },
          {
            useFindAndModify: false,
            new: true,
            runValidators: true,
          }
        );

        //create system logs
        let systemLogsData = {
          userId: '',
          userIp: request && request.ip ? request.ip : null,
          roleId: '',
          module: moduleName,
          action: 'verify-otp',
          data: otpCall,
        };
        let systemLogs = await systemLogsHelper.composeSystemLogs(
          systemLogsData
        );

        // if otp is verified, check user if exists return user
        let user = await UserModel.findOne({
          phoneNumber: result.phoneNumber,
        });
        return sendResponse(
          response,
          moduleName,
          200,
          1,
          responseMsgs.otpVerified
          // "Your code has been verified successfully!"
        );
      } else {
        return sendResponse(
          response,
          moduleName,
          422,
          0,
          responseMsgs.invalidOtp
        );
      }
    } else {
      return sendResponse(
        response,
        moduleName,
        422,
        0,
        responseMsgs.otpExpired
        // "OTP has been expired."
      );
    }
  } catch (err) {
    console.log('---- Verify OTP error ----', err);
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

/** authentication for OTP external service **/
async function otpAuth() {
  const authPayload = {
    username: process.env.OTP_SERVICE_USERNAME,
    password: process.env.OTP_SERVICE_PASSWORD,
  };

  let authCall = await externalApiCall(
    process.env.OTP_SERVICE_AUTH_URL,
    authPayload
  );

  if (authCall && authCall.API_Token) {
    return authCall.API_Token;
  }
  return null;
}

function isOtpExpired(otpCreatedAt) {
  const createdAt = new Date(otpCreatedAt); // Convert createdAt to Date object
  const expiryDuration = 2 * 60 * 1000; // 2 minutes in milliseconds
  const currentTime = Date.now(); // Get current timestamp

  return currentTime - createdAt.getTime() > expiryDuration;
}
