import { BigInt, ethereum, Bytes, Address } from '@graphprotocol/graph-ts';

export function getTimeInMillis(time: BigInt): BigInt {
  return time.times(BigInt.fromI32(1000));
}

export function getTimestampInMillis(block: ethereum.Block): BigInt {
  return block.timestamp.times(BigInt.fromI32(1000));
}
// make a derived ID from transaction hash and big number
export function buildId(tx: Bytes, n: BigInt): string {
  return tx.toHexString().concat('-').concat(n.toString());
}

export function buildIdFromEvent(event: ethereum.Event): string {
  return buildId(event.transaction.hash, event.logIndex);
}

export function buildBlockId(block: ethereum.Block): string {
  return (
    block.hash.toHex() +
    '-' +
    block.number.toString() +
    '-' +
    block.timestamp.toString()
  );
}

export function buildUpdateId(address: Address, tx: Bytes, n: BigInt): string {
  return address
    .toHexString()
    .concat('-')
    .concat(tx.toHexString().concat('-').concat(n.toString()));
}
