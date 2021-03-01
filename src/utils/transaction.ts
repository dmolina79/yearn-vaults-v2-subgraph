import { log, ethereum, Bytes} from "@graphprotocol/graph-ts";
import {
  Transaction,
} from "../../generated/schema";
import { getTimestampInMillis } from "./commons";

export function getOrCreateTransactionFromEvent(
  event: ethereum.Event,
  action: string
): Transaction {
  log.debug('[Transaction] Get or create transaction from event', [])
  let transaction = _getOrCreateTransaction(
    event.transaction,
    event.block,
    event.address,
    action
  )
  log.debug('[Transaction] Get or create transaction from event finish', [])
  return transaction
}

export function getOrCreateTransactionFromCall(
  call: ethereum.Call
): Transaction {
  log.debug('[Transaction] Get or create transaction from call', [])
  let transaction = _getOrCreateTransaction(
    call.transaction,
    call.block,
    call.to,
    ''
  )
  log.debug('[Transaction] Get or create transaction from call finish', [])
  return transaction
}

function _getOrCreateTransaction(
  ethTransaction: ethereum.Transaction,
  block: ethereum.Block,
  contract: Bytes, 
  action: string
): Transaction {
  let id = ethTransaction.hash.toHexString()
  let transaction = Transaction.load(id)
  if (transaction == null) {
    log.debug("[Transaction] Creating with id {}", [id]);
    let transaction = new Transaction(id);
    transaction.event = action;
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
    transaction.contract = contract;
    if (action !== '') {
      transaction.event = action
    }
    transaction.save();
  } else {
    log.debug("[Transaction] Found with id {}", [id]);
  }

  return transaction!
}