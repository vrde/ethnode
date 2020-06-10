const fs = require("fs");
const path = require("path");
const ethers = require("ethers");

async function getKeypair(json, password) {
  const wallet = await ethers.Wallet.fromEncryptedJson(json, password);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

async function getKeypairs(keysDir, password) {
  const result = [];
  for (let filename of fs.readdirSync(keysDir)) {
    if (filename.startsWith("UTC--")) {
      const content = fs.readFileSync(path.join(keysDir, filename), "utf8");
      result.push(await getKeypair(content, password));
    }
  }
  return result;
}

module.exports = {
  getKeypair: getKeypair,
  getKeypairs: getKeypairs,
};
