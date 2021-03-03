import { BigInt, Bytes, log } from '@graphprotocol/graph-ts';

import {
    Account, Deposit, Vault
} from '../../generated/schema';

import {
    buildId,
} from './commons';
import * as vaultLibrary from './vault/vault-update';

export function getOrCreate(
  transactionHash: Bytes,
  transactionIndex: BigInt,
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
    deposit.account = account.id
    deposit.vault = vault.id
    deposit.tokenAmount = amount
    deposit.sharesMinted = sharesMinted
    deposit.transaction = transactionHash.toHexString()

    let vaultUpdateId = vaultLibrary.buildIdFromVaultTxHashAndIndex(
      vault,
      transactionHash,
      transactionIndex,
    );

    deposit.vaultUpdate = vaultUpdateId
  
    deposit.save();
  }

  return deposit!
}