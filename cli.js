#!/usr/bin/env node

const fs = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");
const program = require("commander");
const run = require("./main");

const HOMEDIR = join(require("os").homedir(), ".parity-dev");
const PARITY_BIN = join(HOMEDIR, "parity");

var noAction = true;

function setup() {
  try {
    fs.mkdirSync(HOMEDIR);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }

  if (!fs.existsSync(PARITY_BIN)) {
    console.log("Download latest Parity version, please wait");
    spawnSync(join(__dirname, "get_parity.sh"), { stdio: "inherit" });
  }
}

program
  .version("0.0.1")
  .option("-w, --workdir <dir>", "Specify a working dir.", "parity-data");

program
  .command("run")
  .description("Run Parity in development mode.")
  .action(cmd => {
    noAction = false;
    run(program.workdir);
  });

setup();
program.parse(process.argv);

if (noAction) {
  run(program.workdir);
}
