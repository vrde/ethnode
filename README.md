Warning: this tool is experimental. It should work for GNU/Linux and hopefully on Mac OS.

# `ethnode`, run an Ethereum node for test and development
`ethnode` is a **zero configuration** tool to run a local Ethereum node. It supports both [Parity][parity] and [Geth][geth].

Try it out:
```
npm install -g ethnode
ethnode
```

`ethnode` automatically:
- downloads the latest stable version of `geth` or `parity`
- configures `geth` or `parity` to run in a single node network using the `clique` (Geth) or InstantSeal (Parity) consensus engine (transactions are processed **instantly**)
- provides 10 unlocked accounts with 100ETH each
- enables all RPC endpoints (personal, db, eth, net, web3, debug and more)
- allows CORS from any domain (so you can use it with [remix][remix])

By default `ethnode` runs `geth`. If you want to run `parity` type `ethnode parity`.

## FAQ
### Why not just running `parity --config dev`?
Parity has a nice feature to run it as a [private development chain][parity:devchain] (aka *test RPC*).

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


[parity]: https://github.com/paritytech/parity-ethereum
[geth]: https://github.com/ethereum/go-ethereum
[parity:devchain]: https://wiki.parity.io/Private-development-chain
[remix]: http://remix.ethereum.org/
[geth-testnet]: https://hackernoon.com/setup-your-own-private-proof-of-authority-ethereum-network-with-geth-9a0a3750cda8
