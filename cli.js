#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const { join, sep } = require("path");
const { spawnSync } = require("child_process");
const program = require("commander");
const run = require("./main");
const packageJson = require("./package.json");

const HOMEDIR = join(require("os").homedir(), ".ethnode");
const PARITY_BIN = join(HOMEDIR, "parity");

var noAction = true;

function workdir() {
  if (program.workdir) {
    return program.workdir;
  } else {
    const tmpDir = os.tmpdir();
    return fs.mkdtempSync(`${tmpDir}${sep}`);
  }
}

program
  .version(packageJson.version)
  .option("-w, --workdir <dir>", "Specify a working dir.");

program.version(packageJson.version);

program
  .command("parity")
  .description("Run a Parity development node.")
  .action(cmd => {
    noAction = false;
    run("parity", workdir());
  });

program
  .command("geth")
  .description("Run a Geth development node.")
  .action(cmd => {
    noAction = false;
    run("geth", workdir());
  });

program.parse(process.argv);

if (noAction) {
  run("geth", workdir());
}
