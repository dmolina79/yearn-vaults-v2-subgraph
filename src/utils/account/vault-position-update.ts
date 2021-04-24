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
  return account.id.concat('-'.concat(transaction.id));
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
  tokensReceived: BigInt,
  balancePosition: BigInt
): AccountVaultPositionUpdate {
  log.info(
    '[VaultPositionUpdate] Creating account {} vault position update with id {}',
    [account.id, id]
  );
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
  accountVaultPositionUpdate.balancePosition = balancePosition;
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
  receivedShares: BigInt,
  balancePosition: BigInt
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
      BIGINT_ZERO,
      balancePosition
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
  receivedShares: BigInt,
  balancePosition: BigInt
): AccountVaultPositionUpdate {
  log.debug('[VaultPositionUpdate] Deposit', []);
  let id = buildIdFromAccountAndTransaction(account, transaction);
  let accountVaultPositionUpdate = AccountVaultPositionUpdate.load(id);

  if (accountVaultPositionUpdate == null) {
    accountVaultPositionUpdate = createAccountVaultPositionUpdate(
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
      BIGINT_ZERO,
      balancePosition
    );
  }

  return accountVaultPositionUpdate!;
}

export function transfer(
  accountVaultPositionUpdateId: string,
  createFirstAccountVaultPositionUpdate: boolean,
  accountVaultPosition: AccountVaultPosition,
  account: Account,
  receivingTransfer: boolean,
  vault: Vault,
  tokenAmount: BigInt,
  shareAmount: BigInt,
  balancePosition: BigInt,
  transaction: Transaction
): void {
  log.info(
    '[AccountVaultPositionUpdate] Transfer. Processing account {} for vault position {} in TX {}',
    [account.id, accountVaultPosition.id, transaction.hash.toHexString()]
  );
  if (createFirstAccountVaultPositionUpdate) {
    log.info(
      '[AccountVaultPositionUpdate] Transfer. Account vault position (first time - latestUpdate is null -). Account vault position id {}',
      [accountVaultPosition.id]
    );
    createAccountVaultPositionUpdate(
      accountVaultPositionUpdateId,
      account,
      vault,
      accountVaultPosition.id,
      transaction,
      BIGINT_ZERO,
      BIGINT_ZERO,
      BIGINT_ZERO,
      BIGINT_ZERO,
      receivingTransfer ? BIGINT_ZERO : shareAmount,
      receivingTransfer ? shareAmount : BIGINT_ZERO,
      receivingTransfer ? BIGINT_ZERO : tokenAmount,
      receivingTransfer ? tokenAmount : BIGINT_ZERO,
      balancePosition
    );
  } else {
    log.info(
      '[AccountVaultPositionUpdate] Transfer. Account vault position {}. Latest update is {}.',
      [accountVaultPosition.id, accountVaultPosition.latestUpdate]
    );
    let latestAccountVaultPositionUpdate = AccountVaultPositionUpdate.load(
      accountVaultPosition.latestUpdate
    );
    if (latestAccountVaultPositionUpdate !== null) {
      let id = buildIdFromAccountAndTransaction(account, transaction);
      log.info(
        '[AccountVaultPositionUpdate] Transfer. Creating account vault position update (id {}) for position id {}',
        [id, accountVaultPosition.id]
      );
      createAccountVaultPositionUpdate(
        id,
        account,
        vault,
        accountVaultPosition.id,
        transaction,
        BIGINT_ZERO, // deposits
        BIGINT_ZERO, // withdrawals
        BIGINT_ZERO, // sharesMinted
        BIGINT_ZERO, // sharesBurnt
        receivingTransfer ? BIGINT_ZERO : shareAmount,
        receivingTransfer ? shareAmount : BIGINT_ZERO,
        receivingTransfer ? BIGINT_ZERO : tokenAmount,
        receivingTransfer ? tokenAmount : BIGINT_ZERO,
        balancePosition
      );
    }
  }
}
