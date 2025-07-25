// includes
const mongoose = require("mongoose");
const sanitize = require("mongo-sanitize");

// Models
const CitiesModel = require("../../models/Cities");

const {
  sendResponse,
  setUserResponse,
  authenticate,
} = require("../../helpers/utils");

// module name
const moduleName = "Cities";
// const coreAPIUrl = process.env.CORE_API_URL;

module.exports = {
  getAllListings,
};

/** Get All Listings For Dropdowns model **/
async function getAllListings(request, response) {
  try {
    // let cities = await City.find({});
    console.log("LISTING API CALLED.......................")
    let data = {};
    let cities = await CitiesModel.find({});
    data.cities = cities;
    if (data) {
      return sendResponse(
        response,
        moduleName,
        200,
        1,
        "All Listings fetched successfully",
        data
      );
    }

    return sendResponse(
      response,
      moduleName,
      500,
      0,
      "Failed to get all listings"
    );
  } catch (error) {
    console.log("--- Get All Listings API Error ---", error);
    return sendResponse(
      response,
      moduleName,
      500,
      0,
      "Something went wrong, please try again later."
    );
  }
}

