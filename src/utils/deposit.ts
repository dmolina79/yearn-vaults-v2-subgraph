import { BigInt, Bytes, log } from '@graphprotocol/graph-ts';

import { Account, Deposit, Transaction, Vault } from '../../generated/schema';

import { buildId } from './commons';
import * as vaultUpdateLibrary from './vault/vault-update';

export function buildIdFromAccountHashAndIndex(
  account: Account,
  transactionHash: string,
  transactionIndex: string
): string {
  return account.id
    .concat('-')
    .concat(transactionHash)
    .concat('-')
    .concat(transactionIndex);
}

export function buildIdFromAccountAndTransaction(
  account: Account,
  transaction: Transaction
): string {
  return buildIdFromAccountHashAndIndex(
    account,
    transaction.id,
    transaction.index.toString()
  );
}

export function getOrCreate(
  account: Account,
  vault: Vault,
  transaction: Transaction,
  amount: BigInt,
  sharesMinted: BigInt
): Deposit {
  log.debug('[Deposit] Get or create', []);
  let id = buildIdFromAccountAndTransaction(account, transaction);
  let deposit = Deposit.load(id);

  if (deposit === null) {
    deposit = new Deposit(id);
    deposit.timestamp = transaction.timestamp;
    deposit.blockNumber = transaction.blockNumber;
    deposit.account = account.id;
    deposit.vault = vault.id;
    deposit.tokenAmount = amount;
    deposit.sharesMinted = sharesMinted;
    deposit.transaction = transaction.id;

    let vaultUpdateId = vaultUpdateLibrary.buildIdFromVaultTxHashAndIndex(
      vault.id,
      transaction.id,
      transaction.index.toString()
    );

    deposit.vaultUpdate = vaultUpdateId;

    deposit.save();
  }

  return deposit!;
}
