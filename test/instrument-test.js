/*jslint devel: true, node: true*/
/*globals */
/*! Copyright (C) 2013 by Osares AG, Switzerland. All Rights Reserved. !*/
"use strict";

var libpath = process.env.ENABLE_COV ? "../lib-cov" : "../lib";

var sinon  = require("sinon");
var assert = require("assert");

var fs       = require("fs");
var path     = require("path");
var burrito  = require("burrito");
var mustache = require("mustache");

var instrument = require(libpath + "/instrument");

// ==== Helpers

// ==== Test Case

suite("instrument-init", function () {
  test("should exist", function () {
    assert.equal(typeof instrument, "function");
  });
});

// ==== Test Case

suite("instrument-wrapper", function () {
  test("should prepend mustached header", sinon.test(function () {
    this.stub(mustache, "render").returns("header;");
    this.stub(path, "resolve").returns("headerfile");
    this.stub(fs, "readFileSync");
    fs.readFileSync.withArgs("lib-cov/coverage.json").returns("{}");
    fs.readFileSync.withArgs("headerfile").returns("header content");

    var wrapped = instrument("", "f", "c");

    sinon.assert.calledOnce(fs.readFileSync.withArgs("headerfile"));
    sinon.assert.calledOnce(mustache.render);
    sinon.assert.calledWith(mustache.render, "header content", {
      JSCOV_FILE   : "f",
      JSCOV_OUTPUT : "c"
    });
    assert.equal(wrapped, "header;");
  }));

  test("should ignore irrelevant lines", sinon.test(function () {
    this.stub(mustache, "render").returns("");

    var wrapped = instrument("/* comment */\n// test\n\n", "f", "c");

    assert.equal(wrapped, "");
  }));

  test("should wrap var", sinon.test(function () {
    this.stub(mustache, "render").returns("");

    var wrapped = instrument("var x = 1;", "", "");

    assert.equal(wrapped,
      "_$jscov[1]=0;\n" +
      "{\n" +
      "    _$jscovLine(1);\n" +
      "    var x = 1;\n" +
      "}");
  }));

  test("should double-wrap calls", sinon.test(function () {
    this.stub(mustache, "render").returns("");

    var wrapped = instrument("a.call();", "", "");

    assert.equal(wrapped,
      "_$jscov[1]=0;\n" +
      "_$jscov[1]=0;\n" +
      "{\n" +
      "    _$jscovLine(1);\n" +
      "    _$jscovLine(1)(a.call());\n" +
      "}");
  }));
});
