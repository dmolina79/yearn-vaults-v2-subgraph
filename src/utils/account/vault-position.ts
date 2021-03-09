import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Account, AccountVaultPosition, AccountVaultPositionUpdate, Vault } from "../../../generated/schema";
import * as vaultPositionUpdateLibrary from './vault-position-update'

export function buildId(
  account: Account,
  vault: Vault
): string {
  return account.id.concat('-').concat(vault.id)
}

export class VaultPositionResponse {
  public accountVaultPosition: AccountVaultPosition
  public accountVaultPositionUpdate: AccountVaultPositionUpdate
  constructor(
    accountVaultPosition: AccountVaultPosition,
    accountVaultPositionUpdate: AccountVaultPositionUpdate
  ) {
    this.accountVaultPosition = accountVaultPosition
    this.accountVaultPositionUpdate = accountVaultPositionUpdate
  }
  static fromValue(
    accountVaultPosition: AccountVaultPosition,
    accountVaultPositionUpdate: AccountVaultPositionUpdate
  ): VaultPositionResponse {
    return new VaultPositionResponse(
      accountVaultPosition,
      accountVaultPositionUpdate
    )
  }
}

export function createAccountVaultPosition(
  account: Account,
  vault: Vault,
  balanceTokens: BigInt,
  balanceShares: BigInt,
  transaction: ethereum.Transaction,
): AccountVaultPosition {
  let id = buildId(account, vault)
  let entity = new AccountVaultPosition(id)
  entity.vault = vault.id
  entity.account = account.id
  entity.token = vault.token
  entity.shareToken = vault.shareToken
  entity.transaction = transaction.hash.toHexString()
  entity.balanceTokens = balanceTokens
  entity.balanceShares = balanceShares
  entity.save()
  return entity
}

export function deposit(
  account: Account,
  vault: Vault,
  timestamp: BigInt,
  blockNumber: BigInt,
  depositedTokens: BigInt,
  receivedShares: BigInt,
  transaction: ethereum.Transaction,
): VaultPositionResponse{
  let vaultPositionId = buildId(account, vault)
  let accountVaultPosition = AccountVaultPosition.load(vaultPositionId)
  let accountVaultPositionUpdate: AccountVaultPositionUpdate

  if (accountVaultPosition == null) {
    accountVaultPosition = new AccountVaultPosition(vaultPositionId)
    accountVaultPosition.vault = vault.id
    accountVaultPosition.account = account.id
    accountVaultPosition.token = vault.token
    accountVaultPosition.shareToken = vault.shareToken
    accountVaultPosition.transaction = transaction.hash.toHexString()
    accountVaultPosition.balanceTokens = depositedTokens
    accountVaultPosition.balanceShares = receivedShares
    accountVaultPositionUpdate = vaultPositionUpdateLibrary.createFirst(
      accountVaultPosition!,
      timestamp,
      blockNumber,
      depositedTokens,
      receivedShares,
      transaction,
    )
  } else {
    accountVaultPosition.balanceTokens = accountVaultPosition.balanceTokens.plus(depositedTokens)
    accountVaultPosition.balanceShares = accountVaultPosition.balanceShares.plus(receivedShares)
    accountVaultPositionUpdate = vaultPositionUpdateLibrary.deposit(
      accountVaultPosition!,
      timestamp,
      blockNumber,
      depositedTokens,
      receivedShares,
      transaction,
    )
  }
  // FIX: For some reason if we refer accountVaultPositionUpdate.id it breaks down
  accountVaultPosition.latestUpdate = vaultPositionUpdateLibrary.buildIdFromAccountHashAndIndex(
    account.id,
    transaction.hash.toHexString(),
    transaction.index.toString(),
  )
  accountVaultPosition.save()

  return VaultPositionResponse.fromValue(
    accountVaultPosition!,
    accountVaultPositionUpdate!
  )
}

export function withdraw(
  account: Account,
  vault: Vault,
  transactionHash: string,
  transactionIndex: string,
  burntShares: BigInt,
  receivedTokens: BigInt
): VaultPositionResponse {
  let id = buildId(account, vault)
  let accountVaultPosition = AccountVaultPosition.load(id)

  accountVaultPosition.balanceShares = accountVaultPosition.balanceShares.minus(burntShares)
  accountVaultPosition.balanceTokens = accountVaultPosition.balanceTokens.minus(receivedTokens)

  // let accountVaultPositionUpdate = vaulPositionUpdate.getOrCreate()
  // accountVaultPosition.latestUpdate = accountVaultPositionUpdate.id
  // accountVaultPosition.updates.push(accountVaultPositionUpdate.id)

  accountVaultPosition.save()

  return VaultPositionResponse.fromValue(
    accountVaultPosition!,
    null
  )
}
