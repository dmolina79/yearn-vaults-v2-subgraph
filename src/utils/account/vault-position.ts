import { BigInt, log, Result } from '@graphprotocol/graph-ts';
import {
  Account,
  AccountVaultPosition,
  AccountVaultPositionUpdate,
  Transaction,
  Vault,
} from '../../../generated/schema';
import * as vaultPositionUpdateLibrary from './vault-position-update';

export function buildId(account: Account, vault: Vault): string {
  return account.id.concat('-').concat(vault.id);
}

export class VaultPositionResponse {
  public accountVaultPosition: AccountVaultPosition;
  public accountVaultPositionUpdate: AccountVaultPositionUpdate;
  constructor(
    accountVaultPosition: AccountVaultPosition,
    accountVaultPositionUpdate: AccountVaultPositionUpdate
  ) {
    this.accountVaultPosition = accountVaultPosition;
    this.accountVaultPositionUpdate = accountVaultPositionUpdate;
  }
  static fromValue(
    accountVaultPosition: AccountVaultPosition,
    accountVaultPositionUpdate: AccountVaultPositionUpdate
  ): VaultPositionResponse {
    return new VaultPositionResponse(
      accountVaultPosition,
      accountVaultPositionUpdate
    );
  }
}

export function deposit(
  account: Account,
  vault: Vault,
  transaction: Transaction,
  depositedTokens: BigInt,
  receivedShares: BigInt
): VaultPositionResponse {
  log.debug('[VaultPosition] Deposit', []);
  let vaultPositionId = buildId(account, vault);
  let accountVaultPosition = AccountVaultPosition.load(vaultPositionId);
  let accountVaultPositionUpdate: AccountVaultPositionUpdate;

  if (accountVaultPosition == null) {
    accountVaultPosition = new AccountVaultPosition(vaultPositionId);
    accountVaultPosition.vault = vault.id;
    accountVaultPosition.account = account.id;
    accountVaultPosition.token = vault.token;
    accountVaultPosition.shareToken = vault.shareToken;
    accountVaultPosition.transaction = transaction.id;
    accountVaultPosition.balanceTokens = depositedTokens;
    accountVaultPosition.balanceShares = receivedShares;
    accountVaultPositionUpdate = vaultPositionUpdateLibrary.createFirst(
      account,
      vault,
      vaultPositionId,
      transaction,
      depositedTokens,
      receivedShares
    );
  } else {
    accountVaultPosition.balanceTokens = accountVaultPosition.balanceTokens.plus(
      depositedTokens
    );
    accountVaultPosition.balanceShares = accountVaultPosition.balanceShares.plus(
      receivedShares
    );
    accountVaultPositionUpdate = vaultPositionUpdateLibrary.deposit(
      account,
      vault,
      vaultPositionId,
      accountVaultPosition.latestUpdate,
      transaction,
      depositedTokens,
      receivedShares
    );
  }

  accountVaultPosition.latestUpdate = accountVaultPositionUpdate.id;
  accountVaultPosition.save();

  return VaultPositionResponse.fromValue(
    accountVaultPosition!,
    accountVaultPositionUpdate!
  );
}

export function withdraw(
  account: Account,
  vault: Vault,
  transactionHash: string,
  transactionIndex: string,
  burntShares: BigInt,
  receivedTokens: BigInt
): VaultPositionResponse {
  let id = buildId(account, vault);
  let accountVaultPosition = AccountVaultPosition.load(id);

  accountVaultPosition.balanceShares = accountVaultPosition.balanceShares.minus(
    burntShares
  );
  accountVaultPosition.balanceTokens = accountVaultPosition.balanceTokens.minus(
    receivedTokens
  );

  // let accountVaultPositionUpdate = vaulPositionUpdate.getOrCreate()
  // accountVaultPosition.latestUpdate = accountVaultPositionUpdate.id
  // accountVaultPosition.updates.push(accountVaultPositionUpdate.id)

  accountVaultPosition.save();

  return VaultPositionResponse.fromValue(accountVaultPosition!, null);
}
