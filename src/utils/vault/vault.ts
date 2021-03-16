import { Address, ethereum, BigInt, log, Bytes } from '@graphprotocol/graph-ts';
import { Transaction, Vault, VaultUpdate } from '../../../generated/schema';

import { Vault as VaultContract } from '../../../generated/Registry/Vault';
import { Vault as VaultTemplate } from '../../../generated/templates';
import { BIGINT_ZERO } from '../constants';
import { getOrCreateToken } from '../token';
import { createStrategy } from '../strategy';
import * as depositLibrary from '../deposit';
import * as accountLibrary from '../account/account';
import * as accountVaultPositionLibrary from '../account/vault-position';
import * as vaultUpdateLibrary from './vault-update';

const createNewVaultFromAddress = (
  vaultAddress: Address,
  transactionHash: string
): Vault => {
  let id = vaultAddress.toHexString();
  let vaultEntity = new Vault(id);
  let vaultContract = VaultContract.bind(vaultAddress);

  let token = getOrCreateToken(vaultContract.token());
  let shareToken = getOrCreateToken(vaultAddress);

  vaultEntity.transaction = transactionHash;
  vaultEntity.token = token.id;
  vaultEntity.shareToken = shareToken.id;

  // FIX: This is hardcoded, try to get from contract
  vaultEntity.classification = 'Experimental';

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

  // vault fields
  vaultEntity.activation = vaultContract.activation();
  vaultEntity.apiVersion = vaultContract.apiVersion();

  return vaultEntity;
};

export function getOrCreate(
  vaultAddress: Address,
  transactionHash: string,
  createTemplate: boolean
): Vault {
  log.debug('[Vault] Get or create', []);
  let id = vaultAddress.toHexString();
  let vault = Vault.load(id);

  if (vault == null) {
    vault = createNewVaultFromAddress(vaultAddress, transactionHash);

    if (createTemplate) {
      VaultTemplate.create(vaultAddress);
    }
  }

  return vault as Vault;
}

export function create(
  transactionHash: string,
  vault: Address,
  classification: string,
  apiVersion: string,
  deploymentId: BigInt,
  createTemplate: boolean,
  event: ethereum.Event
): Vault {
  log.info('[Vault] Create vault', []);
  let id = vault.toHexString();
  let vaultEntity = Vault.load(id);
  if (vaultEntity == null) {
    vaultEntity = createNewVaultFromAddress(vault, transactionHash);
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
export function release(
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

export function addStrategy(
  transactionId: string,
  vaultAddress: Address,
  strategy: Address,
  debtLimit: BigInt,
  performanceFee: BigInt,
  rateLimit: BigInt,
  event: ethereum.Event
): void {
  let id = vaultAddress.toHexString();
  let vault = Vault.load(id); // get or create ?
  if (vault !== null) {
    createStrategy(
      transactionId,
      strategy,
      vaultAddress,
      debtLimit,
      rateLimit,
      performanceFee,
      event
    );
    vault.save();
  }
}

export function tag(vault: Address, tag: string): Vault {
  let id = vault.toHexString();
  log.info('Processing tag for vault address: {}', [id]);
  let entity = Vault.load(id);
  if (entity == null) {
  } else {
    entity.tags = tag.split(',');
    entity.save();
  }
  return entity as Vault;
}

export function deposit(
  transaction: Transaction,
  receiver: Address,
  to: Address,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  pricePerShare: BigInt
): void {
  log.debug('[Vault] Deposit', []);
  let account = accountLibrary.getOrCreate(receiver);
  let vault = getOrCreate(to, transaction.id, false);

  let vaultPositionResponse = accountVaultPositionLibrary.deposit(
    account,
    vault,
    transaction,
    depositedAmount,
    sharesMinted
  );

  let deposit = depositLibrary.getOrCreate(
    account,
    vault,
    transaction,
    depositedAmount,
    sharesMinted
  );

  let vaultUpdate: VaultUpdate;
  if (vault.latestUpdate == null) {
    vaultUpdate = vaultUpdateLibrary.firstDeposit(
      vault,
      transaction,
      depositedAmount,
      sharesMinted,
      pricePerShare
    );
  } else {
    vaultUpdate = vaultUpdateLibrary.deposit(
      vault,
      transaction,
      depositedAmount,
      sharesMinted,
      pricePerShare
    );
  }

  vault.latestUpdate = vaultUpdate.id;
  vault.balanceTokens = vault.balanceTokens.plus(depositedAmount);
  vault.balanceTokensIdle = vault.balanceTokensIdle.plus(depositedAmount);
  vault.sharesSupply = vault.sharesSupply.plus(sharesMinted);

  vault.save();
}
