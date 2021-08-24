#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const { sep } = require("path");
const { program, CommanderError } = require("commander");
const run = require("./main");
const packageJson = require("./package.json");

function getOptions(program) {
  return {
    workdir: program.workdir || fs.mkdtempSync(`${os.tmpdir()}${sep}`),
    download: program.download,
    logging: program.logging,
    allocate: program.allocate,
    chainId: program.chainid,
    execute: program.execute,
    nodeArguments: program.nodeArguments
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
  .option(
    "-c, --chainid <int>",
    'Set the chainId (also called network id), can be an int or the string "random".',
    parseChainId,
    666666
  )
  .option(
    "-a, --allocate <addresses>",
    "Comma separated list of addresses. Allocate 100 Ethers for each address.",
    (val) => val.split(","),
    []
  )
  .option(
    "-e, --execute <command>",
    "Start ethnode, execute command, and exit ethnode (useful for testing)."
  )
  .option(
    "--node-arguments <args>",
    "Arguments that are passed directly to ethnode's underlying Ethereum node."
  );

program
  .command("openethereum")
  .description("Run an Openethereum development node.")
  .action((cmd) => {
    run("openethereum", getOptions(program.opts()));
  });

program
  .command("geth", { isDefault: true })
  .description("Run a Geth development node.")
  .action((cmd) => {
    run("geth", getOptions(program.opts()));
  });

program.parse(process.argv);
