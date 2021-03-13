import { BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { Vault, VaultUpdate } from "../../../generated/schema"
import { BIGINT_ZERO } from "../constants";
import { buildIdFromVaultIdAndTransaction } from "../commons";

export function createVaultUpdate(
  id: string,
  vault: Vault,
  timestamp: BigInt,
  blockNumber: BigInt,
  tokensDeposited: BigInt,
  tokensWithdrawn: BigInt,
  sharesMinted: BigInt,
  sharesBurnt: BigInt,
  pricePerShare: BigInt,
  returnsGenerated: BigInt,
  totalFees: BigInt,
  managementFees: BigInt,
  performanceFees: BigInt,
  transaction: ethereum.Transaction,
): VaultUpdate {
  log.info("VaultUpdate: creating entity for vault id {}", [vault.id])
  let entity = new VaultUpdate(id)
  entity.timestamp = timestamp
  entity.blockNumber = blockNumber
  entity.transaction = transaction.hash.toHexString()
  entity.vault = vault.id;
  // Balances & Shares
  entity.tokensDeposited = tokensDeposited
  entity.tokensWithdrawn = tokensWithdrawn
  entity.sharesMinted = sharesMinted
  entity.sharesBurnt = sharesBurnt
  // Performance
  entity.pricePerShare = pricePerShare
  entity.returnsGenerated = returnsGenerated
  entity.totalFees = totalFees
  entity.managementFees = managementFees
  entity.performanceFees = performanceFees
  entity.save()
  return entity;
}

export function firstDeposit(
  vault: Vault,
  timestamp: BigInt,
  blockNumber: BigInt,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  pricePerShare: BigInt,
  transaction: ethereum.Transaction,
): VaultUpdate {
  log.debug('[Vault Balance Updates] First deposit', [])
  let vaultUpdateId = buildIdFromVaultIdAndTransaction(
    vault.id,
    transaction,
  )
  let vaultUpdate = VaultUpdate.load(vaultUpdateId)
  if (vaultUpdate === null) {
    vaultUpdate = createVaultUpdate(
      vaultUpdateId,
      vault,
      timestamp,
      blockNumber,
      depositedAmount,
      BIGINT_ZERO,
      sharesMinted,
      BIGINT_ZERO,
      pricePerShare,
      BIGINT_ZERO,
      BIGINT_ZERO,
      BIGINT_ZERO,
      BIGINT_ZERO,
      transaction,
    )
  }
  return vaultUpdate as VaultUpdate
}

export function deposit(
  vault: Vault,
  timestamp: BigInt,
  blockNumber: BigInt,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  pricePerShare: BigInt,
  transaction: ethereum.Transaction,
): VaultUpdate {
  log.debug('[Vault Balance Updates] Deposit', [])
  let vaultUpdateId = buildIdFromVaultIdAndTransaction(
    vault.id,
    transaction
  )
  let vaultUpdate = VaultUpdate.load(vaultUpdateId)
  let latestVaultUpdate = VaultUpdate.load(vault.latestUpdate)

  if (vaultUpdate === null) {
    vaultUpdate = createVaultUpdate(
      vaultUpdateId,
      vault,
      timestamp,
      blockNumber,
      latestVaultUpdate.tokensDeposited.plus(depositedAmount),
      latestVaultUpdate.tokensWithdrawn,
      latestVaultUpdate.sharesMinted.plus(sharesMinted),
      latestVaultUpdate.sharesBurnt,
      pricePerShare,
      latestVaultUpdate.returnsGenerated,
      latestVaultUpdate.totalFees,
      latestVaultUpdate.managementFees,
      latestVaultUpdate.performanceFees,
      transaction,
    )
  }
  return vaultUpdate as VaultUpdate
}

export function withdraw(
  vault: Vault,
  latestVaultUpdate: VaultUpdate,
  pricePerShare: BigInt,
  withdrawnAmount: BigInt,
  sharesBurnt: BigInt,
  timestamp: BigInt,
  blockNumber: BigInt,
  transaction: ethereum.Transaction,
): VaultUpdate {
  let newVaultUpdate = createVaultUpdate(
    buildIdFromVaultIdAndTransaction(
      vault.id,
      transaction,
    ),
    vault,
    timestamp,
    blockNumber,
    latestVaultUpdate.tokensDeposited,
    latestVaultUpdate.tokensWithdrawn.plus(withdrawnAmount),
    latestVaultUpdate.sharesMinted,
    latestVaultUpdate.sharesBurnt.plus(sharesBurnt),
    pricePerShare,
    latestVaultUpdate.returnsGenerated,
    latestVaultUpdate.totalFees,
    latestVaultUpdate.managementFees,
    latestVaultUpdate.performanceFees,
    transaction,
  )
  vault.sharesSupply = vault.sharesSupply.minus(sharesBurnt)
  vault.balanceTokens = vault.balanceTokens.minus(withdrawnAmount)
  vault.latestUpdate = newVaultUpdate.id
  vault.save()
  return newVaultUpdate
}