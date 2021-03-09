import { BigInt, ethereum, log } from '@graphprotocol/graph-ts';

import {
    Account, Deposit, Vault
} from '../../generated/schema';

import {
    buildId,
    buildIdFromVaultIdAndTransaction
} from './commons';

export function getOrCreate(
  timestamp: BigInt,
  blockNumber: BigInt,
  account: Account,
  vault: Vault,
  amount: BigInt,
  sharesMinted: BigInt,
  transaction: ethereum.Transaction,
): Deposit {
  log.debug('[Deposit] Get or create', [])
  let id = buildId(transaction.hash, transaction.index);
  let deposit = Deposit.load(id)

  if (deposit === null) {
    deposit = new Deposit(id)
    deposit.timestamp = timestamp
    deposit.blockNumber = blockNumber
    deposit.account = account.id
    deposit.vault = vault.id
    deposit.tokenAmount = amount
    deposit.sharesMinted = sharesMinted
    deposit.transaction = transaction.hash.toHexString()

    let vaultUpdateId = buildIdFromVaultIdAndTransaction(
      vault.id,
      transaction,
    );

    deposit.vaultUpdate = vaultUpdateId
  
    deposit.save();
  }

  return deposit!
}