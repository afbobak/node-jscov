/*jslint node: true, browser: false */
/*globals */
/*! Copyright (C) 2013 by Andreas F. Bobak, Switzerland. All Rights Reserved. !*/
"use strict";

var fs   = require("fs");
var path = require("path");

module.exports = function (covFile, destination) {
  var cov = JSON.parse(fs.readFileSync(covFile, "utf8"));

  var reportCSV = "GROUP,PACKAGE,CLASS," +
    "INSTRUCTION_MISSED,INSTRUCTION_COVERED," +
    "BRANCH_MISSED,BRANCH_COVERED," +
    "LINE_MISSED,LINE_COVERED," +
    "COMPLEXITY_MISSED,COMPLEXITY_COVERED," +
    "METHOD_MISSED,METHOD_COVERED\n";
  var reportXML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  reportXML += '<!DOCTYPE report PUBLIC "-//JACOCO//DTD Report 1.0//EN" ' +
    '"report.dtd">';
  reportXML += '<report name="jscov">';
  reportXML += '<sessioninfo id="0" start="0" dump="0"/>';
  reportXML += '<package name="javascript">';
  var filename, line;
  for (filename in cov) {
    if (cov.hasOwnProperty(filename)) {
      var fileCov = cov[filename];
      var lines   = 0;
      var covered = 0;
      var missed  = 0;
      reportXML += '<sourcefile name="' + filename + '">';
      for (line in fileCov) {
        if (fileCov.hasOwnProperty(line)) {
          lines++;
          if (fileCov[line]) {
            covered++;
          } else {
            missed++;
          }
        }
      }

      reportXML += '<counter type="INSTRUCTION" missed="0" covered="0"/>';
      reportXML += '<counter type="BRANCH" missed="0" covered="0"/>';
      reportXML += '<counter type="LINE" missed="' + missed +
        '" covered="' + covered + '"/>';
      reportXML += '<counter type="COMPLEXITY" missed="0" covered="0"/>';
      reportXML += '<counter type="METHOD" missed="0" covered="0"/>';
      reportXML += '<counter type="CLASS" missed="0" covered="0"/>';
      reportXML += '</sourcefile>';

      reportCSV += "jscov,javascript," + filename + ",0,0,0,0," +
        missed + "," + covered +
        ",0,0,0,0\n";
    }
  }
  reportXML += '</package>';
  reportXML += '</report>';

  fs.writeFileSync(path.join(destination, "jacoco.csv"), reportCSV, "utf8");
  fs.writeFileSync(path.join(destination, "jacoco.xml"), reportXML, "utf8");
};
