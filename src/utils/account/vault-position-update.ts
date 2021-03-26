import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  Account,
  AccountVaultPosition,
  AccountVaultPositionUpdate,
  Transaction,
  Vault,
} from '../../../generated/schema';
import { BIGINT_ZERO } from '../constants';
import * as vaultUpdateLibrary from '../vault/vault-update';

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

export function createAccountVaultPositionUpdate(
  id: string,
  account: Account,
  vault: Vault,
  accountVaultPositionId: string,
  transaction: Transaction,
  deposits: BigInt,
  withdrawals: BigInt,
  sharesMinted: BigInt,
  sharesBurnt: BigInt,
  sharesSent: BigInt,
  sharesReceived: BigInt,
  tokensSent: BigInt,
  tokensReceived: BigInt
): AccountVaultPositionUpdate {
  log.debug('[VaultPositionUpdate] Creating vault position update with id {}', [
    id,
  ]);
  let accountVaultPositionUpdate = new AccountVaultPositionUpdate(id);
  accountVaultPositionUpdate.account = account.id;
  accountVaultPositionUpdate.accountVaultPosition = accountVaultPositionId;
  accountVaultPositionUpdate.timestamp = transaction.timestamp;
  accountVaultPositionUpdate.blockNumber = transaction.blockNumber;
  accountVaultPositionUpdate.transaction = transaction.id;
  accountVaultPositionUpdate.deposits = deposits;
  accountVaultPositionUpdate.withdrawals = withdrawals;
  accountVaultPositionUpdate.sharesMinted = sharesMinted;
  accountVaultPositionUpdate.sharesBurnt = sharesBurnt;
  accountVaultPositionUpdate.sharesSent = sharesSent;
  accountVaultPositionUpdate.sharesReceived = sharesReceived;
  accountVaultPositionUpdate.tokensSent = tokensSent;
  accountVaultPositionUpdate.tokensReceived = tokensReceived;
  accountVaultPositionUpdate.vaultUpdate = vaultUpdateLibrary.buildIdFromVaultAndTransaction(
    vault,
    transaction
  );
  accountVaultPositionUpdate.save();
  return accountVaultPositionUpdate;
}

export function createFirst(
  account: Account,
  vault: Vault,
  vaultPositionId: string,
  transaction: Transaction,
  depositedTokens: BigInt,
  receivedShares: BigInt
): AccountVaultPositionUpdate {
  log.debug('[VaultPositionUpdate] Create first', []);
  let id = buildIdFromAccountAndTransaction(account, transaction);
  let accountVaultPositionFirstUpdate = AccountVaultPositionUpdate.load(id);

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
      BIGINT_ZERO,
      BIGINT_ZERO,
      BIGINT_ZERO,
      BIGINT_ZERO,
      BIGINT_ZERO
    );
  }

  return accountVaultPositionFirstUpdate!;
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
  log.debug('[VaultPositionUpdate] Deposit', []);

  let previousVaultPositionUpdate = AccountVaultPositionUpdate.load(
    latestUpdateId
  );

  let id = buildIdFromAccountAndTransaction(account, transaction);
  let accountVaultPositionUpdate = AccountVaultPositionUpdate.load(id);

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
      previousVaultPositionUpdate.sharesBurnt,
      previousVaultPositionUpdate.sharesSent,
      previousVaultPositionUpdate.sharesReceived,
      previousVaultPositionUpdate.tokensSent,
      previousVaultPositionUpdate.tokensReceived
    );
  }

  return accountVaultPositionUpdate!;
}

export function transfer(
  accountVaultPosition: AccountVaultPosition,
  account: Account,
  receivingTransfer: boolean,
  vault: Vault,
  tokenAmount: BigInt,
  shareAmount: BigInt,
  transaction: Transaction
): void {
  log.debug('[AccountVaultPositionUpdate] Transfer', []);
  let latestAccountVaultPositionUpdate = AccountVaultPositionUpdate.load(
    accountVaultPosition.latestUpdate
  );
  if (latestAccountVaultPositionUpdate !== null) {
    let id = buildIdFromAccountAndTransaction(account, transaction);
    createAccountVaultPositionUpdate(
      id,
      account,
      vault,
      accountVaultPosition.id,
      transaction,
      latestAccountVaultPositionUpdate.deposits,
      latestAccountVaultPositionUpdate.withdrawals,
      latestAccountVaultPositionUpdate.sharesMinted,
      latestAccountVaultPositionUpdate.sharesBurnt,
      receivingTransfer
        ? latestAccountVaultPositionUpdate.sharesSent
        : latestAccountVaultPositionUpdate.sharesSent.plus(shareAmount),
      receivingTransfer
        ? latestAccountVaultPositionUpdate.sharesReceived.plus(shareAmount)
        : latestAccountVaultPositionUpdate.sharesReceived,
      receivingTransfer
        ? latestAccountVaultPositionUpdate.tokensSent
        : latestAccountVaultPositionUpdate.tokensSent.plus(tokenAmount),
      receivingTransfer
        ? latestAccountVaultPositionUpdate.tokensReceived.plus(tokenAmount)
        : latestAccountVaultPositionUpdate.tokensReceived
    );
    accountVaultPosition.latestUpdate = id;
    accountVaultPosition.save();
  }
}
