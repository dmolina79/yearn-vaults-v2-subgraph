import { BigInt, Bytes, Result } from "@graphprotocol/graph-ts";
import { Account, AccountVaultPosition, AccountVaultPositionUpdate } from "../../../generated/schema";
import { BIGINT_ZERO } from "../constants";
import * as vaultUpdateLibrary from '../vault/vault-update'

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


export function createFirst(
  accountVaultPosition: AccountVaultPosition,
  transactionHash: string,
  transactionIndex: string,
  depositedTokens: BigInt,
  receivedShares: BigInt
): AccountVaultPositionUpdate {

  let id = buildIdFromAccountVaultPositionHashAndIndex(
    accountVaultPosition,
    transactionHash,
    transactionIndex
  )
  let accountVaultPositionFirstUpdate = AccountVaultPositionUpdate.load(id)

  if (accountVaultPositionFirstUpdate == null) {

    accountVaultPositionFirstUpdate = new AccountVaultPositionUpdate(id)

    accountVaultPositionFirstUpdate.accountVaultPosition = accountVaultPosition.id
    accountVaultPositionFirstUpdate.transaction = transactionHash
    
    accountVaultPositionFirstUpdate.deposits = depositedTokens
    accountVaultPositionFirstUpdate.withdrawals = BIGINT_ZERO
  
    accountVaultPositionFirstUpdate.sharesMinted = receivedShares
    accountVaultPositionFirstUpdate.sharesBurnt = BIGINT_ZERO
  
    accountVaultPositionFirstUpdate.vaultUpdate = vaultUpdateLibrary.buildIdFromVaultTxHashAndIndex(
      accountVaultPosition.vault,
      transactionHash,
      transactionIndex
    )

    accountVaultPositionFirstUpdate.save()
  }

  return accountVaultPositionFirstUpdate!
}

export function deposit(
  accountVaultPosition: AccountVaultPosition,
  transactionHash: string,
  transactionIndex: string,
  depositedTokens: BigInt,
  receivedShares: BigInt
): AccountVaultPositionUpdate {

  let id = buildIdFromAccountVaultPositionHashAndIndex(
    accountVaultPosition,
    transactionHash,
    transactionIndex
  )
  let accountVaultPositionUpdate = AccountVaultPositionUpdate.load(id)

  if (accountVaultPosition == null) {
    accountVaultPositionUpdate = new AccountVaultPositionUpdate(id)

    accountVaultPositionUpdate.accountVaultPosition = accountVaultPosition.id
    accountVaultPositionUpdate.transaction = transactionHash
    
    accountVaultPositionUpdate.deposits = accountVaultPositionUpdate.deposits.plus(depositedTokens)
  
    accountVaultPositionUpdate.sharesMinted = accountVaultPositionUpdate.sharesMinted.plus(receivedShares)
  
    accountVaultPositionUpdate.vaultUpdate = vaultUpdateLibrary.buildIdFromVaultTxHashAndIndex(
      accountVaultPosition.vault,
      transactionHash,
      transactionIndex
    )

    accountVaultPositionUpdate.save()
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

  let id = buildIdFromAccountVaultPositionHashAndIndex(
    accountVaultPosition,
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