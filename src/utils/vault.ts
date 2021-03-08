import { Address, ethereum, BigInt, log } from '@graphprotocol/graph-ts';
import { Vault } from '../../generated/schema';

import { createEthTransaction, getTimestampInMillis } from './commons';
import { Vault as VaultContract } from '../../generated/Registry/Vault';
import { Vault as VaultTemplate } from '../../generated/templates';
import { BIGINT_ZERO } from '../utils/constants';
import { getOrCreateToken } from '../utils/token';
import { createStrategy } from './strategy';

const createNewVaultFromAddress = (vaultAddress: Address): Vault => {
  let id = vaultAddress.toHexString();
  let vaultEntity = new Vault(id);
  let vaultContract = VaultContract.bind(vaultAddress);

  let token = getOrCreateToken(vaultContract.token());
  let shareToken = getOrCreateToken(vaultAddress);

  // TODO Create transaction vaultEntity.transaction = transactionId
  vaultEntity.transaction = '0';
  vaultEntity.token = token.id;
  vaultEntity.shareToken = shareToken.id;

  // vault fields
  vaultEntity.activation = vaultContract.activation();
  vaultEntity.apiVersion = vaultContract.apiVersion();

  // NOTE: derived
  // vaultEntity.strategies = [];

  // empty at creation
  vaultEntity.tags = [];
  vaultEntity.balanceTokens = BIGINT_ZERO;
  vaultEntity.balanceTokensIdle = BIGINT_ZERO;
  vaultEntity.balanceTokensInvested = BIGINT_ZERO;

  vaultEntity.tokensDepositLimit = BIGINT_ZERO;
  vaultEntity.sharesSupply = BIGINT_ZERO;
  vaultEntity.managementFeeBps = 0;
  vaultEntity.performanceFeeBps = 0;

  // vaultEntity.tokensDepositLimit = vaultContract.depositLimit();
  // vaultEntity.sharesSupply = vaultContract.totalSupply();
  // vaultEntity.managementFeeBps = vaultContract.managementFee().toI32();
  // vaultEntity.performanceFeeBps = vaultContract.performanceFee().toI32();

  return vaultEntity;
};

export function getOrCreateVault(
  vaultAddress: Address,
  createTemplate: boolean
): Vault {
  let id = vaultAddress.toHexString();
  let vault = Vault.load(id);

  if (vault == null) {
    vault = createNewVaultFromAddress(vaultAddress);

    if (createTemplate) {
      VaultTemplate.create(vaultAddress);
    }
  }

  return vault as Vault;
}

export function createVault(
  transactionId: string,
  vault: Address,
  classification: string,
  apiVersion: string,
  deploymentId: BigInt,
  createTemplate: boolean,
  event: ethereum.Event
): Vault {
  let id = vault.toHexString();
  let vaultEntity = Vault.load(id);
  if (vaultEntity == null) {
    vaultEntity = createNewVaultFromAddress(vault);
    vaultEntity.transaction = transactionId;
    vaultEntity.classification = classification;
    // vaultEntity.deploymentId = deploymentId
    vaultEntity.apiVersion = apiVersion;
    if (createTemplate) {
      VaultTemplate.create(vault);
    }
  } else {
    // NOTE: vault is experimental but being endorsed
    if (vaultEntity.classification !== classification) {
      vaultEntity.classification = classification;
    }
  }

  // vaultEntity.blockNumber = event.block.number
  // vaultEntity.timestamp = getTimestampInMillis(event)
  vaultEntity.save();
  return vaultEntity as Vault;
}

// TODO: implement this
export function releaseVault(
  vault: Address,
  apiVersion: string,
  releaseId: BigInt,
  event: ethereum.Event
): Vault | null {
  let id = vault.toHexString();
  let entity = Vault.load(id);
  if (entity !== null) {
    // TODO: implement this
    // entity.status = 'Released'
    // entity.apiVersion = apiVersion
    // entity.deploymentId = deploymentId
    // entity.blockNumber = event.block.number
    // entity.timestamp = getTimestampInMillis(event)
    // entity.save()
  }
  return entity;
}

export function tagVault(vault: Address, tag: string): Vault {
  let id = vault.toHexString();
  log.info('Processing tag for vault address: {}', [id]);
  let entity = Vault.load(id);
  if (entity == null) {
    log.warning('Vault not found. Vault address: {}', [id]);
  } else {
    entity.tags = tag.split(',');
    entity.save();
  }
  return entity as Vault;
}
