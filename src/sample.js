return sendResponse(response, moduleName, 422, 0, checkKeys);
return sendResponse(
  response,
  moduleName,
  422,
  0,
  "Your account is " + user.status
);
return sendResponse(response, moduleName, 422, 0, message);

return sendResponse(response, moduleName, 422, 0, "Role is archived");

return sendResponse(response, moduleName, 200, 1, "OTP has been sent", getResp);

return sendResponse(
  response,
  moduleName,
  200,
  0,
  "Unable to send OTP",
  getResp
);

return sendResponse(
  response,
  moduleName,
  200,
  0,
  "Customer is created by Admin",
  getResp
);
return sendResponse(
  response,
  moduleName,
  200,
  1,
  "Login Successfully",
  getResp
);

return sendResponse(response, moduleName, 422, 0, "Invalid Pin");
return sendResponse(response, moduleName, 422, 0, "Invalid CNIC");
return sendResponse(
  response,
  moduleName,
  500,
  0,
  "Something went wrong, please try again later."
);

return sendResponse(
  response,
  moduleName,
  422,
  0,
  "Customer already exists with the given CNIC or Phone Number"
);

return sendResponse(
  response,
  moduleName,
  200,
  1,
  "Customer has been created successfully",
  getResp
);
return sendResponse(
  response,
  moduleName,
  500,
  0,
  "Something went wrong, please try again later."
);
return sendResponse(response, moduleName, 200, 1, "Pin updated successfully");
return sendResponse(response, moduleName, 422, 0, "User does not exists");
return sendResponse(
  response,
  moduleName,
  500,
  0,
  "Something went wrong, please try again later."
);
return sendResponse(
  response,
  moduleName,
  200,
  1,
  "Customer has been logout successfully"
);
return sendResponse(
  response,
  moduleName,
  500,
  0,
  "Something went wrong, please try again later."
);
return sendResponse(response, moduleName, 200, 0, "User is still logged in");
return sendResponse(response, moduleName, 200, 1, responseMsg, {
  customerExists: customerExists,
});
return sendResponse(
  response,
  moduleName,
  500,
  0,
  "Something went wrong, please try again later."
);
// done **********************************************************

return sendResponse(
  response,
  moduleName,
  200,
  1,
  "Book call has been created successfully",
  savedRecord
);

return sendResponse(response, moduleName, 500, 0, "Failed to create book call");
