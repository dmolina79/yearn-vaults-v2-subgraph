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

export function getOrCreate(
  vault: Vault,
  transactionHash: Bytes,
  transactionIndex: BigInt,
  deposits: BigInt,
  withdrawals: BigInt, // withdrawal doesn't change
  sharesMinted: BigInt,
  sharesBurnt: BigInt, // shares burnt don't change
  pricePerShare: BigInt,
): VaultUpdate {
  log.debug('[Vault Balance Updates] Get or vault update', [])
  let vaultUpdateId = buildIdFromVaultTxHashAndIndex(
    vault.id,
    transactionHash.toHexString(),
    transactionIndex.toString()
  )
  let latestVaultUpdate = VaultUpdate.load(vault.latestUpdate)
  let vaultUpdate = VaultUpdate.load(vaultUpdateId)

  if (vaultUpdate === null) {
    vaultUpdate = new VaultUpdate(vaultUpdateId);
    vaultUpdate.transaction = transactionHash.toHexString()
    vaultUpdate.vault = vault.id;

    // BALANCES AND SHARES
    vaultUpdate.tokensDeposited = (latestVaultUpdate) ? latestVaultUpdate.tokensDeposited.plus(deposits) : deposits;
    vaultUpdate.tokensWithdrawn = (latestVaultUpdate) ? latestVaultUpdate.tokensWithdrawn.minus(withdrawals) : withdrawals;
    vaultUpdate.sharesMinted = (latestVaultUpdate) ? latestVaultUpdate.sharesMinted.plus(sharesMinted) : sharesMinted;
    vaultUpdate.sharesBurnt = (latestVaultUpdate) ? latestVaultUpdate.sharesBurnt.minus(sharesBurnt) : sharesBurnt;
    
    // vaultUpdate.balance = deposits.minus(withdrawals);
    // vaultUpdate.shareBalance = sharesMinted.minus(sharesBurnt);
  
    // PERFORMANCE
    vaultUpdate.pricePerShare = pricePerShare;
    
    // First setup
    if (!latestVaultUpdate) {
      vaultUpdate.returnsGenerated = BIGINT_ZERO
      vaultUpdate.totalFees = BIGINT_ZERO
      vaultUpdate.managementFees = BIGINT_ZERO
      vaultUpdate.performanceFees = BIGINT_ZERO
    } else {
      // TODO: Use real data
      vaultUpdate.returnsGenerated = BIGINT_ZERO
      vaultUpdate.totalFees = BIGINT_ZERO
    }

    vaultUpdate.save()
  }
  
  return vaultUpdate!
}

export function firstDeposit(
  vault: Vault,
  transactionHash: Bytes,
  transactionIndex: BigInt,
  deposits: BigInt,
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
    vaultUpdate.transaction = transactionHash.toHexString()
    vaultUpdate.vault = vault.id;

    // BALANCES AND SHARES
    vaultUpdate.tokensDeposited = deposits
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
  deposits: BigInt,
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
    vaultUpdate.transaction = transactionHash.toHexString()
    vaultUpdate.vault = vault.id;

    // BALANCES AND SHARES
    vaultUpdate.tokensDeposited = vaultUpdate.tokensDeposited.plus(deposits)
    vaultUpdate.sharesMinted = vaultUpdate.sharesMinted.plus(sharesMinted)

    // BALANCES AND SHARES
    vaultUpdate.tokensDeposited = latestVaultUpdate.tokensDeposited.plus(deposits)
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