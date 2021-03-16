import { BigInt, Bytes, ethereum, Result } from "@graphprotocol/graph-ts";
import { Account, AccountVaultPosition, AccountVaultPositionUpdate, Vault } from "../../../generated/schema";
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

function createAccountVaultPositionUpdate(
  id: string,
  account: Account,
  vault: Vault,
  vaultPositionId: string,
  timestamp: BigInt,
  blockNumber: BigInt,
  deposits: BigInt,
  withdrawals: BigInt,
  sharesMinted: BigInt,
  sharesBurnt: BigInt,
  transactionHash: string,
  transactionIndex: string
): AccountVaultPositionUpdate {
  let accountVaultPositionUpdate = new AccountVaultPositionUpdate(id)
  accountVaultPositionUpdate.account = account.id
  accountVaultPositionUpdate.accountVaultPosition = vaultPositionId
  accountVaultPositionUpdate.timestamp = timestamp
  accountVaultPositionUpdate.blockNumber = blockNumber
  accountVaultPositionUpdate.transaction = transactionHash
  accountVaultPositionUpdate.deposits = deposits
  accountVaultPositionUpdate.withdrawals = withdrawals
  accountVaultPositionUpdate.sharesMinted = sharesMinted
  accountVaultPositionUpdate.sharesBurnt = sharesBurnt
  accountVaultPositionUpdate.vaultUpdate = vaultUpdateLibrary.buildIdFromVaultTxHashAndIndex(
    vault.id,
    transactionHash,
    transactionIndex
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
  transactionHash: string,
  transactionIndex: string,
  timestamp: BigInt,
  blockNumber: BigInt,
  depositedTokens: BigInt,
  receivedShares: BigInt
): AccountVaultPositionUpdate {

  let id = buildIdFromAccountHashAndIndex(
    account,
    transactionHash,
    transactionIndex
  )
  let accountVaultPositionFirstUpdate = AccountVaultPositionUpdate.load(id)

  if (accountVaultPositionFirstUpdate == null) {

    accountVaultPositionFirstUpdate = createAccountVaultPositionUpdate(
      id,
      account,
      vault,
      vaultPositionId,
      timestamp,
      blockNumber,
      depositedTokens,
      BIGINT_ZERO,
      receivedShares,
      BIGINT_ZERO,
      transactionHash,
      transactionIndex
    )
  }

  return accountVaultPositionFirstUpdate!
}

export function deposit(
  account: Account,
  vault: Vault,
  vaultPositionId: string,
  latestUpdateId: string,
  transactionHash: string,
  transactionIndex: string,
  timestamp: BigInt,
  blockNumber: BigInt,
  depositedTokens: BigInt,
  receivedShares: BigInt
): AccountVaultPositionUpdate {

  let previousVaultPositionUpdate = AccountVaultPositionUpdate.load(latestUpdateId)

  let id = buildIdFromAccountHashAndIndex(
    account,
    transactionHash,
    transactionIndex
  )
  let accountVaultPositionUpdate = AccountVaultPositionUpdate.load(id)

  if (accountVaultPositionUpdate == null) {
  
    accountVaultPositionUpdate = createAccountVaultPositionUpdate(
      id,
      account,
      vault,
      vaultPositionId,
      timestamp,
      blockNumber,
      previousVaultPositionUpdate.deposits.plus(depositedTokens),
      previousVaultPositionUpdate.withdrawals,
      previousVaultPositionUpdate.sharesMinted.plus(receivedShares),
      previousVaultPositionUpdate.sharesBurnt,
      transactionHash,
      transactionIndex
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
