# Run a Parity node for development
Parity has a nice feature to run it as a [private development chain][parity:devchain] (aka *test RPC*).

While testing it, I run into some problems, like:
- address management
- outdated genesis file
- the default configuration (`--config dev`) doesn't:
  - open up CORS
  - unlock the test keys

So here is my code to run Parity as a test RPC. It is designed to be as easy as:

```
npm install -g parity-dev
parity-dev
```


[parity:devchain]: https://wiki.parity.io/Private-development-chain
