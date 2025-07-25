const axios = require("axios");
const qs = require("qs");

module.exports = async (
  url,
  input,
  type = "POST",
  xFrom = false,
  additonalHeaders = {}
) => {
  let headers = {};
  if (xFrom) {
    input = qs.stringify(input);
    headers = {
      "Content-Type": "multipart/form-data",
      ...additonalHeaders,
    };
  }
  if (!xFrom) {
    headers = {
      // "Content-Type": "multipart/form-data",
      ...additonalHeaders,
    };
  }
  try {
    console.log("sending call:", url);
    console.log("Method:", type);
    console.log("Headers:", headers);

    if (type === "POST") {
      // console.log("Data:", input);
    }

    // Common axios configuration
    const config = {
      url,
      method: type,
      headers,
      ...(type === "POST" && { data: input, maxBodyLength: Infinity }),
    };

    const { data } = await axios(config);

    if (data && data.data) {
      // console.log("Data from API:", data);
      // console.log("data.data from API:", data.data);
      return data.data;
    }
    if (data.error) {
      return data.error;
    }
    console.log("data returned from api", data);

    return data;
  } catch (error) {
    console.log("error while requesting", url, error.message);
  }
};
