import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import {
  Account,
  Strategy,
  Token,
  Transaction,
  Transfer,
  Vault,
} from '../../generated/schema';
import { usdcPrice } from './oracle/usdcOracle';
import * as yearn from './yearn';

export function buildIdFromAccountToAccountAndTransaction(
  fromAccount: Account,
  toAccount: Account,
  transaction: Transaction
): string {
  return fromAccount.id
    .concat('-')
    .concat(toAccount.id.concat('-').concat(transaction.id));
}

export function getOrCreate(
  fromAccount: Account,
  toAccount: Account,
  vault: Vault,
  token: Token,
  amount: BigInt,
  shareToken: Token,
  shareAmount: BigInt,
  transaction: Transaction
): Transfer {
  log.debug('[Transfer] Get or create', []);
  let id = buildIdFromAccountToAccountAndTransaction(
    fromAccount,
    toAccount,
    transaction
  );

  let isProtocolFee = false;
  if (toAccount.id === vault.rewards.toHexString()) {
    isProtocolFee = true;
  }

  if (isProtocolFee === false) {
    let stragey = Strategy.load(toAccount.id);
    if (stragey !== null) {
      isProtocolFee = true;
    }
  }

  let tokenAmountUsdc = usdcPrice(Address.fromString(token.id), amount);

  if (isProtocolFee) {
    yearn.addProtocolFee(tokenAmountUsdc);
  }

  let transfer = Transfer.load(id);
  if (transfer === null) {
    transfer = new Transfer(id);
    transfer.timestamp = transaction.timestamp;
    transfer.blockNumber = transaction.blockNumber;
    transfer.from = fromAccount.id;
    transfer.to = toAccount.id;
    transfer.vault = vault.id;
    transfer.tokenAmount = amount;
    transfer.tokenAmountUsdc = tokenAmountUsdc;
    transfer.token = token.id;
    transfer.shareToken = shareToken.id;
    transfer.shareAmount = shareAmount;
    transfer.transaction = transaction.id;
    transfer.isProtocolFee = isProtocolFee;
    transfer.save();
  }

  return transfer!;
}
