ModuleNames = {
  AuthController: "تصدیق",
  BookCallController: "کال کی درخواست کریں",
  CustomerController: "کسٹمر",
  FormController: "فارمز",
  FundManagerReportsController: "فنڈ مینجر رپورٹ",
  DailyFundPricesController: "فنڈ کی یومیہ قیمتیں",
  ConfigurationsController: "کنفیگریشنز",
  HajjUmmrahPlannerController: "حج اور عمرہ پلینر",
  NotificationController: "نوٹیفیکیشن",
  OTPController: "او -ٹی- پی کی تصدیق ",
  ProductController: "پراڈکٹس",
  TeamMemberController: "ٹیم ممبرز",
  ServiceRequestController: "Service Requests",
  FaqsController: "Faqs",
  FeedbacksController: "Feedbacks",
  ComplaintController: "Complaints",
};

ControllerWiseMsgs = {
  AuthController: {
    accountStatusMsg: "آپکا آکاوؑنٹ ",
    userLockedMsg: "آپکا آکاوؑنٹ لاک ہے ",
    userRoleMsg: "رول آرکائیو کر دیا گیا ہے۔",
    OtpSentMsg: "  او  -ٹی- پی بھیج دیا گیا ہے۔",
    OtpNotSentMsg: "او  -ٹی- پی بھیجا نہیں جا سکتا",
    CustomerCreatedByAdminMsg: "کسٹمر کو ایڈمن نے بنایا ہے۔",
    InvalidPinMsg: "غلط پن",
    InvalidCnicMsg: "غلط قومی شناختی کارڈ",
    CustomerExistsMsg:
      "دیئے گئے قومی شناختی کارڈ یا فون نمبر کے ساتھ صارف پہلے سے موجود ہے۔",
    CustomerCreatedMsg: "گاہک کامیابی کے ساتھ بنایا گیا ہے۔",
    UserPinUpdatedMsg: "پن کامیابی کے ساتھ اپ ڈیٹ ہو گیا۔",
    UserNotExists: "صارف موجود نہیں ہے۔",
    CustomerLogdOutMsg: "کسٹمر کامیابی سے لاگ آؤٹ ہو گیا ہے۔",
    UserIsLoggedIn: "صارف اب بھی لاگ ان ہے۔",
    CustomerNotExists: "کسٹمر موجود نہیں",
    CustomerAlreadyExists: "کسٹمر پہلے سے موجود ہے",
    CustomerExistsIn5thillar: "کسٹمر ففتھ پیلر میں موجود ہے۔",
    CustomerNotValidatedFrom5thillar:
      "کسٹمر کا فون نمبر ففتھ پیلر سے تصدیق شدہ نہیں ہے۔",
    CustomerNotExistsIn5thPillar: "کسٹمر ففتھ پیلر میں موجود نہیں ہے۔",
    InvalidPhoneNumberLength:
      "آپ کا رجسٹرڈ فون نمبر ہمارے ریکارڈز سے مطابقت نہیں رکھتا۔ براہ کرم سپورٹ سے رابطہ کریں۔",
  },
  BookCallController: {
    bookCallCreatedMsg: "کال کی درخواست کامیاب ہوگئی ہے۔",
    bookCallNotCreated: "کال کی درخواست بنانے میں ناکام",
  },
  CustomerController: {
    emailExists: "دی گئی ای میل کے ساتھ ریکارڈ پہلے سے موجود ہے۔",
    profileUpdated: "پروفائل کو کامیابی کے ساتھ اپ ڈیٹ کر دیا گیا ہے۔",
    phoneNumberUpdated: "فون نمبر کو کامیابی کے ساتھ اپ ڈیٹ کر دیا گیا ہے۔",
    accountUpdated: "اکاؤنٹ کامیابی سے اپ ڈیٹ ہو گیا ہے",
    accountDeleted: "اکاؤنٹ کامیابی سے حذف کر دیا گیا ہے۔",
    PdfNotGenerated: "پی ڈی ایف جنریشن یا اپ لوڈ ناکام ہو گیا",
    AFNandLapseCase: "ادائیگی ابھی کریں تاکہ سفر جاری رکھ سکیں!",
    FromBelow10Percentage: "آپ کا سفر شروع ہوچکا ہے۔۔ سفر جاری رکھیں",
    From11to50Percentage: "اپنے ہدف پر توجہ مرکوز رکھیں۔۔ کنٹریبیوشن دیتے رہیں",
    From51to80Percentage: "سفر اچھا جارہا ہے۔۔ کنٹریبیوشن دیتے رہیں",
    From81to100Percentage: "آپ بس چند کنٹریبیوشن کی دوری پر ہیں",
    From100Percentage: "مبارک ہو! آپ نے مقصد حاصل کر لیا ہے۔",
  },
  FundManagerReportsController: {
    frmFetched: "ایف-ایم-آر حاصل ہوگئیں",
  },
  ConfigurationsController: {
    lovsFetched: "تمام فہرستیں حاصل ہوگئیں",
    lovsNotFetched: "تمام فہرستیں حاصل نہیں ہوسکیں",
  },
  HajjUmmrahPlannerController: {
    termsMsg:
      " منتخب کردہ پراڈکٹ میں دی گئی عمر کے لیے درجِ ذیل دورانیہ استعمال کریں۔ ",
  },
  OTPController: {
    otpAuthFailed: "او -ٹی- پی کی تصدیق ناکام ہوگئی",
    unableToSendOtp:
      "او -ٹی- پی کی تفصیلات محفوظ کرنے سے قاصر، براہ کرم دوبارہ بھیجیں۔",
    otpVerified: "آپ کے کوڈ کی کامیابی سے تصدیق ہو گئی ہے۔",
    invalidOtp: "غلط او -ٹی- پی",
    otpExpired: "او -ٹی- پی کی میعاد ختم ہو گئی ہے۔",
    otpGenerated: "او -ٹی- پی تیار ہے۔",
    createOtpResponseCodes: {
      0: "ایس-ایم-ایس اور ای میل کامیابی کے ساتھ بھیج دیا گیا۔",
      1: "ایس-ایم-ایس کامیابی سے بھیج دیا گیا۔",
      2: "ای میل کامیابی سے بھیج دی گئی۔",
      3: "ایس-ایم-ایس اور ای میل بھیجا نہیں جا سکا۔",
      4: "اے-پی-آئی اکاؤنٹ کی میعاد ختم ہوگئی",
    },
    verifyOtpResponseCodes: {
      0: "کامیابی",
      1: "غلط او ٹی پی",
      2: "او -ٹی- پی کی میعاد ختم ہو گئی ہے۔",
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
  loginMsg: "کامیابی سے لاگ ان",
  recordFetched: "ریکارڈ آ گیا",
  recordCreated: "Record Created",
  recordNotCreated: "Record Not Created",
  recordNotFound: "ریکارڈ دستیاب نہیں",
  customerNotFound: "کسٹمرنہیں ملا",
  authFailed: "تصدیق ناکام ہوگئی",
  policiesNotFound: "policies Not Found",
  requestFormsFetched: "Request Forms fetched",
  productsFetched: "پراڈکٹس مل گیں  ",
  serviceRequestFetched: "Service Request fetched",
  updatedMsg: "ریکارڈ کو کامیابی کے ساتھ اپ ڈیٹ کر دیا گیا ہے۔",
  error_500: "کچھ غلط ہو گیا، براہ کرم بعد میں دوبارہ کوشش کریں۔",
};

module.exports = {
  ModuleNames,
  CommonMsgs,
  ControllerWiseMsgs,
};
