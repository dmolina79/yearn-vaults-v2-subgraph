# Yearn Vaults V2 Subgraph

This is the non-official subgraph for the Vault V2 - Yearn Protocol.

It is based on [this feature branch](https://github.com/iearn-finance/yearn-vaults/tree/feat/registry-redux).

## Get Started

To get started, you need to install the dependencies:

- Using Yarn: `yarn install`
- Using NPM: `npm install`

## Network Configuration

Once the smart contracts are deployed on a testnet or mainnet, the JSON files located at folder `config` must be updated.

The final **subgraph.yaml** file is used to deploy on the network.

### Configuration

Each network has a JSON file in the `./config` folder. When a deploy process is executed (using a script defined in the `package.json`), it creates the final subgraph.yaml, and deploy it to the The Graph node.

### Scripts

At this moment, the scripts available are:

- **yarn deploy:rinkeby**: build the subgraph.yaml file, and deploy it on the Rinkeby testnet.
- **yarn deploy:kovan**: build the subgraph.yaml file, and deploy it on the Kovan testnet.
- **yarn deploy:mainnet**: build the subgraph.yaml file, and deploy it on the mainnet network.

## Subgraphs

TODO Add link to the subgraph.

---
