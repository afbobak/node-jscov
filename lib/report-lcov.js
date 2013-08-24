/*jslint node: true, browser: false */
/*globals */
/*! Copyright (C) 2013 by Andreas F. Bobak, Switzerland. All Rights Reserved. !*/
"use strict";

var fs   = require("fs");
var path = require("path");

module.exports = function (covFile, destination) {
  var cov = JSON.parse(fs.readFileSync(covFile, "utf8"));

  var filename, line, report = "";
  for (filename in cov) {
    if (cov.hasOwnProperty(filename)) {
      report += "SF:" + path.resolve(filename) + "\n";
      var fileCov = cov[filename];
      for (line in fileCov) {
        if (fileCov.hasOwnProperty(line)) {
          report += "DA:" + line + "," + fileCov[line] + "\n";
        }
      }
      report += "end_of_record\n";
    }
  }

  fs.writeFileSync(path.join(destination, "coverage.lcov"), report, "utf8");
};
