/** External API Call */
const axios = require("axios");
const qs = require("qs");

module.exports = async (
  url,
  input,
  type = "POST",
  xFrom = false,
  additionalHeaders = {}
) => {
  console.log("Sending call to:", url);

  let headers = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };

  if (xFrom) {
    input = qs.stringify(input);
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  try {
    const { data } = await axios({
      url,
      method: type,
      data: input,
      headers,
      timeout: 5000, // Set a 5-second timeout to avoid long waits
      maxBodyLength: Infinity,
    });

    console.log("Data returned from API:", data);
    return data.data || data.error || data;
  } catch (error) {
    console.error("Error while requesting:", url, error.message);
    return false;
  }
};
