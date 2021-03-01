import { log, ethereum, Bytes} from "@graphprotocol/graph-ts";
import {
  Transaction,
} from "../../generated/schema";
import { getTimestampInMillis } from "./commons";

export function getOrCreateTransactionFromEvent(
  event: ethereum.Event,
  action: string
): Transaction {
  let transaction = _getOrCreateTransaction(
    event.transaction,
    event.block,
    event.address,
    action
  )
  return transaction
}

export function getOrCreateTransactionFromCall(
  call: ethereum.Call
): Transaction {
  let transaction = _getOrCreateTransaction(
    call.transaction,
    call.block,
    call.to,
    ''
  )
  return transaction
}

function _getOrCreateTransaction(
  ethTransaction: ethereum.Transaction,
  block: ethereum.Block,
  contract: Bytes, 
  action: string
): Transaction {
  let id = ethTransaction.hash.toHexString()
  log.info("Creating EthTransaction with id {}", [id]);
  let transaction = Transaction.load(id)
  if (transaction === null) {
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
  }

  return transaction!
}