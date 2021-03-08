import { log, BigInt, ethereum, Bytes, Address } from '@graphprotocol/graph-ts';
import { ERC20 } from '../../generated/Registry/ERC20';
import { Transaction, Token } from '../../generated/schema';

export function getTimestampInMillis(event: ethereum.Event): BigInt {
  return event.block.timestamp.times(BigInt.fromI32(1000));
}

export function getTimeInMillis(time: BigInt): BigInt {
  return time.times(BigInt.fromI32(1000));
}

// make a derived ID from transaction hash and big number
export function buildId(tx: Bytes, n: BigInt): string {
  return tx.toHexString().concat('-').concat(n.toString());
}

export function buildIdFromEvent(event: ethereum.Event): string {
  return event.transaction.hash.toHex() + '-' + event.logIndex.toString();
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

export function createToken(
  address: Address,
  decimals: BigInt,
  name: string,
  symbol: string
): Token {
  let id = address.toHexString();
  log.info('Creating token entity fo {} / {} / {} / {}', [
    id,
    name,
    symbol,
    decimals.toString(),
  ]);
  let entity = new Token(id);
  // TODO: check if we need this extra field since id is already mapped
  // entity.address = address
  entity.decimals = decimals.toI32();
  entity.name = name;
  entity.symbol = symbol;
  entity.save();
  return entity;
}

export function getOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHexString());
  if (token === null) {
    let erc20Instance = ERC20.bind(address);
    token = createToken(
      address,
      BigInt.fromI32(erc20Instance.decimals()),
      erc20Instance.name(),
      erc20Instance.symbol()
    );
  }
  return token as Token;
}

export function createEthTransaction(
  event: ethereum.Event,
  action: string
): Transaction {
  let id = buildIdFromEvent(event);
  log.info('Creating EthTransaction with id {}', [id]);
  let entity = new Transaction(id);
  entity.event = action;
  entity.from = event.transaction.from;
  entity.gasPrice = event.transaction.gasPrice;
  entity.gasSent = event.transaction.gasUsed;
  entity.hash = event.transaction.hash;
  entity.index = event.transaction.index;
  entity.to = event.transaction.to as Bytes;
  entity.value = event.transaction.value;
  entity.contract = event.address;
  entity.timestamp = getTimestampInMillis(event);
  entity.gasLimit = event.block.gasLimit;
  entity.blockNumber = event.block.number;
  entity.save();
  return entity;
}
