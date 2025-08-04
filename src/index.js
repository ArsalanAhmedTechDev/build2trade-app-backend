// includes
const express = require("express");
const app = express();
let path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

app.use(express.static("public"));

app.use(helmet());

// Data Sanitization against NOSql query injection
app.use(mongoSanitize());

// Data Sanitization against site script XSS
app.use(xss());

// routes
let authRoutes = require("./routes/auth/index");
let optRoutes = require("./routes/otp/index");
let productRoutes = require("./routes/product/index");
let fmrRoutes = require("./routes/fundManagerReport/index");
let fundPricesRoutes = require("./routes/funds/index");
let mabrurProductRoutes = require("./routes/mabrurProducts/index");
let formRoutes = require("./routes/forms/index");
let customerRoutes = require("./routes/customer/index");
let subscriptionRoutes = require("./routes/subscriptions/index");
let notificationRoutes = require("./routes/notifications/index");
let teamMemberRoutes = require("./routes/teamMembers/index");
let bookCallRoutes = require("./routes/bookCall/index");
let configurationsRoutes = require("./routes/configurations/index");
let serviceRequestRoutes = require("./routes/serviceRequest/index");
let faqsRoutes = require("./routes/faqs/index");
let feedbacksRoutes = require("./routes/feedbacks/index");
let complaintRoutes = require("./routes/complaints/index");

app.use(
  cors({
    origin: "*",
  })
);

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // if you're mixing JSON and form-data

// load env file
// require('dotenv').config()
require("dotenv").config({ path: path.resolve(__dirname, "./../.env") });
// MongoDB Connection Using Mongoose & Models
require("./config/database")();

/** --- API ROUTES --- **/
// Authentication Routes
app.use("/auth/", authRoutes);

// OTP Routes
app.use("/otp/", optRoutes);

// Product Routes
app.use("/subscriptions/", subscriptionRoutes);

// Product Routes
app.use("/products/", productRoutes);

// Mabrur Product Routes
app.use("/mabrurProducts/", mabrurProductRoutes);

// fundManagerReport Routes
app.use("/fundManagerReport/", fmrRoutes);

// Fund Prices Routes
app.use("/fundPrices/", fundPricesRoutes);

// Form Routes
app.use("/forms/", formRoutes);

// Notification Routes
app.use("/notifications/", notificationRoutes);

// Customer Routes
app.use("/customers/", customerRoutes);

// Team Members Routes
app.use("/teamMembers/", teamMemberRoutes);

// Customer Routes
app.use("/bookcalls/", bookCallRoutes);

app.use("/configurations/", configurationsRoutes);

app.use("/serviceRequests/", serviceRequestRoutes);
app.use("/faqs/", faqsRoutes);
app.use("/feedbacks/", feedbacksRoutes);
app.use("/complaints/", complaintRoutes);

/** --- Return 404 on any non-existent route --- **/
// app.use((req, res) => {
//     res.status(404).send('Not Found');
// });

var port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});

module.exports = app;
