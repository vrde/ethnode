#!/usr/bin/env node

const fs = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");
const program = require("commander");
const run = require("./main2");

const HOMEDIR = join(require("os").homedir(), ".ethnode");
const PARITY_BIN = join(HOMEDIR, "parity");

var noAction = true;

program
  .version("0.0.1")
  .option("-w, --workdir <dir>", "Specify a working dir.", "parity-data");

program
  .command("parity")
  .description("Run a Parity development node.")
  .action(cmd => {
    noAction = false;
    run("parity", program.workdir);
  });

program
  .command("geth")
  .description("Run a Geth development node.")
  .action(cmd => {
    noAction = false;
    run("geth", program.workdir);
  });

program.parse(process.argv);

if (noAction) {
  run("geth", program.workdir);
}
