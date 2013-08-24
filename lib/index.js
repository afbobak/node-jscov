/*jslint node: true, browser: false */
/*globals */
/*! Copyright (C) 2013 by Andreas F. Bobak, Switzerland. All Rights Reserved. !*/
"use strict";

var commander     = require("commander");
var fs            = require("fs");
var path          = require("path");
var child_process = require("child_process");

var instrument = require("./instrument");
var report     = require("./report-lcov");

commander
  .version(require("../package.json").version)
  .usage("[options] <source-folder> <destination-folder>")
  .description("Instrument JavaScript with code coverage information.")
  .option("--encoding", "assume .js files use the given character encoding")
  .option("--coverage", "filename to use for coverage statistics")
  .option("--report", "create report")
  .parse(process.argv);

if (commander.args.length < 2) {
  commander.help();
}

commander.encoding = commander.encoding || "utf8";
commander.coverage = commander.coverage || "coverage.json";

var srcFolder = commander.args[0];
var dstFolder = commander.args[1];

function wrap(filename, destination) {
  console.log("Wrapping: " + filename + " -> " + destination);
  var source  = fs.readFileSync(filename, commander.encoding);
  var wrapped = instrument(source, filename,
    path.join(dstFolder, commander.coverage));
  fs.writeFileSync(destination, wrapped, commander.encoding);
}

function instrumentFolder(folder, destFolder) {
  fs.readdir(folder, function (err, files) {
    var i;
    for (i = files.length - 1; i >= 0; i--) {
      var file     = files[i];
      var filename = path.join(folder, file);
      var stats    = fs.statSync(filename);
      if (stats.isFile()) {
        var destination = path.join(destFolder, file);
        if (path.extname(file) === ".js") {
          wrap(filename, destination);
        } else {
          console.log("Linking:  " + filename + " -> " + destination);
          fs.symlinkSync(path.resolve(filename), destination);
        }
      }
    }
  });
}

if (commander.report) {

  var covFile = path.join(dstFolder, commander.coverage);
  report(covFile, dstFolder);

} else {

  if (fs.existsSync(dstFolder)) {
    console.log("ERROR: Folder already exists: ", dstFolder);
    process.exit(5);
  }
  fs.mkdirSync(dstFolder);

  instrumentFolder(srcFolder, dstFolder);
}
