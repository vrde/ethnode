#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const { sep } = require("path");
const program = require("commander");
const run = require("./main");
const packageJson = require("./package.json");

var noAction = true;

function getOptions(program) {
  return {
    workdir: program.workdir || fs.mkdtempSync(`${os.tmpdir()}${sep}`),
    download: program.download,
    logging: program.logging,
    allocate: program.allocate,
    chainId: program.chainid,
    execute: program.execute
  };
}

function parseChainId(value) {
  if (value === "random") {
    return 1e9 + Math.round(Math.random() * 1e9);
  } else {
    return parseInt(value, 10);
  }
}

program
  .version(packageJson.version)
  .option("-d, --download", "Download the Ethereum client and exit.")
  .option("-w, --workdir <dir>", "Specify a working dir.")
  .option("-l, --logging <level>", "Specify logging level (error, warn, info).")
  .option("-w, --workdir <dir>", "Specify a working dir.")
  .option(
    "-c, --chainid <int>",
    'Set the chainId (also called network id), can be an int or the string "random".',
    parseChainId,
    666666
  )
  .option(
    "-a, --allocate <addresses>",
    "Comma separated list of addresses. Allocate 100 Ethers for each address.",
    val => val.split(","),
    []
  )
  .option(
    "-e, --execute <command>",
    "Start ethnode, execute command, and exit ethnode (useful for testing)."
  );

program.version(packageJson.version);

program
  .command("openethereum")
  .description("Run an Openethereum development node.")
  .action(cmd => {
    noAction = false;
    run("openethereum", getOptions(program));
  });

program
  .command("geth")
  .description("Run a Geth development node.")
  .action(cmd => {
    noAction = false;
    run("geth", getOptions(program));
  });

program.parse(process.argv);

if (noAction) {
  run("geth", getOptions(program));
}
