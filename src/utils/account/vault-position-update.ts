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

function incrementOrder(order: BigInt): BigInt {
  return order.plus(BigInt.fromI32(1));
}

export function buildIdFromAccountVaultAndOrder(
  account: Account,
  vault: Vault,
  newOrder: BigInt
): string {
  return account.id.concat(
    '-'.concat(vault.id.concat('-'.concat(newOrder.toString())))
  );
}

export function createAccountVaultPositionUpdate(
  id: string,
  newOrder: BigInt,
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
    '[VaultPositionUpdate] Creating account {} vault position update (order {}) with id {}',
    [account.id, newOrder.toString(), id]
  );
  let accountVaultPositionUpdate = new AccountVaultPositionUpdate(id);
  accountVaultPositionUpdate.order = newOrder;
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
  newAccountVaultPositionOrder: BigInt,
  transaction: Transaction,
  depositedTokens: BigInt,
  receivedShares: BigInt,
  balancePosition: BigInt
): AccountVaultPositionUpdate {
  log.debug('[VaultPositionUpdate] Create first', []);
  let id = buildIdFromAccountVaultAndOrder(
    account,
    vault,
    newAccountVaultPositionOrder
  );
  let accountVaultPositionFirstUpdate = AccountVaultPositionUpdate.load(id);
  if (accountVaultPositionFirstUpdate == null) {
    // We always should create an update.
    accountVaultPositionFirstUpdate = createAccountVaultPositionUpdate(
      id,
      newAccountVaultPositionOrder,
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
  } else {
    log.warning(
      'INVALID Deposit First: update FOUND (shouldnt) UpdateID {} Account {}',
      [id, account.id]
    );
  }

  return accountVaultPositionFirstUpdate!;
}

export function getNewOrder(id: string, txHash: string): BigInt {
  log.info(
    '[AccountVaultPositionUpdate] Getting new order for id {} (tx: {}).',
    [id, txHash]
  );
  if (id === null) {
    log.info(
      '[AccountVaultPositionUpdate] Id is null. New order value is 0 (tx: {}).',
      [txHash]
    );
    return BIGINT_ZERO;
  }
  let latestAccountVaultPositionUpdate = AccountVaultPositionUpdate.load(id);
  let newOrder = BIGINT_ZERO;

  if (latestAccountVaultPositionUpdate !== null) {
    newOrder = incrementOrder(latestAccountVaultPositionUpdate.order);
  } else {
    log.warning(
      'INVALID Deposit: latestUpdateID NOT found (shouldnt) !== LatestUpdateID {} tx: {}',
      [id, txHash]
    );
  }
  return newOrder;
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
  log.debug(
    '[VaultPositionUpdate] Deposit. Creating new account vault position update. Account {} Vault {}',
    [account.id, vault.id]
  );
  let newAccountVaultPositionUpdateOrder = getNewOrder(
    latestUpdateId,
    transaction.hash.toHexString()
  );

  let id = buildIdFromAccountVaultAndOrder(
    account,
    vault,
    newAccountVaultPositionUpdateOrder
  );
  let accountVaultPositionUpdate = AccountVaultPositionUpdate.load(id);
  if (accountVaultPositionUpdate == null) {
    accountVaultPositionUpdate = createAccountVaultPositionUpdate(
      id,
      newAccountVaultPositionUpdateOrder,
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
  } else {
    log.warning(
      'INVALID Deposit: update FOUND (shouldnt) UpdateID {} Account {} TX {}',
      [id, account.id, transaction.hash.toHexString()]
    );
  }

  return accountVaultPositionUpdate!;
}

export function transfer(
  accountVaultPositionUpdateId: string,
  newAccountVaultPositionOrder: BigInt,
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
    '[AccountVaultPositionUpdate] Transfer. Processing account {} for vault position {} and order {} in TX {}',
    [
      account.id,
      accountVaultPosition.id,
      newAccountVaultPositionOrder.toString(),
      transaction.hash.toHexString(),
    ]
  );
  if (createFirstAccountVaultPositionUpdate) {
    log.info(
      '[AccountVaultPositionUpdate] Transfer. Account vault position (first time - latestUpdate is null -). Account vault position id {}',
      [accountVaultPosition.id]
    );
    createAccountVaultPositionUpdate(
      accountVaultPositionUpdateId,
      newAccountVaultPositionOrder,
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
      let id = buildIdFromAccountVaultAndOrder(
        account,
        vault,
        newAccountVaultPositionOrder
      );
      log.info(
        '[AccountVaultPositionUpdate] Transfer. Creating account vault position update (id {}) for position id {}',
        [id, accountVaultPosition.id]
      );
      createAccountVaultPositionUpdate(
        id,
        newAccountVaultPositionOrder,
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
    } else {
      log.warning('INVALID Transfer: update FOUND (shouldnt) {} Account {}', [
        accountVaultPosition.latestUpdate,
        account.id,
      ]);
    }
  }
}
