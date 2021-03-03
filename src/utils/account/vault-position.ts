import { BigInt, Result } from "@graphprotocol/graph-ts";
import { Account, AccountVaultPosition, AccountVaultPositionUpdate, Transaction, Vault } from "../../../generated/schema";
import * as vaulPositionUpdate from './vault-position-update'

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

export function deposit(
  account: Account,
  vault: Vault,
  transactionId: string,
  depositedTokens: BigInt,
  receivedShares: BigInt
): VaultPositionResponse{
  let id = buildId(account, vault)
  let accountVaultPosition = AccountVaultPosition.load(id)

  if (accountVaultPosition == null) {
    accountVaultPosition = new AccountVaultPosition(id)
    accountVaultPosition.vault = vault.id
    accountVaultPosition.account = account.id
    accountVaultPosition.transaction = transactionId
    accountVaultPosition.balanceTokens = depositedTokens
    accountVaultPosition.balanceShares = receivedShares
  } else {
    accountVaultPosition.balanceTokens = accountVaultPosition.balanceTokens.plus(depositedTokens)
    accountVaultPosition.balanceShares = accountVaultPosition.balanceShares.plus(receivedShares)
  }

  // let accountVaultPositionUpdate = vaulPositionUpdate.getOrCreate()
  // accountVaultPosition.latestUpdate = accountVaultPositionUpdate.id
  // accountVaultPosition.updates.push(accountVaultPositionUpdate.id)

  accountVaultPosition.save()

  return VaultPositionResponse.fromValue(
    accountVaultPosition!,
    null
  )
}


export function withdraw(
  account: Account,
  vault: Vault,
  transaction: Transaction,
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