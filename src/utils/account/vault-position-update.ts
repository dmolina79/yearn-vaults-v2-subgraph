import { BigInt, Bytes, ethereum, log, Result } from "@graphprotocol/graph-ts";
import { Account, AccountVaultPosition, AccountVaultPositionUpdate, Transaction, Vault } from "../../../generated/schema";
import { BIGINT_ZERO } from "../constants";
import * as vaultUpdateLibrary from '../vault/vault-update'

export function buildIdFromAccountHashAndIndex (
  account: Account,
  transactionHash: string,
  transactionIndex: string
): string {
  return account.id.concat('-').concat(
    transactionHash
  ).concat('-').concat(
    transactionIndex
  )
}

export function buildIdFromAccountAndTransaction (
  account: Account,
  transaction: Transaction
): string {
  return buildIdFromAccountHashAndIndex(
    account,
    transaction.id,
    transaction.index.toString()
  )
}

function createAccountVaultPositionUpdate(
  id: string,
  account: Account,
  vault: Vault,
  vaultPositionId: string,
  transaction: Transaction,
  deposits: BigInt,
  withdrawals: BigInt,
  sharesMinted: BigInt,
  sharesBurnt: BigInt
): AccountVaultPositionUpdate {
  log.debug('[VaultPositionUpdate] Creating vault position update with id {}', [id])
  let accountVaultPositionUpdate = new AccountVaultPositionUpdate(id)
  accountVaultPositionUpdate.account = account.id
  accountVaultPositionUpdate.accountVaultPosition = vaultPositionId
  accountVaultPositionUpdate.timestamp = transaction.timestamp
  accountVaultPositionUpdate.blockNumber = transaction.blockNumber
  accountVaultPositionUpdate.transaction = transaction.id
  accountVaultPositionUpdate.deposits = deposits
  accountVaultPositionUpdate.withdrawals = withdrawals
  accountVaultPositionUpdate.sharesMinted = sharesMinted
  accountVaultPositionUpdate.sharesBurnt = sharesBurnt
  accountVaultPositionUpdate.vaultUpdate = vaultUpdateLibrary.buildIdFromVaultTxHashAndIndex(
    vault.id,
    transaction.id,
    transaction.index.toString()
  )
  // accountVaultPositionUpdate.vaultUpdate = buildIdFromVaultIdAndTransaction(
  //   accountVaultPosition.vault,
  //   transaction,
  // )
  accountVaultPositionUpdate.save()
  return accountVaultPositionUpdate
}


export function createFirst(
  account: Account,
  vault: Vault,
  vaultPositionId: string,
  transaction: Transaction,
  depositedTokens: BigInt,
  receivedShares: BigInt
): AccountVaultPositionUpdate {
  log.debug('[VaultPositionUpdate] Create first', [])
  let id = buildIdFromAccountAndTransaction(
    account,
    transaction
  )
  let accountVaultPositionFirstUpdate = AccountVaultPositionUpdate.load(id)

  if (accountVaultPositionFirstUpdate == null) {

    accountVaultPositionFirstUpdate = createAccountVaultPositionUpdate(
      id,
      account,
      vault,
      vaultPositionId,
      transaction,
      depositedTokens,
      BIGINT_ZERO,
      receivedShares,
      BIGINT_ZERO
    )
  }

  return accountVaultPositionFirstUpdate!
}

export function deposit(
  account: Account,
  vault: Vault,
  vaultPositionId: string,
  latestUpdateId: string,
  transaction: Transaction,
  depositedTokens: BigInt,
  receivedShares: BigInt
): AccountVaultPositionUpdate {
  log.debug('[VaultPositionUpdate] Deposit', [])
  
  let previousVaultPositionUpdate = AccountVaultPositionUpdate.load(latestUpdateId)

  let id = buildIdFromAccountAndTransaction(
    account,
    transaction
  )
  let accountVaultPositionUpdate = AccountVaultPositionUpdate.load(id)

  if (accountVaultPositionUpdate == null) {
  
    accountVaultPositionUpdate = createAccountVaultPositionUpdate(
      id,
      account,
      vault,
      vaultPositionId,
      transaction,
      previousVaultPositionUpdate.deposits.plus(depositedTokens),
      previousVaultPositionUpdate.withdrawals,
      previousVaultPositionUpdate.sharesMinted.plus(receivedShares),
      previousVaultPositionUpdate.sharesBurnt
    )
  }

  return accountVaultPositionUpdate!
}

export function withdraw(
  accountVaultPosition: AccountVaultPosition,
  transactionHash: string,
  transactionIndex: string,
  withdrawedTokens: BigInt,
  sharesBurnt: BigInt
): AccountVaultPositionUpdate {

  let id = buildIdFromAccountHashAndIndex(
    Account.load(accountVaultPosition.account),
    transactionHash,
    transactionIndex
  )

  let accountVaultPositionUpdate = AccountVaultPositionUpdate.load(id)

  if (accountVaultPosition == null) {
    accountVaultPositionUpdate = new AccountVaultPositionUpdate(id)
    
    accountVaultPositionUpdate.accountVaultPosition = accountVaultPosition.id
    accountVaultPositionUpdate.transaction = transactionHash
    
    accountVaultPositionUpdate.withdrawals = accountVaultPositionUpdate.withdrawals.plus(withdrawedTokens)

    accountVaultPositionUpdate.sharesBurnt = accountVaultPositionUpdate.sharesBurnt.plus(sharesBurnt)

    accountVaultPositionUpdate.vaultUpdate = vaultUpdateLibrary.buildIdFromVaultTxHashAndIndex(
      accountVaultPosition.vault,
      transactionHash,
      transactionIndex
    )
  }

  return accountVaultPositionUpdate!
}
