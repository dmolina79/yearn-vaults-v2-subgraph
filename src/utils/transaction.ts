import { log, BigInt, ethereum, Bytes } from '@graphprotocol/graph-ts';
import { Transaction } from '../../generated/schema';
import { getTimestampInMillis } from './commons';

export function getOrCreateTransactionFromEvent(
  event: ethereum.Event,
  action: string
): Transaction {
  log.debug('[Transaction] Get or create transaction hash {} from event {}', [
    event.transaction.hash.toHexString(),
    action,
  ]);
  let transaction = _getOrCreateTransaction(
    event.transaction,
    event.logIndex,
    event.block,
    action
  );
  return transaction;
}

export function getOrCreateTransactionFromCall(
  call: ethereum.Call,
  action: string
): Transaction {
  log.debug(
    '[Transaction] Get or create transaction hash {} from call action {}',
    [call.transaction.hash.toHexString(), action]
  );
  let transaction = _getOrCreateTransaction(
    call.transaction,
    call.transaction.index, // As the call hasnt the event log inde, we use the transaction index value.
    call.block,
    action
  );
  return transaction;
}

function _getOrCreateTransaction(
  ethTransaction: ethereum.Transaction,
  logIndex: BigInt,
  block: ethereum.Block,
  action: string
): Transaction {
  log.info(
    '[Transaction] Get or create transaction for hash {}. Action: {} Log Index: {} Tx Index: {}',
    [
      ethTransaction.hash.toHexString(),
      action,
      logIndex.toString(),
      ethTransaction.index.toString(),
    ]
  );
  let id = ethTransaction.hash
    .toHexString()
    .concat('-')
    .concat(logIndex.toString());
  let transaction = Transaction.load(id);
  if (transaction == null) {
    transaction = new Transaction(id);
    transaction.logIndex = logIndex;
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
