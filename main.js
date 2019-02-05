const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const { sha3, bytesToHex, numberToHex } = require("web3-utils");
const secp256k1 = require("secp256k1");
const keythereum = require("keythereum");

const HOMEDIR = path.join(require("os").homedir(), ".parity-dev");
const genesisTemplate = require("./genesis.json");

function getKeypair(keyObject, password) {
  const privateKey = keythereum.recover(password, keyObject);
  const publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1, 65);
  return {
    address: "0x" + sha3(bytesToHex(publicKey)).slice(-40),
    privateKey: bytesToHex(privateKey)
  };
}

function getAllKeypairs(keyPath, password) {
  return fs
    .readdirSync(keyPath)
    .filter(filename => filename.startsWith("UTC--"))
    .map(filename => JSON.parse(fs.readFileSync(path.join(keyPath, filename))))
    .map(keyObject => getKeypair(keyObject, password));
}

function generateGenesis(keypairs) {
  const genesis = JSON.parse(JSON.stringify(genesisTemplate));
  genesis.params.networkID = numberToHex(1e9 + Math.round(Math.random() * 1e9));
  for (var i = 0; i < keypairs.length; i++) {
    genesis.accounts[keypairs[i].address] = {
      balance: "100000000000000000000"
    };
  }
  return genesis;
}

function provide(workdir) {
  const keysSource = path.join(__dirname, "keys");
  const keypairs = getAllKeypairs(keysSource, "password");
  const genesis = generateGenesis(keypairs);
  const keysDest = path.join(workdir, "keys", genesis.name);

  try {
    fs.mkdirSync(workdir, { recursive: true });
    fs.mkdirSync(keysDest, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  console.log("Init new configuration in", workdir);

  fs.writeFileSync(
    path.join(workdir, "genesis.json"),
    JSON.stringify(genesis, null, 2)
  );

  fs.writeFileSync(path.join(workdir, "password.txt"), "password");

  fs.readdirSync(keysSource)
    .filter(filename => filename.startsWith("UTC--"))
    .map(filename =>
      fs.copyFileSync(
        path.join(keysSource, filename),
        path.join(keysDest, filename)
      )
    );
}

function run(workdir) {
  if (!fs.existsSync(workdir)) {
    provide(workdir);
  }

  const genesis = JSON.parse(
    fs.readFileSync(path.join(workdir, "genesis.json"))
  );
  const keysSource = path.join(workdir, "keys", genesis.name);
  const keypairs = getAllKeypairs(keysSource, "password");

  console.log("Run Parity development node using configuration in", workdir);
  console.log("Test accounts");
  console.log("#  Address                                    Private Key");
  for (var i = 0; i < keypairs.length; i++) {
    console.log(`${i}: ${keypairs[i].address} ${keypairs[i].privateKey}`);
  }
  console.log("\n");

  const command = path.join(HOMEDIR, "parity");
  const args = [
    "--base-path",
    workdir,
    "--chain",
    path.join(workdir, "genesis.json"),
    "--jsonrpc-cors",
    "all",
    "--jsonrpc-apis",
    "all",
    "--fast-unlock",
    "--unlock",
    keypairs.map(keypair => keypair.address).join(","),
    "--password",
    path.join(workdir, "password.txt")
  ];
  console.log("running:", command, args.join(" "));
  spawnSync(command, args, { stdio: "inherit" });
}

module.exports = run;
