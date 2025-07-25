ModuleNames = {
  AuthController: "Authentication",
  BookCallController: "Request a Call",
  CustomerController: "Customer",
  FormController: "Forms",
  FundManagerReportsController: "FMR",
  DailyFundPricesController: "Daily Fund Prices",
  ConfigurationsController: "Configurations",
  HajjUmmrahPlannerController: "Hajj/Umrah Planner",
  NotificationController: "Notifications",
  OTPController: "OTP Verification",
  ProductController: "Products",
  TeamMemberController: "Team Members",
  ServiceRequestController: "Service Requests",
  FaqsController: "Faqs",
  FeedbacksController: "Feedbacks",
  ComplaintController: "Complaints",
};

ControllerWiseMsgs = {
  AuthController: {
    accountStatusMsg: "Your account is ",
    userLockedMsg: "User is locked until ",
    userRoleMsg: "Role is archived",
    OtpSentMsg: "OTP has been sent",
    OtpNotSentMsg: "Unable to send OTP",
    CustomerCreatedByAdminMsg: "Customer is created by Admin",
    InvalidPinMsg: "Invalid Pin",
    InvalidCnicMsg: "Invalid CNIC",
    CustomerExistsMsg:
      "Customer already exists with the given CNIC or Phone Number",
    CustomerCreatedMsg: "Customer has been created successfully",
    UserPinUpdatedMsg: "Pin updated successfully",
    UserNotExists: "User does not exists",
    CustomerLogdOutMsg: "Customer has been logout successfully",
    UserIsLoggedIn: "User is still logged in",
    CustomerNotExists: "Customer does not exist",
    CustomerAlreadyExists: "Customer already exists.",
    CustomerExistsIn5thillar: "Customer exists in 5th Pillar",
    CustomerNotValidatedFrom5thillar:
      "Customer's phone number not validated from 5th Pillar",
    CustomerNotExistsIn5thPillar: "Customer does not exists in 5th Pillar",
    InvalidPhoneNumberLength:
      "Your registered phone number does not match with our records. Please contact support.",
  },
  BookCallController: {
    bookCallCreatedMsg: "Request a call has been created successfully",
    bookCallNotCreated: "Failed to create a request call",
  },
  CustomerController: {
    emailExists: "Record already exists with the given email",
    profileUpdated: "Profile has been updated successfully",
    phoneNumberUpdated: "Phone Number has been updated successfully",
    accountUpdated: "Account has been updated successfully",
    accountDeleted: "Account has been deleted successfully",
    PdfNotGenerated: "PDF generation or upload failed",
    AFNandLapseCase: "Pay now to continue!",
    FromBelow10Percentage: "Your journey has begun.. Keep going!",
    From11to50Percentage: "Stay focused on your goal.. keep contributing!",
    From51to80Percentage: "Great going.. keep contributing!",
    From81to100Percentage: "You’re just a few contributions away!",
    From100Percentage: "Congratulations! You have achieved the goal.",
  },
  FundManagerReportsController: {
    frmFetched: "FMR fetched",
  },
  ConfigurationsController: {
    lovsFetched: "All Listings fetched successfully",
    lovsNotFetched: "Failed to get all listings",
  },
  HajjUmmrahPlannerController: {
    termsMsg:
      "Please use the following terms for the given age in selected product. ",
  },
  OTPController: {
    otpAuthFailed: "OTP Authentication failed",
    unableToSendOtp: "Unable to save OTP details, please resend.",
    otpVerified: "Your code has been verified successfully!",
    invalidOtp: "Invalid OTP",
    otpExpired: "OTP has been expired.",
    otpGenerated: "OTP has been generated",
    createOtpResponseCodes: {
      0: "SMS & email sent successfully.",
      1: "SMS sent successfully.",
      2: "Email sent successfully.",
      3: "SMS & email couldn't be sent.",
      4: "API account expired",
    },
    verifyOtpResponseCodes: {
      0: "Success",
      1: "Invalid OTP",
      2: "Expired OTP",
    },
  },
  ServiceRequestController: {
    requestFormCreated: "Request Form has been created successfully",
    requestFormNotCreated: "Getting Error From 5th Pillar API",
    serviceRequestNotFound: "Service Request Not found",
  },
  FeedbacksController: {
    feedbackCreatedMsg: "Feedback has been created successfully",
    feedbackNotCreated: "Failed to create a feedback",
    feedbackAlreadyExistMsg: "You have already created feedback",
  },
  ComplaintController: {
    inValidPolicyNoFormat: "Invalid membership number format.",
    complaintCreated: "Complaint successfully created.",
    complaintNotCreated: "Complaint not created.",
    complaintsFetched: "Complaints fetched successfully",
  },
};

CommonMsgs = {
  loginMsg: "Login Successfully",
  recordFetched: "Record fetched",
  recordCreated: "Record Created",
  recordNotCreated: "Record Not Created",
  recordNotFound: "Record not found",
  customerNotFound: "Customer not found",
  authFailed: "Authentication failed",
  policiesNotFound: "policies Not Found",
  requestFormsFetched: "Request Forms fetched",
  productsFetched: "Products fetched",
  serviceRequestFetched: "Service Request fetched",
  updatedMsg: "Record has been Updated successfully",
  error_500: "Something went wrong, please try again later.",
};

module.exports = {
  ModuleNames,
  CommonMsgs,
  ControllerWiseMsgs,
};
