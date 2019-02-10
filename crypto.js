const fs = require("fs");
const path = require("path");

const secp256k1 = require("secp256k1");
const keythereum = require("keythereum");
const { sha3, bytesToHex } = require("web3-utils");

function getKeypair(keyObject, password) {
  const privateKey = keythereum.recover(password, keyObject);
  const publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1, 65);
  return {
    address: "0x" + sha3(bytesToHex(publicKey)).slice(-40),
    privateKey: bytesToHex(privateKey)
  };
}

function getKeypairs(keysDir, password) {
  return fs
    .readdirSync(keysDir)
    .filter(filename => filename.startsWith("UTC--"))
    .map(filename => JSON.parse(fs.readFileSync(path.join(keysDir, filename))))
    .map(keyObject => getKeypair(keyObject, password));
}

module.exports = {
  getKeypair: getKeypair,
  getKeypairs: getKeypairs
};
