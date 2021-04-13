import { log, ethereum, Bytes } from '@graphprotocol/graph-ts';
import { Transaction } from '../../generated/schema';
import { getTimestampInMillis } from './commons';

export function getOrCreateTransactionFromEvent(
  event: ethereum.Event,
  action: string
): Transaction {
  log.debug('[Transaction] Get or create transaction from event', []);
  let transaction = _getOrCreateTransaction(
    event.transaction,
    event.block,
    action
  );
  return transaction;
}

export function getOrCreateTransactionFromCall(
  call: ethereum.Call,
  action: string
): Transaction {
  log.debug('[Transaction] Get or create transaction from call', []);
  let transaction = _getOrCreateTransaction(
    call.transaction,
    call.block,
    action
  );
  return transaction;
}

function _getOrCreateTransaction(
  ethTransaction: ethereum.Transaction,
  block: ethereum.Block,
  action: string
): Transaction {
  log.debug('[Transaction] Get or create', []);
  let id = ethTransaction.hash
    .toHexString()
    .concat('-')
    .concat(ethTransaction.index.toString());
  let transaction = Transaction.load(id);
  if (transaction == null) {
    transaction = new Transaction(id);
    transaction.from = ethTransaction.from;
    transaction.gasPrice = ethTransaction.gasPrice;
    transaction.gasSent = ethTransaction.gasUsed;
    transaction.hash = ethTransaction.hash;
    transaction.index = ethTransaction.index;
    transaction.to = ethTransaction.to as Bytes;
    transaction.value = ethTransaction.value;
    transaction.timestamp = getTimestampInMillis(block);
    transaction.gasLimit = block.gasLimit;
    transaction.blockNumber = block.number;
    transaction.event = action;
    transaction.save();
  }

  return transaction!;
}
