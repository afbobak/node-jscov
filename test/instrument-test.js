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
var burrito  = require("burrito");
var mustache = require("mustache");

var instrument = require(libpath + "/instrument");

// ==== Helpers

// ==== Test Case

buster.testCase("instrument-init", {
  "should exist": function () {
    assert.isFunction(instrument);
  }
});

// ==== Test Case

buster.testCase("instrument-wrapper", {
  "should prepend mustached header": function () {
    this.stub(mustache, "render").returns("header;");
    this.stub(path, "resolve").returns("headerfile");
    this.stub(fs, "readFileSync");
    fs.readFileSync.withArgs("lib-cov/coverage.json").returns("{}");
    fs.readFileSync.withArgs("headerfile").returns("header content");

    var wrapped = instrument("", "f", "c");

    assert.calledOnce(fs.readFileSync.withArgs("headerfile"));
    assert.calledOnce(mustache.render);
    assert.calledWith(mustache.render, "header content", {
      JSCOV_FILE   : "f",
      JSCOV_OUTPUT : "c"
    });
    assert.equals(wrapped, "header;");
  },

  "should ignore irrelevant lines": function () {
    this.stub(mustache, "render").returns("");

    var wrapped = instrument("/* comment */\n// test\n\n", "f", "c");

    assert.equals(wrapped, "");
  },

  "should wrap var": function () {
    this.stub(mustache, "render").returns("");

    var wrapped = instrument("var x = 1;", "", "");

    assert.equals(wrapped,
      "_$jscov[1]=0;\n" +
      "{\n" +
      "    _$jscovLine(1);\n" +
      "    var x = 1;\n" +
      "}");
  },

  "should double-wrap calls": function () {
    this.stub(mustache, "render").returns("");

    var wrapped = instrument("a.call();", "", "");

    assert.equals(wrapped,
      "_$jscov[1]=0;\n" +
      "_$jscov[1]=0;\n" +
      "{\n" +
      "    _$jscovLine(1);\n" +
      "    _$jscovLine(1)(a.call());\n" +
      "}");
  }
});
