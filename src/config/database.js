const mongoose = require("mongoose");

if (process.env.ENVIRONMENT.toUpperCase() === "PRODUCTION") {
  const fs = require("fs");
  const connection = mongoose.connection;

  const sslDirectory = process.env.SSL_DIRECTORY; // case-sensitive path

  if (!sslDirectory) {
    console.log("SSL Directory not found!");
    process.exit(1);
  }

  const tlsCAFile = fs.readFileSync(`${sslDirectory}/ca.pem`);
  const tlsCertificateKeyFile = fs.readFileSync(`${sslDirectory}/client.pem`);

  module.exports = async () => {
    try {
      // Connect to the MongoDB server with TLS options
      await mongoose.connect(process.env.MONGO_DB_URI, {
        tls: true, // Enable TLS/SSL
        tlsCAFile: `${sslDirectory}/ca.pem`, // Path to CA file
        tlsCertificateKeyFile: `${sslDirectory}/client.pem`, // Path to client certificate and key
        tlsAllowInvalidCertificates: true, // Use this based on your certificate validation need
        auth: {
          username: process.env.MONGO_DB_USER, // 'user' is now 'username' in Mongoose 8
          password: process.env.MONGO_DB_PASS,
        },
      });
      console.log("MongoDB connection succeeded!");

      connection.on("disconnected", function () {
        throw new Error("MongoDB disconnected!");
      });
    } catch (error) {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
  };
} else if (process.env.ENVIRONMENT.toUpperCase() === "PRODUCTION-NOSSL") {
  console.log(
    "Using Production environment 'without SSL' database configurations"
  );

  const connection = mongoose.connection;

  module.exports = async () => {
    try {
      // Connect to the MongoDB server without SSL options
      await mongoose.connect(process.env.MONGO_DB_URI, {
        auth: {
          username: process.env.MONGO_DB_USER,
          password: process.env.MONGO_DB_PASS,
        },
      });
      console.log("MongoDB connection succeeded!");

      connection.on("disconnected", function () {
        throw new Error("MongoDB disconnected!");
      });
    } catch (error) {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
  };
} else {
  console.log(
    "Couldn't find value for ENVIRONMENT. Using Development environment database connection configurations"
  );

  module.exports = async () => {
    try {
      // Connect using default options for development
      await mongoose.connect(process.env.MONGO_DB_URI);
      console.log("MongoDB connection succeeded!");
    } catch (error) {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
  };
}
