const path = require("path");

module.exports = {
  i18n: {
    locales: ["en", "zh"],
    defaultLocale: "en",
    localeDetection: false,
    localePath: path.resolve("./public/locales"),
  },
};
