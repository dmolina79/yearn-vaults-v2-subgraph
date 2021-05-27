import { Address, ethereum, BigInt, log } from '@graphprotocol/graph-ts';
import {
  AccountVaultPosition,
  AccountVaultPositionUpdate,
  Registry,
  Strategy,
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
import { updateVaultDayData } from './vaultDayData';

const buildId = (vaultAddress: Address): string => {
  return vaultAddress.toHexString();
};

const createNewVaultFromAddress = (
  vaultAddress: Address,
  transaction: Transaction
): Vault => {
  let id = vaultAddress.toHexString();
  let vaultEntity = new Vault(id);
  let vaultContract = VaultContract.bind(vaultAddress);

  let token = getOrCreateToken(vaultContract.token());
  let shareToken = getOrCreateToken(vaultAddress);

  vaultEntity.transaction = transaction.id;
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
  vaultEntity.managementFeeBps = vaultContract.managementFee().toI32();
  vaultEntity.performanceFeeBps = vaultContract.performanceFee().toI32();

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
  transaction: Transaction
): Vault {
  log.debug('[Vault] Get or create', []);
  let id = vaultAddress.toHexString();
  let vault = Vault.load(id);

  if (vault == null) {
    vault = createNewVaultFromAddress(vaultAddress, transaction);

    VaultTemplate.create(vaultAddress);
  }

  return vault!;
}

export function create(
  registry: Registry,
  transaction: Transaction,
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
    vaultEntity = createNewVaultFromAddress(vault, transaction);
    vaultEntity.classification = classification;
    vaultEntity.registry = registry.id;
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
  vaultAddress: Address,
  transaction: Transaction,
  receiver: Address,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  timestamp: BigInt
): void {
  log.debug('[Vault] Deposit', []);
  let vaultContract = VaultContract.bind(vaultAddress);
  let account = accountLibrary.getOrCreate(receiver);

  let totalAssets = vaultContract.totalAssets();
  let decimals = u8(vaultContract.decimals().toI32());
  let pricePerShare = vaultContract.pricePerShare();
  let balancePosition = totalAssets
    .times(pricePerShare)
    .div(BigInt.fromI32(10).pow(decimals));
  let vault = getOrCreate(vaultAddress, transaction);

  accountVaultPositionLibrary.deposit(
    vaultContract,
    account,
    vault,
    transaction,
    depositedAmount,
    sharesMinted
  );

  depositLibrary.getOrCreate(
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
      pricePerShare,
      balancePosition
    );
  } else {
    vaultUpdate = vaultUpdateLibrary.deposit(
      vault,
      transaction,
      depositedAmount,
      sharesMinted,
      pricePerShare,
      balancePosition
    );
  }

  updateVaultDayData(
    vault,
    timestamp,
    pricePerShare,
    depositedAmount,
    BIGINT_ZERO,
    vaultUpdate.returnsGenerated
  );

  vault.latestUpdate = vaultUpdate.id;
  vault.balanceTokens = vault.balanceTokens.plus(depositedAmount);
  vault.balanceTokensIdle = vault.balanceTokensIdle.plus(depositedAmount);
  vault.sharesSupply = vault.sharesSupply.plus(sharesMinted);

  vault.save();
}

export function isVault(vaultAddress: Address): boolean {
  let id = buildId(vaultAddress);
  let vault = Vault.load(id);
  return vault !== null;
}

