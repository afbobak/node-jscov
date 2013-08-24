/*jslint devel: true, node: true*/
/*globals */
/*! Copyright (C) 2013 by Osares AG, Switzerland. All Rights Reserved. !*/
"use strict";

var libpath = process.env.ENABLE_COV ? "../lib-cov" : "../lib";

var buster = require("buster");
var sinon  = require("buster/node_modules/sinon");
var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

var fs       = require("fs");
var path     = require("path");

var reportLvoc = require(libpath + "/report-lcov");

// ==== Helpers

// ==== Test Case

buster.testCase("report-lcov-init", {
  "should exist": function () {
    assert.isFunction(reportLvoc);
  }
});

// ==== Test Case

buster.testCase("//report-lcov-report", {
  "should write coverage": function () {
    this.stub(fs, "readFileSync").returns("{}");
    this.stub(fs, "writeFileSync");
    reportLvoc("cov");
    assert.calledOnce(fs.readFileSync.withArgs("cov"));
  }
});
