import { BigInt, Bytes, log } from '@graphprotocol/graph-ts';

import {
    Account, Deposit, Vault
} from '../../generated/schema';

import {
    buildId,
} from './commons';
import * as vaultUpdateLibrary from './vault/vault-update';

export function getOrCreate(
  transactionHash: Bytes,
  transactionIndex: BigInt,
  timestamp: BigInt,
  blockNumber: BigInt,
  account: Account,
  vault: Vault,
  amount: BigInt,
  sharesMinted: BigInt
): Deposit {
  log.debug('[Deposit] Get or create', [])
  let id = buildId(transactionHash, transactionIndex);
  let deposit = Deposit.load(id)

  if (deposit === null) {
    deposit = new Deposit(id)
    deposit.timestamp = timestamp
    deposit.blockNumber = blockNumber
    deposit.account = account.id
    deposit.vault = vault.id
    deposit.tokenAmount = amount
    deposit.sharesMinted = sharesMinted
    deposit.transaction = transactionHash.toHexString()

    let vaultUpdateId = vaultUpdateLibrary.buildIdFromVaultTxHashAndIndex(
      vault.id,
      transactionHash.toHexString(),
      transactionIndex.toString(),
    );

    deposit.vaultUpdate = vaultUpdateId
  
    deposit.save();
  }

  return deposit!
}