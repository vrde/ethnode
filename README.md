# `ethnode`, run an Ethereum node for test and development
`ethnode` is a **zero configuration** tool to run a local Ethereum node. It supports both [Openethereum][openethereum] and [Geth][geth].

Try it out:
```
npm install -g ethnode
ethnode
```

`ethnode` automatically:
- downloads the latest stable version of `geth` or `openethereum`
- configures `geth` or `openethereum` to run in a single node network using the *clique* (Geth) or *InstantSeal* (Openethereum) consensus engine (transactions are processed **instantly**)
- provides 10 unlocked accounts with 100ETH each
- enables all RPC endpoints (personal, db, eth, net, web3, debug and more)
- allows CORS from any domain (so you can use it with [remix][remix])

By default `ethnode` runs `geth`. If you want to run `openethereum` type `ethnode openethereum`.

# Examples

## Start ethnode and store the data in a specific directory
Every time you run `ethnode`, it creates a new temporary directory to store the data. If you want to persist the data in a specific directory use:
```
ethnode --workdir=mydata
```

## Start ethnode and allocate 100ETH to one or more target addresses
Sometimes you want to allocate Ether to some specific addresses (maybe some other accounts you have on MetaMask). This is an alternative approach to import a private key to your MetaMask extension.
```
ethnode --allocate=0xad7b5e515e557b2dc4d0625d206394b502412003,0xecdd5b467e38731bfad4bd75faa45c7d58e41b49
```

## Start ethnode to run some tests and then exit
This is quite handy if you want to have a precommit hook that runs tests before committing, or if you want to integrate with a continuous integration system like travis.

```
ethnode --execute="truffle test"
```

## Start

## FAQ
### Why not just running `openethereum --config dev`?
Openethereum has a nice feature to run it as a [private development chain][openethereum:devchain] (aka *test RPC*).

While testing it, I run into some problems, like:
- address management
- outdated genesis file
- the default configuration (`--config dev`) doesn't:
  - open up CORS
  - unlock the test keys

### Why not just running `geth --dev`?
More or less for the same reasons mentioned above.

### Why not `ganache-cli`?
Ganache sometimes is not enough.


[openethereum]: https://github.com/openethereum/openethereum
[geth]: https://github.com/ethereum/go-ethereum
[openethereum:devchain]: https://openethereum.github.io/wiki/Private-development-chain
[remix]: http://remix.ethereum.org/
[geth-testnet]: https://hackernoon.com/setup-your-own-private-proof-of-authority-ethereum-network-with-geth-9a0a3750cda8
[hudson:gas]: https://hudsonjameson.com/2017-06-27-accounts-transactions-gas-ethereum/
