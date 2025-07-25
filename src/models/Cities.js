const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const citiesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { collection: "cities" }
);

module.exports = mongoose.model("cities", citiesSchema);
