# Yearn Vaults V2 Subgraph

This is the official subgraph for the Vault V2 - Yearn Protocol.

The subgraph is being updated and fixed constantly.

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

> The subgraph is only deployed on the mainnet network.

## Subgraphs

The official subgraph link is [this](https://thegraph.com/explorer/subgraph?id=0xf50b705e4eaba269dfe954f10c65bd34e6351e0c-0&version=0xf50b705e4eaba269dfe954f10c65bd34e6351e0c-0-0&view=Overview).

---
