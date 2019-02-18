const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { numberToHex } = require("web3-utils");
const { getKeypairs } = require("./crypto");

const HOMEDIR = path.join(require("os").homedir(), ".ethnode");
const KEYS_SOURCE = path.join(__dirname, "keys");

function randomId() {
  return numberToHex(1e9 + Math.round(Math.random() * 1e9));
}

function getPaths(client, workdir) {
  const base = path.join(workdir, client);
  return {
    binary: path.join(HOMEDIR, client),
    base: base,
    genesis: path.join(base, "genesis.json"),
    data: path.join(base, "data"),
    keys: path.join(base, "keys"),
    password: path.join(__dirname, "keys", "password.secret")
  };
}

function generateGenesis(client, balances, networkId) {
  const genesis = JSON.parse(
    JSON.stringify(require(`./genesis.${client}.json`))
  );
  if (client === "geth") {
    genesis.config.chainId = networkId;
    genesis.extraData =
      "0x" +
      "0".repeat(64) +
      Object.keys(balances)[0].substr(2) +
      "0".repeat(130);
    genesis.alloc = { ...genesis.alloc, ...balances };
  } else if (client === "parity") {
    genesis.params.networkID = networkId;
    genesis.accounts = { ...genesis.accounts, ...balances };
  }
  return genesis;
}

function generateBalances(keypairs, balance) {
  balance = balance || "100000000000000000000";
  const balances = {};
  for (var i = 0; i < keypairs.length; i++) {
    balances[keypairs[i].address] = {
      balance: balance
    };
  }
  return balances;
}

function setup(client, workdir) {
  const paths = getPaths(client, workdir);
  try {
    fs.mkdirSync(HOMEDIR);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }

  if (!fs.existsSync(paths.binary)) {
    console.log(`Download latest ${client} version, please wait.`);
    spawnSync(path.join(__dirname, `get_${client}.sh`), { stdio: "inherit" });
  }
}

function provide(client, workdir, networkId) {
  const paths = getPaths(client, workdir);
  const keypairs = getKeypairs(KEYS_SOURCE, "password");
  const genesis = generateGenesis(
    client,
    generateBalances(keypairs),
    networkId
  );
  let keysDest =
    client === "geth" ? paths.keys : path.join(paths.keys, genesis.name);

  try {
    fs.mkdirSync(paths.base, { recursive: true });
    fs.mkdirSync(keysDest, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  console.log("Init new configuration in", workdir);

  fs.writeFileSync(paths.genesis, JSON.stringify(genesis, null, 2));

  fs.readdirSync(KEYS_SOURCE)
    .filter(filename => filename.startsWith("UTC--"))
    .map(filename =>
      fs.copyFileSync(
        path.join(KEYS_SOURCE, filename),
        path.join(keysDest, filename)
      )
    );

  if (client === "geth") {
    spawnSync(paths.binary, ["--datadir", paths.data, "init", paths.genesis], {
      stdio: "inherit"
    });
  }
}

function run(client, workdir, networkId) {
  networkId = parseInt(networkId, 10) || randomId();
  const paths = getPaths(client, workdir);
  setup(client, workdir);
  if (!fs.existsSync(paths.genesis)) {
    provide(client, workdir, networkId);
  }

  const genesis = JSON.parse(fs.readFileSync(paths.genesis));
  const keypairs = getKeypairs(
    client === "geth" ? paths.keys : path.join(paths.keys, genesis.name),
    "password"
  );

  console.log("Run development node using configuration in", workdir);
  console.log("Test accounts");
  console.log("#  Address                                    Private Key");
  for (var i = 0; i < keypairs.length; i++) {
    console.log(`${i}: ${keypairs[i].address} ${keypairs[i].privateKey}`);
  }
  console.log("\n");

  let args;
  if (client === "geth") {
    args = [
      "--datadir",
      paths.data,
      "--mine",
      "--targetgaslimit",
      "94000000",
      "--port",
      "30311",
      "--rpc",
      "--rpcaddr",
      "localhost",
      "--rpcport",
      "8545",
      "--rpcapi",
      "personal,db,eth,net,web3,txpool,miner,debug",
      "--gasprice",
      "4000000000",
      "--targetgaslimit",
      "4712388",
      "--rpccorsdomain",
      "*",
      "--keystore",
      paths.keys,
      "--unlock",
      keypairs.map(keypair => keypair.address).join(","),
      "--password",
      paths.password,
      "--networkid",
      networkId
    ];
  } else if (client === "parity") {
    args = [
      "--db-path",
      paths.data,
      "--chain",
      paths.genesis,
      "--keys-path",
      paths.keys,
      "--min-gas-price",
      "4000000000",
      "--jsonrpc-cors",
      "all",
      "--jsonrpc-apis",
      "all",
      "--fast-unlock",
      "--unlock",
      keypairs.map(keypair => keypair.address).join(","),
      "--password",
      paths.password,
      "--network-id",
      networkId
    ];
  } else {
    throw `Client "${client}" is not supported`;
  }

  console.log("running:", paths.binary, args.join(" "));
  spawnSync(paths.binary, args, { stdio: "inherit" });
}

module.exports = run;