export function withdraw(
  vaultAddress: Address,
  from: Address,
  withdrawnAmount: BigInt,
  sharesBurnt: BigInt,
  transaction: Transaction,
  timestamp: BigInt
): void {
  let vaultContract = VaultContract.bind(vaultAddress);
  let pricePerShare = vaultContract.pricePerShare();
  let account = accountLibrary.getOrCreate(from);

  let totalAssets = vaultContract.totalAssets();
  let decimals = u8(vaultContract.decimals().toI32());
  let balancePosition = totalAssets
    .times(pricePerShare)
    .div(BigInt.fromI32(10).pow(decimals));
  let vault = getOrCreate(vaultAddress, transaction);

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
  // This scenario where accountVaultPosition === null shouldn't happen. Account vault position should have been created when the account deposited the tokens.
  if (accountVaultPosition !== null) {
    let latestAccountVaultPositionUpdate = AccountVaultPositionUpdate.load(
      accountVaultPosition.latestUpdate
    );
    // The scenario where latestAccountVaultPositionUpdate === null shouldn't happen. One account vault position update should have created when user deposited the tokens.
    if (latestAccountVaultPositionUpdate !== null) {
      accountVaultPositionLibrary.withdraw(
        vaultContract,
        accountVaultPosition as AccountVaultPosition,
        withdrawnAmount,
        sharesBurnt,
        transaction
      );
    } else {
      log.warning(
        'INVALID withdraw: Account vault position update NOT found. ID {} Vault {} TX {} from {}',
        [
          accountVaultPosition.latestUpdate,
          vaultAddress.toHexString(),
          transaction.hash.toHexString(),
          from.toHexString(),
        ]
      );
    }
  } else {
    /*
      This case should not exist because it means an user already has share tokens without having deposited before.
      BUT due to some vaults were deployed, and registered in the registry after several blocks, there are cases were some users deposited tokens before the vault were registered (in the registry).
      Example:
        Account:  0x557cde75c38b2962be3ca94dced614da774c95b0
        Vault:    0xbfa4d8aa6d8a379abfe7793399d3ddacc5bbecbb

        Vault registered at tx (block 11579536): https://etherscan.io/tx/0x6b51f1f743ec7a42db6ba1995e4ade2ba0e5b8f1fec03d3dd599a90da66d6f69

        Account transfers:
        https://etherscan.io/token/0xbfa4d8aa6d8a379abfe7793399d3ddacc5bbecbb?a=0x557cde75c38b2962be3ca94dced614da774c95b0
    
        The first two deposits were at blocks 11557079 and 11553285. In both cases, some blocks after registering the vault.

        As TheGraph doesn't support to process blocks before the vault was registered (using the template feature), these cases are treated as special cases (pending to fix).
    */
    if (withdrawnAmount.isZero()) {
      log.warning(
        'INVALID zero amount withdraw: Account vault position NOT found. ID {} Vault {} TX {} from {}',
        [
          accountVaultPositionId,
          vaultAddress.toHexString(),
          transaction.hash.toHexString(),
          from.toHexString(),
        ]
      );
      accountVaultPositionLibrary.withdrawZero(account, vault, transaction);
    } else {
      log.warning(
        'INVALID withdraw: Account vault position NOT found. ID {} Vault {} TX {} from {}',
        [
          accountVaultPositionId,
          vaultAddress.toHexString(),
          transaction.hash.toHexString(),
          from.toHexString(),
        ]
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
      transaction,
      balancePosition
    );

    updateVaultDayData(
      vault,
      timestamp,
      pricePerShare,
      BIGINT_ZERO,
      withdrawnAmount,
      latestVaultUpdate.returnsGenerated
    );
  }
}

export function transfer(
  vaultContract: VaultContract,
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
  let vault = getOrCreate(vaultAddress, transaction);
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
    vaultContract,
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
  vaultContract: VaultContract,
  vaultAddress: Address,
  pricePerShare: BigInt
): void {
  log.info('[Vault] Strategy reported for vault {} at TX ', [
    vaultAddress.toHexString(),
    transaction.hash.toHexString(),
  ]);
  let vault = getOrCreate(vaultAddress, transaction);
  let latestVaultUpdate = VaultUpdate.load(vault.latestUpdate);
  let totalAssets = vaultContract.totalAssets();
  let decimals = u8(vaultContract.decimals().toI32());
  let balancePosition = totalAssets
    .times(pricePerShare)
    .div(BigInt.fromI32(10).pow(decimals));
  // The latest vault update should exist
  if (latestVaultUpdate !== null) {
    vaultUpdateLibrary.strategyReported(
      vault,
      latestVaultUpdate as VaultUpdate,
      transaction,
      pricePerShare,
      balancePosition
    );
  }
}

export function performanceFeeUpdated(
  vaultAddress: Address,
  performanceFee: BigInt
): void {
  let vault = Vault.load(vaultAddress.toHexString());
  log.info('Vault performance fee updated. Address: {}, To: {}', [
    vaultAddress.toHexString(),
    performanceFee.toString(),
  ]);
  if (vault !== null) {
    vault.performanceFeeBps = performanceFee.toI32();
    vault.save();
  }
}

export function managementFeeUpdated(
  vaultAddress: Address,
  managementFee: BigInt
): void {
  let vault = Vault.load(vaultAddress.toHexString());
  log.info('Vault management fee updated. Address: {}, To: {}', [
    vaultAddress.toHexString(),
    managementFee.toString(),
  ]);
  if (vault !== null) {
    vault.managementFeeBps = managementFee.toI32();
    vault.save();
  }
}

export function strategyAddedToQueue(
  strategyAddress: Address,
  ethTransaction: Transaction,
  event: ethereum.Event
): void {
  let id = strategyAddress.toHexString();
  let txHash = ethTransaction.hash.toHexString();
  log.info('Strategy {} added to queue at tx {}', [id, txHash]);
  let strategy = Strategy.load(id);
  if (strategy !== null) {
    strategy.inQueue = true;
    strategy.save();
  }
}

export function strategyRemovedFromQueue(
  strategyAddress: Address,
  ethTransaction: Transaction,
  event: ethereum.Event
): void {
  let id = strategyAddress.toHexString();
  let txHash = ethTransaction.hash.toHexString();
  let strategy = Strategy.load(id);
  log.info('Strategy {} removed to queue at tx {}', [id, txHash]);
  if (strategy !== null) {
    strategy.inQueue = false;
    strategy.save();
  }
}
