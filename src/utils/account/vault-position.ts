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

export function buildId(account: Account, vault: Vault): string {
  return account.id.concat('-').concat(vault.id);
}

export function getBalancePosition(
  account: Account,
  token: Token,
  vaultContract: VaultContract
): BigInt {
  let pricePerShare = vaultContract.pricePerShare();
  let decimals = vaultContract.decimals();
  let accountAddress = Address.fromString(account.id);
  let accountBalance = vaultContract.balanceOf(accountAddress);
  // (vault.balanceOf(account) * (vault.pricePerShare() / 10**vault.decimals()))
  let u8Decimals = u8(decimals.toI32());
  let divisor = BigInt.fromI32(10).pow(u8Decimals);
  return accountBalance.times(pricePerShare.div(divisor));
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
  latestAccountVaultPositionUpdate: AccountVaultPositionUpdate,
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
    latestAccountVaultPositionUpdate.deposits,
    latestAccountVaultPositionUpdate.withdrawals.plus(withdrawnAmount),
    latestAccountVaultPositionUpdate.sharesMinted,
    latestAccountVaultPositionUpdate.sharesBurnt.plus(sharesBurnt),
    latestAccountVaultPositionUpdate.sharesSent,
    latestAccountVaultPositionUpdate.sharesReceived,
    latestAccountVaultPositionUpdate.tokensSent,
    latestAccountVaultPositionUpdate.tokensReceived,
    balancePosition
  );
  accountVaultPosition.balanceShares = accountVaultPosition.balanceShares.minus(
    sharesBurnt
  );
  accountVaultPosition.balanceTokens = accountVaultPosition.balanceTokens.minus(
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
  log.debug('[AccountVaultPosition] Transfer {} from {} to {} ', [
    tokenAmount.toString(),
    fromAccount.id,
    toAccount.id,
  ]);
  let token = Token.load(vault.token) as Token;
  let fromId = buildId(fromAccount, vault);
  let fromAccountVaultPosition = AccountVaultPosition.load(fromId);
  // The account vault position should exist.
  if (fromAccountVaultPosition !== null) {
    vaultPositionUpdateLibrary.transfer(
      fromAccountVaultPosition as AccountVaultPosition,
      fromAccount,
      false, // Receiving transfer? False, it is the 'from' account.
      vault,
      tokenAmount,
      shareAmount,
      getBalancePosition(fromAccount, token, vaultContract),
      transaction
    );
  }
  let toId = buildId(toAccount, vault);
  let toAccountVaultPosition = AccountVaultPosition.load(toId);
  if (toAccountVaultPosition !== null) {
    vaultPositionUpdateLibrary.transfer(
      toAccountVaultPosition as AccountVaultPosition,
      toAccount,
      true, // Receiving transfer? True, it is the 'to' account.
      vault,
      tokenAmount,
      shareAmount,
      getBalancePosition(toAccount, token, vaultContract),
      transaction
    );
  }
}
