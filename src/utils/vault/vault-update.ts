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