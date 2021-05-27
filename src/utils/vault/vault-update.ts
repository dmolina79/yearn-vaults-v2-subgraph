import { BigInt, log } from '@graphprotocol/graph-ts';
import { Transaction, Vault, VaultUpdate } from '../../../generated/schema';
import { BIGINT_ZERO } from '../constants';

export function buildIdFromVaultTxHashAndIndex(
  vault: string,
  transactionHash: string,
  transactionIndex: string
): string {
  return vault
    .concat('-')
    .concat(transactionHash.concat('-').concat(transactionIndex));
}

export function buildIdFromVaultAndTransaction(
  vault: Vault,
  transaction: Transaction
): string {
  return buildIdFromVaultTxHashAndIndex(
    vault.id,
    transaction.id,
    transaction.index.toString()
  );
}

function createVaultUpdate(
  id: string,
  vault: Vault,
  transaction: Transaction,
  tokensDeposited: BigInt,
  tokensWithdrawn: BigInt,
  sharesMinted: BigInt,
  sharesBurnt: BigInt,
  pricePerShare: BigInt,
  totalFees: BigInt,
  managementFees: BigInt,
  performanceFees: BigInt,
  balancePosition: BigInt
): VaultUpdate {
  log.debug('[VaultUpdate] Creating vault update with id {}', [vault.id]);
  let vaultUpdate = new VaultUpdate(id);
  vaultUpdate.timestamp = transaction.timestamp;
  vaultUpdate.blockNumber = transaction.blockNumber;
  vaultUpdate.transaction = transaction.id;
  vaultUpdate.vault = vault.id;
  // Balances & Shares
  vaultUpdate.tokensDeposited = tokensDeposited;
  vaultUpdate.tokensWithdrawn = tokensWithdrawn;
  vaultUpdate.sharesMinted = sharesMinted;
  vaultUpdate.sharesBurnt = sharesBurnt;
  // Performance
  vaultUpdate.pricePerShare = pricePerShare;
  vaultUpdate.totalFees = totalFees;
  vaultUpdate.managementFees = managementFees;
  vaultUpdate.performanceFees = performanceFees;
  vaultUpdate.balancePosition = balancePosition;

  if (vault.balanceTokens.gt(balancePosition)) {
    vaultUpdate.returnsGenerated = balancePosition;
  } else {
    vaultUpdate.returnsGenerated = balancePosition.minus(vault.balanceTokens);
  }

  vaultUpdate.save();
  return vaultUpdate;
}

export function firstDeposit(
  vault: Vault,
  transaction: Transaction,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  pricePerShare: BigInt,
  balancePosition: BigInt
): VaultUpdate {
  log.debug('[VaultUpdate] First deposit', []);
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let vaultUpdate = VaultUpdate.load(vaultUpdateId);

  if (vaultUpdate === null) {
    vaultUpdate = createVaultUpdate(
      vaultUpdateId,
      vault,
      transaction,
      depositedAmount,
      BIGINT_ZERO,
      sharesMinted,
      BIGINT_ZERO,
      pricePerShare,
      BIGINT_ZERO,
      BIGINT_ZERO,
      BIGINT_ZERO,
      balancePosition
    );
  }

  return vaultUpdate!;
}

export function deposit(
  vault: Vault,
  transaction: Transaction,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  pricePerShare: BigInt,
  balancePosition: BigInt
): VaultUpdate {
  log.debug('[VaultUpdate] Deposit', []);
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let vaultUpdate = VaultUpdate.load(vaultUpdateId);
  let latestVaultUpdate = VaultUpdate.load(vault.latestUpdate);

  if (vaultUpdate === null) {
    vaultUpdate = createVaultUpdate(
      vaultUpdateId,
      vault,
      transaction,
      depositedAmount,
      BIGINT_ZERO, // TokensWithdrawn
      sharesMinted,
      BIGINT_ZERO, // SharesBurnt,
      pricePerShare,
      latestVaultUpdate.totalFees,
      latestVaultUpdate.managementFees,
      latestVaultUpdate.performanceFees,
      balancePosition
    );
  }

  return vaultUpdate!;
}

export function withdraw(
  vault: Vault,
  latestVaultUpdate: VaultUpdate,
  pricePerShare: BigInt,
  withdrawnAmount: BigInt,
  sharesBurnt: BigInt,
  transaction: Transaction,
  balancePosition: BigInt
): VaultUpdate {
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let newVaultUpdate = createVaultUpdate(
    vaultUpdateId,
    vault,
    transaction,
    BIGINT_ZERO, // TokensDeposited
    withdrawnAmount,
    BIGINT_ZERO, // SharesMinted
    sharesBurnt,
    pricePerShare,
    latestVaultUpdate.totalFees,
    latestVaultUpdate.managementFees,
    latestVaultUpdate.performanceFees,
    balancePosition
  );
  vault.sharesSupply = vault.sharesSupply.minus(sharesBurnt);
  vault.balanceTokens = vault.balanceTokens.minus(withdrawnAmount);
  vault.balanceTokensIdle = vault.balanceTokensIdle.minus(withdrawnAmount);

  vault.latestUpdate = newVaultUpdate.id;
  vault.save();
  return newVaultUpdate;
}

export function strategyReported(
  vault: Vault,
  latestVaultUpdate: VaultUpdate,
  transaction: Transaction,
  pricePerShare: BigInt,
  balancePosition: BigInt
): VaultUpdate {
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let newVaultUpdate = createVaultUpdate(
    vaultUpdateId,
    vault,
    transaction,
    BIGINT_ZERO, // TokensDeposited
    BIGINT_ZERO, // TokensWithdrawn
    BIGINT_ZERO, // SharesMinted
    BIGINT_ZERO, // SharesBurnt
    pricePerShare,
    latestVaultUpdate.totalFees,
    latestVaultUpdate.managementFees,
    latestVaultUpdate.performanceFees,
    balancePosition
  );
  vault.latestUpdate = newVaultUpdate.id;
  vault.save();
  return newVaultUpdate;
}

export function performanceFeeUpdated(
  vault: Vault,
  transaction: Transaction,
  latestVaultUpdate: VaultUpdate,
  balancePosition: BigInt,
  performanceFee: BigInt
): VaultUpdate {
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let newVaultUpdate = createVaultUpdate(
    vaultUpdateId,
    vault,
    transaction,
    BIGINT_ZERO, // TokensDeposited
    BIGINT_ZERO, // TokensWithdrawn
    BIGINT_ZERO, // SharesMinted
    BIGINT_ZERO, // SharesBurnt
    latestVaultUpdate.pricePerShare,
    latestVaultUpdate.totalFees,
    BIGINT_ZERO,
    performanceFee,
    balancePosition
  );
  return newVaultUpdate;
}

export function managementFeeUpdated(
  vault: Vault,
  transaction: Transaction,
  latestVaultUpdate: VaultUpdate,
  balancePosition: BigInt,
  managementFee: BigInt
): VaultUpdate {
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let newVaultUpdate = createVaultUpdate(
    vaultUpdateId,
    vault,
    transaction,
    BIGINT_ZERO, // TokensDeposited
    BIGINT_ZERO, // TokensWithdrawn
    BIGINT_ZERO, // SharesMinted
    BIGINT_ZERO, // SharesBurnt
    latestVaultUpdate.pricePerShare,
    latestVaultUpdate.totalFees,
    managementFee,
    BIGINT_ZERO,
    balancePosition
  );
  return newVaultUpdate;
}
