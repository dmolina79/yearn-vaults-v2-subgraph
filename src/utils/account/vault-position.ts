import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import {
  Account,
  AccountVaultPosition,
  AccountVaultPositionUpdate,
  Token,
  Transaction,
  Vault,
} from '../../../generated/schema';
import { Vault as VaultContract } from '../../../generated/Registry/Vault';
import * as vaultPositionUpdateLibrary from './vault-position-update';
import { BIGINT_ZERO } from '../constants';

export function buildId(account: Account, vault: Vault): string {
  return account.id.concat('-').concat(vault.id);
}

export function getBalancePosition(
  account: Account,
  token: Token,
  vaultContract: VaultContract
): BigInt {
  log.info('GetBalancePosition account  {} ', [account.id]);
  let pricePerShare = vaultContract.pricePerShare();
  let decimals = vaultContract.decimals();
  let accountAddress = Address.fromString(account.id);
  let accountBalance = vaultContract.balanceOf(accountAddress);
  // (vault.balanceOf(account) * (vault.pricePerShare() / 10**vault.decimals()))
  let u8Decimals = u8(decimals.toI32());
  let divisor = BigInt.fromI32(10).pow(u8Decimals);
  return accountBalance.times(pricePerShare).div(divisor);
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

function getBalanceTokens(current: BigInt, withdraw: BigInt): BigInt {
  return withdraw.gt(current) ? BIGINT_ZERO : current.minus(withdraw);
}

function getBalanceProfit(
  currentSharesBalance: BigInt,
  currentProfit: BigInt,
  currentAmount: BigInt,
  withdrawAmount: BigInt
): BigInt {
  if (currentSharesBalance.isZero()) {
    // User withdrawn all the shares, so we can calculate the profit or losses.
    if (withdrawAmount.gt(currentAmount)) {
      // User has profits.
      return currentProfit.plus(withdrawAmount.minus(currentAmount));
    } else {
      // User has losses.
      return currentProfit.minus(currentAmount.minus(withdrawAmount));
    }
  }
  // User still have shares, so we returns the current profit.
  return currentProfit;
}

export function deposit(
  vaultContract: VaultContract,
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
  let token = Token.load(vault.token) as Token;
  let balancePosition = getBalancePosition(account, token, vaultContract);
  if (accountVaultPosition == null) {
    accountVaultPosition = new AccountVaultPosition(vaultPositionId);
    accountVaultPosition.vault = vault.id;
    accountVaultPosition.account = account.id;
    accountVaultPosition.token = vault.token;
    accountVaultPosition.shareToken = vault.shareToken;
    accountVaultPosition.transaction = transaction.id;
    accountVaultPosition.balanceTokens = depositedTokens;
    accountVaultPosition.balanceShares = receivedShares;
    accountVaultPosition.balanceProfit = BIGINT_ZERO;
    accountVaultPositionUpdate = vaultPositionUpdateLibrary.createFirst(
      account,
      vault,
      vaultPositionId,
      transaction,
      depositedTokens,
      receivedShares,
      balancePosition
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
      receivedShares,
      balancePosition
    );
  }
  accountVaultPosition.balancePosition = balancePosition;
  accountVaultPosition.latestUpdate = accountVaultPositionUpdate.id;
  accountVaultPosition.save();

  return VaultPositionResponse.fromValue(
    accountVaultPosition!,
    accountVaultPositionUpdate!
  );
}

export function withdraw(
  vaultContract: VaultContract,
  accountVaultPosition: AccountVaultPosition,
  withdrawnAmount: BigInt,
  sharesBurnt: BigInt,
  transaction: Transaction
): AccountVaultPositionUpdate {
  let account = Account.load(accountVaultPosition.account) as Account;
  let vault = Vault.load(accountVaultPosition.vault) as Vault;
  let token = Token.load(vault.token) as Token;
  let balancePosition = getBalancePosition(account, token, vaultContract);
  let newAccountVaultPositionUpdate = vaultPositionUpdateLibrary.createAccountVaultPositionUpdate(
    vaultPositionUpdateLibrary.buildIdFromAccountAndTransaction(
      account,
      transaction
    ),
    account,
    vault,
    accountVaultPosition.id,
    transaction,
    BIGINT_ZERO, // deposits
    withdrawnAmount,
    BIGINT_ZERO, // sharesMinted
    sharesBurnt,
    BIGINT_ZERO, // sharesSent
    BIGINT_ZERO, // sharesReceived
    BIGINT_ZERO, // tokensSent
    BIGINT_ZERO, // tokensReceived
    balancePosition
  );
  accountVaultPosition.balanceShares = accountVaultPosition.balanceShares.minus(
    sharesBurnt
  );
  accountVaultPosition.balanceTokens = getBalanceTokens(
    accountVaultPosition.balanceTokens,
    withdrawnAmount
  );
  accountVaultPosition.balanceProfit = getBalanceProfit(
    accountVaultPosition.balanceShares,
    accountVaultPosition.balanceProfit,
    accountVaultPosition.balanceTokens,
    withdrawnAmount
  );
  accountVaultPosition.balancePosition = balancePosition;
  accountVaultPosition.latestUpdate = newAccountVaultPositionUpdate.id;
  accountVaultPosition.save();
  return newAccountVaultPositionUpdate;
}

export function transfer(
  vaultContract: VaultContract,
  fromAccount: Account,
  toAccount: Account,
  vault: Vault,
  tokenAmount: BigInt,
  shareAmount: BigInt,
  transaction: Transaction
): void {
  log.info('[AccountVaultPosition] Transfer {} from {} to {} ', [
    tokenAmount.toString(),
    fromAccount.id,
    toAccount.id,
  ]);
  let token = Token.load(vault.token) as Token;
  let fromId = buildId(fromAccount, vault);
  let fromAccountVaultPosition = AccountVaultPosition.load(fromId);
  let fromBalancePosition = getBalancePosition(
    fromAccount,
    token,
    vaultContract
  );
  let fromLatestUpdateId = vaultPositionUpdateLibrary.buildIdFromAccountAndTransaction(
    fromAccount,
    transaction
  );
  let fromCreateFirstAccountVaultPositionUpdate = false;
  if (fromAccountVaultPosition == null) {
    // It supports accounts that didn't deposit into a vault, but they received transfers (share tokens).
    log.info(
      '[VaultPosition] Transfer - FromAccountVaultPosition does NOT exist {}.',
      [fromId]
    );
    fromCreateFirstAccountVaultPositionUpdate = true;
    fromAccountVaultPosition = new AccountVaultPosition(fromId);
    fromAccountVaultPosition.vault = vault.id;
    fromAccountVaultPosition.account = fromAccount.id;
    fromAccountVaultPosition.token = vault.token;
    fromAccountVaultPosition.shareToken = vault.shareToken;
    fromAccountVaultPosition.transaction = transaction.id;
    fromAccountVaultPosition.balanceTokens = BIGINT_ZERO;
    fromAccountVaultPosition.balanceShares = BIGINT_ZERO;
    fromAccountVaultPosition.balancePosition = fromBalancePosition;
    fromAccountVaultPosition.balanceProfit = BIGINT_ZERO;
    fromAccountVaultPosition.latestUpdate = fromLatestUpdateId;
    fromAccountVaultPosition.save();
  } else {
    log.info(
      '[VaultPosition] Transfer - FromAccountVaultPosition does exist {}.',
      [fromAccountVaultPosition.id]
    );
    fromAccountVaultPosition.balanceTokens = getBalanceTokens(
      fromAccountVaultPosition.balanceTokens,
      tokenAmount
    );
    fromAccountVaultPosition.balanceShares = fromAccountVaultPosition.balanceShares.minus(
      shareAmount
    );
    fromAccountVaultPosition.balancePosition = fromBalancePosition;
    fromAccountVaultPosition.balanceProfit = getBalanceProfit(
      fromAccountVaultPosition.balanceShares,
      fromAccountVaultPosition.balanceProfit,
      fromAccountVaultPosition.balanceTokens,
      tokenAmount
    );
    fromAccountVaultPosition.save();
  }
  vaultPositionUpdateLibrary.transfer(
    fromLatestUpdateId,
    fromCreateFirstAccountVaultPositionUpdate,
    fromAccountVaultPosition as AccountVaultPosition,
    fromAccount,
    false, // Receiving transfer? False, it is the 'from' account.
    vault,
    tokenAmount,
    shareAmount,
    fromBalancePosition,
    transaction
  );
  log.info('Processing TO account {} (transfer). Hash {}', [
    toAccount.id,
    transaction.hash.toHexString(),
  ]);

  let toId = buildId(toAccount, vault);
  let toAccountVaultPosition = AccountVaultPosition.load(toId);
  let toBalancePosition = getBalancePosition(toAccount, token, vaultContract);
  let toLatestUpdateId = vaultPositionUpdateLibrary.buildIdFromAccountAndTransaction(
    toAccount,
    transaction
  );
  let toCreateFirstAccountVaultPositionUpdate = false;
  if (toAccountVaultPosition == null) {
    // It supports accounts that didn't deposit into a vault, but only received transfers (share tokens).
    log.info(
      '[VaultPosition] Transfer - ToAccountVaultPosition does NOT exist {}.',
      [toId]
    );
    toCreateFirstAccountVaultPositionUpdate = true;
    toAccountVaultPosition = new AccountVaultPosition(toId);
    toAccountVaultPosition.vault = vault.id;
    toAccountVaultPosition.account = toAccount.id;
    toAccountVaultPosition.token = vault.token;
    toAccountVaultPosition.shareToken = vault.shareToken;
    toAccountVaultPosition.transaction = transaction.id;
    toAccountVaultPosition.balanceTokens = tokenAmount;
    toAccountVaultPosition.balanceShares = shareAmount;
    toAccountVaultPosition.balancePosition = toBalancePosition;
    toAccountVaultPosition.balanceProfit = BIGINT_ZERO;
    toAccountVaultPosition.latestUpdate = toLatestUpdateId;
    toAccountVaultPosition.save();
  } else {
    log.info(
      '[VaultPosition] Transfer - ToAccountVaultPosition does exist {}.',
      [toAccountVaultPosition.id]
    );
    toAccountVaultPosition.balanceTokens = getBalanceTokens(
      toAccountVaultPosition.balanceTokens,
      tokenAmount
    );
    toAccountVaultPosition.balanceShares = toAccountVaultPosition.balanceShares.plus(
      shareAmount
    );
    toAccountVaultPosition.balancePosition = toBalancePosition;
    toAccountVaultPosition.balanceProfit = getBalanceProfit(
      toAccountVaultPosition.balanceShares,
      toAccountVaultPosition.balanceProfit,
      toAccountVaultPosition.balanceTokens,
      tokenAmount
    );
    toAccountVaultPosition.save();
  }

  vaultPositionUpdateLibrary.transfer(
    toLatestUpdateId,
    toCreateFirstAccountVaultPositionUpdate,
    toAccountVaultPosition as AccountVaultPosition,
    toAccount,
    true, // Receiving transfer? True, it is the 'to' account.
    vault,
    tokenAmount,
    shareAmount,
    toBalancePosition,
    transaction
  );
}
