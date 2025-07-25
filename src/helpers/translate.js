const lang = require("../lang");
const _ = require("lodash");

module.exports = (type, key, replace) => {
  let text = _.get(lang[type], key);

  if (replace && typeof replace === "object") {
    for (i in replace) {
      if (typeof replace[i] === "string") {
        text = _.replace(text, i, replace[i]);
      }
    }
  }
  return text;
};
