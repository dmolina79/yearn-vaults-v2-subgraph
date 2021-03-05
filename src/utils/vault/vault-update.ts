import { BigInt, Bytes, log } from "@graphprotocol/graph-ts"
import { Vault, VaultUpdate } from "../../../generated/schema"
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

export function firstDeposit(
  vault: Vault,
  transactionHash: Bytes,
  transactionIndex: BigInt,
  timestamp: BigInt,
  blockNumber: BigInt,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  pricePerShare: BigInt,
): VaultUpdate {
  log.debug('[Vault Balance Updates] First deposit', [])
  let vaultUpdateId = buildIdFromVaultTxHashAndIndex(
    vault.id,
    transactionHash.toHexString(),
    transactionIndex.toString()
  )
  let vaultUpdate = VaultUpdate.load(vaultUpdateId)

  if (vaultUpdate === null) {
    vaultUpdate = new VaultUpdate(vaultUpdateId);
    vaultUpdate.timestamp = timestamp
    vaultUpdate.blockNumber = blockNumber
    vaultUpdate.transaction = transactionHash.toHexString()
    vaultUpdate.vault = vault.id;

    // BALANCES AND SHARES
    vaultUpdate.tokensDeposited = depositedAmount
    vaultUpdate.tokensWithdrawn = BIGINT_ZERO
    vaultUpdate.sharesMinted = sharesMinted
    vaultUpdate.sharesBurnt = BIGINT_ZERO
  
    // PERFORMANCE
    vaultUpdate.pricePerShare = pricePerShare
    
    vaultUpdate.returnsGenerated = BIGINT_ZERO
    vaultUpdate.totalFees = BIGINT_ZERO
    vaultUpdate.managementFees = BIGINT_ZERO
    vaultUpdate.performanceFees = BIGINT_ZERO

    vaultUpdate.save()
  }
  
  return vaultUpdate!
}

export function deposit(
  vault: Vault,
  transactionHash: Bytes,
  transactionIndex: BigInt,
  timestamp: BigInt,
  blockNumber: BigInt,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  pricePerShare: BigInt,
): VaultUpdate {
  log.debug('[Vault Balance Updates] Deposit', [])
  let vaultUpdateId = buildIdFromVaultTxHashAndIndex(
    vault.id,
    transactionHash.toHexString(),
    transactionIndex.toString()
  )
  let vaultUpdate = VaultUpdate.load(vaultUpdateId)
  let latestVaultUpdate = VaultUpdate.load(vault.latestUpdate)

  if (vaultUpdate === null) {
    vaultUpdate = new VaultUpdate(vaultUpdateId);
    vaultUpdate.timestamp = timestamp
    vaultUpdate.blockNumber = blockNumber
    vaultUpdate.transaction = transactionHash.toHexString()
    vaultUpdate.vault = vault.id;

    // BALANCES AND SHARES
    vaultUpdate.tokensDeposited = latestVaultUpdate.tokensDeposited.plus(depositedAmount)
    vaultUpdate.tokensWithdrawn = latestVaultUpdate.tokensWithdrawn
    vaultUpdate.sharesMinted = latestVaultUpdate.sharesMinted.plus(sharesMinted)
    vaultUpdate.sharesBurnt = latestVaultUpdate.sharesBurnt
  
    // PERFORMANCE
    vaultUpdate.pricePerShare = pricePerShare
    
    vaultUpdate.returnsGenerated = latestVaultUpdate.returnsGenerated
    vaultUpdate.totalFees = latestVaultUpdate.totalFees
    vaultUpdate.managementFees = latestVaultUpdate.managementFees
    vaultUpdate.performanceFees = latestVaultUpdate.performanceFees
  
    // PERFORMANCE
    vaultUpdate.pricePerShare = pricePerShare

    vaultUpdate.save()
  }
  
  return vaultUpdate!
}