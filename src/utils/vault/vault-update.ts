import { BigInt, Bytes, log } from "@graphprotocol/graph-ts"
import { Transaction, Vault, VaultUpdate } from "../../../generated/schema"
import { BIGINT_ZERO } from "../constants";


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
  )
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
  returnsGenerated: BigInt,
  totalFees: BigInt,
  managementFees: BigInt,
  performanceFees: BigInt
): VaultUpdate {
  log.debug('[VaultUpdate] Creating vault update with id {}', [vault.id])
  let vaultUpdate = new VaultUpdate(id)
  vaultUpdate.timestamp = transaction.timestamp
  vaultUpdate.blockNumber = transaction.blockNumber
  vaultUpdate.transaction = transaction.id
  vaultUpdate.vault = vault.id;
  // Balances & Shares
  vaultUpdate.tokensDeposited = tokensDeposited
  vaultUpdate.tokensWithdrawn = tokensWithdrawn
  vaultUpdate.sharesMinted = sharesMinted
  vaultUpdate.sharesBurnt = sharesBurnt
  // Performance
  vaultUpdate.pricePerShare = pricePerShare
  vaultUpdate.returnsGenerated = returnsGenerated
  vaultUpdate.totalFees = totalFees
  vaultUpdate.managementFees = managementFees
  vaultUpdate.performanceFees = performanceFees
  vaultUpdate.save()
  return vaultUpdate;
}

export function firstDeposit(
  vault: Vault,
  transaction: Transaction,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  pricePerShare: BigInt,
): VaultUpdate {
  log.debug('[VaultUpdate] First deposit', [])
  let vaultUpdateId = buildIdFromVaultAndTransaction(
    vault,
    transaction
  )
  let vaultUpdate = VaultUpdate.load(vaultUpdateId)

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
      BIGINT_ZERO
    )
  }
  
  return vaultUpdate!
}

export function deposit(
  vault: Vault,
  transaction: Transaction,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  pricePerShare: BigInt,
): VaultUpdate {
  log.debug('[VaultUpdate] Deposit', [])
  let vaultUpdateId = buildIdFromVaultAndTransaction(
    vault,
    transaction
  )
  let vaultUpdate = VaultUpdate.load(vaultUpdateId)
  let latestVaultUpdate = VaultUpdate.load(vault.latestUpdate)

  if (vaultUpdate === null) {
    vaultUpdate = createVaultUpdate(
      vaultUpdateId,
      vault,
      transaction,
      latestVaultUpdate.tokensDeposited.plus(depositedAmount),
      latestVaultUpdate.tokensWithdrawn,
      latestVaultUpdate.sharesMinted.plus(sharesMinted),
      latestVaultUpdate.sharesBurnt,
      pricePerShare,
      latestVaultUpdate.returnsGenerated,
      latestVaultUpdate.totalFees,
      latestVaultUpdate.managementFees,
      latestVaultUpdate.performanceFees
    )
  }
  
  return vaultUpdate!
}