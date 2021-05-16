const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const findCacheDir = require("find-cache-dir");
const { getKeypairs } = require("./crypto");

const KEYS_SOURCE = path.join(__dirname, "keys");
const HOMEDIR = findCacheDir({
  name: "ethnode",
  cwd: __dirname,
  create: true,
});
const LOGLEVELS = [, "warn", "info", "debug"];

function canWrite(path) {
  let fd;
  try {
    fd = fs.openSync(path, "wx");
  } catch (e) {
    if (e.code === "EACCES") {
      return false;
    } else {
      throw e;
    }
  }
  fs.closeSync(fd);
  fs.unlinkSync(path);
  return true;
}

function getPaths(client, workdir) {
  const base = path.join(workdir, client);
  return {
    binary: path.join(HOMEDIR, client),
    base: base,
    genesis: path.join(base, "genesis.json"),
    data: path.join(base, "data"),
    keys: path.join(base, "keys"),
    password: path.join(__dirname, "keys", "password.secret"),
  };
}

function generateGenesis(client, chainId, balances) {
  const genesis = JSON.parse(
    JSON.stringify(require(`./genesis.${client}.json`))
  );
  if (client === "geth") {
    genesis.config.chainId = chainId;
    genesis.extraData =
      "0x" +
      "0".repeat(64) +
      Object.keys(balances)[0].substr(2) +
      "0".repeat(130);
    genesis.alloc = { ...genesis.alloc, ...balances };
  } else if (client === "openethereum") {
    genesis.params.networkID = chainId;
    genesis.accounts = { ...genesis.accounts, ...balances };
  }
  return genesis;
}

function generateBalances(addresses, balance) {
  balance = balance || "100000000000000000000";
  const balances = {};
  for (var i = 0; i < addresses.length; i++) {
    balances[addresses[i]] = {
      balance: balance,
    };
  }
  return balances;
}

function downloadClient(client, workdir, download) {
  const paths = getPaths(client, workdir);
  if (!canWrite(path.join(HOMEDIR, "__remove_me__"))) {
    console.log(
      `Cannot write in ${HOMEDIR}, try run "sudo ethnode -d" to ` +
        `download ${client}. Remember you can run ethnode without "sudo" ` +
        `after this operation.`
    );
    process.exit(1);
  }

  if (!fs.existsSync(paths.binary)) {
    console.log(`Download latest ${client} version, please wait.`);
    const childResult = spawnSync(path.join(__dirname, `get_${client}.sh`), {
      env: { HOMEDIR },
      stdio: "inherit",
    });
    if (childResult.status !== 0) {
      console.log(
        `Error downloading ${client}, this might be temporary, ` +
          `try again later.`
      );
      process.exit(childResult.status);
    }
  } else if (download) {
    console.error(
      `You have downloaded ${client} already, if you want to force the download remove ${paths.binary}`
    );
    process.exit(1);
  }
}

