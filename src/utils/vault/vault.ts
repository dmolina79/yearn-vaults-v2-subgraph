import { Address, ethereum, BigInt, log } from '@graphprotocol/graph-ts';
import {
  AccountVaultPosition,
  AccountVaultPositionUpdate,
  Transaction,
  Vault,
  VaultUpdate,
} from '../../../generated/schema';

import { Vault as VaultContract } from '../../../generated/Registry/Vault';
import { Vault as VaultTemplate } from '../../../generated/templates';
import { BIGINT_ZERO } from '../constants';
import { getOrCreateToken } from '../token';
import * as depositLibrary from '../deposit';
import * as withdrawalLibrary from '../withdrawal';
import * as accountLibrary from '../account/account';
import * as accountVaultPositionLibrary from '../account/vault-position';
import * as vaultUpdateLibrary from './vault-update';
import * as transferLibrary from '../transfer';
import * as tokenLibrary from '../token';

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

  // vaultEntity.tokensDepositLimit = vaultContract.depositLimit()
  // vaultEntity.sharesSupply = vaultContract.totalSupply()
  // vaultEntity.managementFeeBps = vaultContract.managementFee().toI32()
  // vaultEntity.performanceFeeBps = vaultContract.performanceFee().toI32()

  // vault fields
  vaultEntity.activation = vaultContract.activation();
  vaultEntity.apiVersion = vaultContract.apiVersion();

  return vaultEntity;
};

export function getOrCreate(
  vaultAddress: Address,
  transactionHash: string
): Vault {
  log.debug('[Vault] Get or create', []);
  let id = vaultAddress.toHexString();
  let vault = Vault.load(id);

  if (vault == null) {
    vault = createNewVaultFromAddress(vaultAddress, transactionHash);

    VaultTemplate.create(vaultAddress);
  }

  return vault!;
}

export function create(
  transactionHash: string,
  vault: Address,
  classification: string,
  apiVersion: string,
  deploymentId: BigInt,
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
    VaultTemplate.create(vault);
  } else {
    // NOTE: vault is experimental but being endorsed
    if (vaultEntity.classification !== classification) {
      vaultEntity.classification = classification;
    }
  }
  // vaultEntity.blockNumber = event.block.number
  // vaultEntity.timestamp = getTimestampInMillis(event)
  vaultEntity.save();
  return vaultEntity!;
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
  let vault = getOrCreate(to, transaction.id);

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

export function withdraw(
  from: Address,
  to: Address,
  withdrawnAmount: BigInt,
  sharesBurnt: BigInt,
  pricePerShare: BigInt,
  transaction: Transaction
): void {
  let account = accountLibrary.getOrCreate(from);
  let vault = getOrCreate(to, transaction.hash.toHexString());

  withdrawalLibrary.getOrCreate(
    account,
    vault,
    transaction,
    withdrawnAmount,
    sharesBurnt
  );

  // Updating Account Vault Position Update
  let accountVaultPositionId = accountVaultPositionLibrary.buildId(
    account,
    vault
  );
  let accountVaultPosition = AccountVaultPosition.load(accountVaultPositionId);
  // This scenario where accountVaultPosition === null shouldn't happen. Acount vault position should have been created when the account deposited the tokens.
  if (accountVaultPosition !== null) {
    let latestAccountVaultPositionUpdate = AccountVaultPositionUpdate.load(
      accountVaultPosition.latestUpdate
    );
    // The scenario where latestAccountVaultPositionUpdate === null shouldn't happen. One account vault position update should have created when user deposited the tokens.
    if (latestAccountVaultPositionUpdate !== null) {
      accountVaultPositionLibrary.withdraw(
        accountVaultPosition as AccountVaultPosition,
        latestAccountVaultPositionUpdate as AccountVaultPositionUpdate,
        withdrawnAmount,
        sharesBurnt,
        transaction
      );
    }
  }

  // Updating Vault Update
  let latestVaultUpdate = VaultUpdate.load(vault.latestUpdate);
  // This scenario where latestVaultUpdate === null shouldn't happen. One vault update should have created when user deposited the tokens.
  if (latestVaultUpdate !== null) {
    vaultUpdateLibrary.withdraw(
      vault,
      latestVaultUpdate as VaultUpdate,
      pricePerShare,
      withdrawnAmount,
      sharesBurnt,
      transaction
    );
  }
}

export function transfer(
  from: Address,
  to: Address,
  amount: BigInt,
  tokenAddress: Address,
  shareAmount: BigInt,
  vaultAddress: Address,
  transaction: Transaction
): void {
  let token = tokenLibrary.getOrCreateToken(tokenAddress);
  let shareToken = tokenLibrary.getOrCreateToken(vaultAddress);
  let fromAccount = accountLibrary.getOrCreate(from);
  let toAccount = accountLibrary.getOrCreate(to);
  let vault = getOrCreate(vaultAddress, transaction.hash.toHexString());
  transferLibrary.getOrCreate(
    fromAccount,
    toAccount,
    vault,
    token,
    amount,
    shareToken,
    shareAmount,
    transaction
  );

  accountVaultPositionLibrary.transfer(
    fromAccount,
    toAccount,
    vault,
    amount,
    shareAmount,
    transaction
  );
}

export function strategyReported(
  transaction: Transaction,
  vaultAddress: Address,
  pricePerShare: BigInt
): void {
  let vault = getOrCreate(vaultAddress, transaction.hash.toHexString());
  let latestVaultUpdate = VaultUpdate.load(vault.latestUpdate);
  // The latest vault update should exist
  if (latestVaultUpdate !== null) {
    vaultUpdateLibrary.strategyReported(
      vault,
      latestVaultUpdate as VaultUpdate,
      transaction,
      pricePerShare
    );
  }
}
