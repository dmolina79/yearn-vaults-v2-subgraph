import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { AccountVaultPosition, AccountVaultPositionUpdate } from "../../../generated/schema";
import { BIGINT_ZERO } from "../constants";
import { buildIdFromVaultIdAndTransaction } from '../commons'

export function buildIdFromAccountHashAndIndex(
  account: string,
  transactionHash: string,
  transactionIndex: string
): string {
  return account.concat('-').concat(
    transactionHash
  ).concat('-').concat(
    transactionIndex
  )
}

export function buildIdFromAccountVaultPositionHashAndIndex (
  accountVaultPosition: AccountVaultPosition,
  transactionHash: string,
  transactionIndex: string
): string {
  return buildIdFromAccountHashAndIndex(
    accountVaultPosition.account,
    transactionHash,
    transactionIndex
  )
}

export function createAccountVaultPositionUpdate(
  id: string,
  accountVaultPosition: AccountVaultPosition,
  timestamp: BigInt,
  blockNumber: BigInt,
  deposits: BigInt,
  withdrawals: BigInt,
  sharesMinted: BigInt,
  sharesBurnt: BigInt,
  transaction: ethereum.Transaction,
): AccountVaultPositionUpdate {
  let entity = new AccountVaultPositionUpdate(id)
  entity.account = accountVaultPosition.account
  entity.accountVaultPosition = accountVaultPosition.id
  entity.timestamp = timestamp
  entity.blockNumber = blockNumber
  entity.transaction = transaction.hash.toHexString()
  entity.deposits = deposits
  entity.withdrawals = withdrawals
  entity.sharesMinted = sharesMinted
  entity.sharesBurnt = sharesBurnt
  entity.vaultUpdate = buildIdFromVaultIdAndTransaction(
    accountVaultPosition.vault,
    transaction,
  )
  entity.save()
  return entity;
}

export function createFirst(
  accountVaultPosition: AccountVaultPosition,
  timestamp: BigInt,
  blockNumber: BigInt,
  depositedTokens: BigInt,
  receivedShares: BigInt,
  transaction: ethereum.Transaction,
): AccountVaultPositionUpdate {

  let id = buildIdFromAccountVaultPositionHashAndIndex(
    accountVaultPosition,
    transaction.hash.toHexString(),
    transaction.index.toString()
  )
  let accountVaultPositionFirstUpdate = AccountVaultPositionUpdate.load(id)

  if (accountVaultPositionFirstUpdate == null) {

    accountVaultPositionFirstUpdate = new AccountVaultPositionUpdate(id)

    accountVaultPositionFirstUpdate.timestamp = timestamp
    accountVaultPositionFirstUpdate.blockNumber = blockNumber
    accountVaultPositionFirstUpdate.account = accountVaultPosition.account
    accountVaultPositionFirstUpdate.accountVaultPosition = accountVaultPosition.id
    accountVaultPositionFirstUpdate.transaction = transaction.hash.toHexString()
    
    accountVaultPositionFirstUpdate.deposits = depositedTokens
    accountVaultPositionFirstUpdate.withdrawals = BIGINT_ZERO
  
    accountVaultPositionFirstUpdate.sharesMinted = receivedShares
    accountVaultPositionFirstUpdate.sharesBurnt = BIGINT_ZERO
  
    accountVaultPositionFirstUpdate.vaultUpdate = buildIdFromVaultIdAndTransaction(
      accountVaultPosition.vault,
      transaction
    )

    accountVaultPositionFirstUpdate.save()
  }

  return accountVaultPositionFirstUpdate!
}

export function deposit(
  accountVaultPosition: AccountVaultPosition,
  timestamp: BigInt,
  blockNumber: BigInt,
  depositedTokens: BigInt,
  receivedShares: BigInt,
  transaction: ethereum.Transaction
): AccountVaultPositionUpdate {

  let id = buildIdFromAccountVaultPositionHashAndIndex(
    accountVaultPosition,
    transaction.hash.toHexString(),
    transaction.index.toString()
  )
  let accountVaultPositionUpdate = AccountVaultPositionUpdate.load(id)

  if (accountVaultPosition == null) {
    accountVaultPositionUpdate = new AccountVaultPositionUpdate(id)

    accountVaultPositionUpdate.timestamp = timestamp
    accountVaultPositionUpdate.blockNumber = blockNumber
    accountVaultPositionUpdate.account = accountVaultPosition.account
    accountVaultPositionUpdate.accountVaultPosition = accountVaultPosition.id
    accountVaultPositionUpdate.transaction = transaction.hash.toHexString()
    
    accountVaultPositionUpdate.deposits = accountVaultPositionUpdate.deposits.plus(depositedTokens)
  
    accountVaultPositionUpdate.sharesMinted = accountVaultPositionUpdate.sharesMinted.plus(receivedShares)
  
    accountVaultPositionUpdate.vaultUpdate = buildIdFromVaultIdAndTransaction(
      accountVaultPosition.vault,
      transaction,
    )

    accountVaultPositionUpdate.save()
  }

  return accountVaultPositionUpdate!
}

export function withdraw(
  accountVaultPosition: AccountVaultPosition,
  withdrawedTokens: BigInt,
  sharesBurnt: BigInt,
  transaction: ethereum.Transaction,
): AccountVaultPositionUpdate {

  let id = buildIdFromAccountVaultPositionHashAndIndex(
    accountVaultPosition,
    transaction.hash.toHexString(),
    transaction.index.toString(),
  )

  let accountVaultPositionUpdate = AccountVaultPositionUpdate.load(id)

  if (accountVaultPosition == null) {
    accountVaultPositionUpdate = new AccountVaultPositionUpdate(id)
    
    accountVaultPositionUpdate.accountVaultPosition = accountVaultPosition.id
    accountVaultPositionUpdate.transaction = transaction.hash.toHexString()
    
    accountVaultPositionUpdate.withdrawals = accountVaultPositionUpdate.withdrawals.plus(withdrawedTokens)

    accountVaultPositionUpdate.sharesBurnt = accountVaultPositionUpdate.sharesBurnt.plus(sharesBurnt)

    accountVaultPositionUpdate.vaultUpdate = buildIdFromVaultIdAndTransaction(
      accountVaultPosition.vault,
      transaction,
    )
  }

  return accountVaultPositionUpdate!
}