async function provide(
  client,
  workdir,
  allocate,
  chainId,
  execute,
  loggingOptions
) {
  const paths = getPaths(client, workdir);
  const keypairs = await getKeypairs(KEYS_SOURCE, "password");
  const balances = generateBalances(
    keypairs.map((x) => x.address).concat(allocate)
  );
  const genesis = generateGenesis(client, chainId, balances);
  let keysDest =
    client === "geth" ? paths.keys : path.join(paths.keys, genesis.name);

  try {
    fs.mkdirSync(paths.base, { recursive: true });
    fs.mkdirSync(keysDest, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }

  fs.writeFileSync(paths.genesis, JSON.stringify(genesis, null, 2));

  fs.readdirSync(KEYS_SOURCE)
    .filter((filename) => filename.startsWith("UTC--"))
    .map((filename) =>
      fs.copyFileSync(
        path.join(KEYS_SOURCE, filename),
        path.join(keysDest, filename)
      )
    );

  if (client === "geth") {
    const childResult = spawnSync(
      paths.binary,
      [...loggingOptions, "--datadir", paths.data, "init", paths.genesis],
      {
        stdio: execute ? ["ignore", "ignore", "ignore"] : "inherit",
      }
    );
    if (childResult.status !== 0) {
      console.log(
        `Error running ${paths.binary}, run it manually to check if it ` +
          `works or not. If it doesn't, remove it and run ethnode again.`
      );
      process.exit(childResult.status);
    }
  }
}

async function run(
  client,
  { download, workdir, logging, allocate, chainId, execute, nodeArguments }
) {
  const loggingOptions = logging
    ? client === "geth"
      ? ["--verbosity", LOGLEVELS.indexOf(logging)]
      : ["--logging", logging]
    : [];
  const paths = getPaths(client, workdir);
  downloadClient(client, workdir, download);
  if (download) {
    return;
  }
  if (!fs.existsSync(paths.genesis)) {
    await provide(client, workdir, allocate, chainId, execute, loggingOptions);
  }

  const genesis = JSON.parse(fs.readFileSync(paths.genesis));
  const keypairs = await getKeypairs(
    client === "geth" ? paths.keys : path.join(paths.keys, genesis.name),
    "password"
  );

  if (!execute) {
    console.log("Run development node using configuration in", workdir);
    console.log("Test accounts");
    console.log("#  Address                                    Private Key");
    for (let i = 0; i < keypairs.length; i++) {
      console.log(`${i}: ${keypairs[i].address} ${keypairs[i].privateKey}`);
    }
    if (allocate.length > 0) {
      console.log();
      console.log("Extra account allocations");
      console.log("Address                                    Private Key");
      for (let i = 0; i < allocate.length; i++) {
        console.log(`${allocate[i]} <no private key available>`);
      }
    }
    console.log();
  }

  let args;
  if (client === "geth") {
    args = [
      "--datadir",
      paths.data,
      "--port",
      "30311",
      "--http",
      "--http.addr",
      "localhost",
      "--http.port",
      "8545",
      "--http.api",
      "personal,eth,net,web3,txpool,miner,debug",
      "--http.corsdomain",
      "*",
      "--ws",
      "--ws.addr",
      "localhost",
      "--ws.port",
      "8546",
      "--ws.api",
      "personal,eth,net,web3,txpool,miner,debug",
      "--ws.origins",
      "*",
      "--mine",
      "--miner.gastarget",
      "94000000",
      "--miner.gasprice",
      "1000000000",
      "--allow-insecure-unlock",
      "--keystore",
      paths.keys,
      "--unlock",
      keypairs.map((keypair) => keypair.address).join(","),
      "--password",
      paths.password,
      "--networkid",
      genesis.config.chainId,
      ...loggingOptions,
    ];
  } else if (client === "openethereum") {
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
      "--ws-apis",
      "all",
      "--ws-origins",
      "all",
      "--fast-unlock",
      "--unlock",
      keypairs.map((keypair) => keypair.address).join(","),
      "--password",
      paths.password,
      "--network-id",
      parseInt(genesis.params.networkID, 16),
      ...loggingOptions,
    ];
  } else {
    throw `Client "${client}" is not supported`;
  }

  if (nodeArguments) args.push(nodeArguments);

  if (logging === "debug") {
    console.log("running:", paths.binary, args.join(" "));
  }

  const clientProcess = spawn(paths.binary, args, {
    stdio: execute ? ["ignore", "ignore", "ignore"] : "inherit",
  });

  let executeProcess;

  clientProcess.on("close", (code) => {
    if (code !== 0) {
      console.log("Error executing ethnode. Exit code:", code);
    }
    if (executeProcess) {
      executeProcess.kill();
    }
    process.exit(code);
  });

  if (execute) {
    executeProcess = spawn(execute, { stdio: "inherit", shell: true });
    executeProcess.on("close", (code) => {
      clientProcess.kill();
      process.exit(code);
    });
  }
}

module.exports = run;
