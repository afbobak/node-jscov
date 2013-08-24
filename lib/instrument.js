/*jslint node: true, browser: false */
/*globals */
/*! Copyright (C) 2013 by Andreas F. Bobak, Switzerland. All Rights Reserved. !*/
"use strict";

var fs      = require("fs");
var path    = require("path");
var burrito = require("burrito");
var mustache = require("mustache");

var JSCOV_VAR = "_$jscov";
var JSCOV     = "_$jscovLine";

module.exports = function (source, filename, covFile, options) {
  options = options || {};
  options.varname = options.varname || JSCOV_VAR;
  options.funname = options.funname || JSCOV;

  var lines = [];
  var functions = [];
  // Inspired by buster-coverage
  var wrapped = burrito(source, function (node) {
    switch (node.name) {
    case "call":
    case "binary":
    case "unary-prefix":
    case "unary-postfix":
      lines.push(node.start.line + 1);
      node.wrap(options.funname + "(" + (node.start.line + 1) + ")(%s)");
      break;

    case "stat":
    case "throw":
    case "var":
      lines.push(node.start.line + 1);
      node.wrap("{" + options.funname + "(" + (node.start.line + 1) + ");%s}");
      break;

    default:
      break;
    }
  });

  /*jslint nomen: true*/
  var header = mustache.render(
    fs.readFileSync(path.resolve(__dirname +
      "/instrumented-header.js_")).toString("utf-8"),
    {
      JSCOV_FILE   : filename,
      JSCOV_OUTPUT : covFile
    }
  );
  var i;
  for (i = 0; i < lines.length; i++) {
    header += options.varname + "[" + lines[i] + "]=0;\n";
  }
  // header += options.funname + "(-1);\n";
  return header + wrapped;
};
