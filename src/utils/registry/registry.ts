import { Address, log } from '@graphprotocol/graph-ts';
import { Registry, Transaction } from '../../../generated/schema';

export function buildId(address: Address): string {
  return address.toHexString();
}

export function getOrCreate(
  address: Address,
  transaction: Transaction
): Registry {
  let id = buildId(address);
  log.debug('[Registry] Loading registry for id {}', [id]);
  let registry = Registry.load(id);

  if (registry == null) {
    log.info('[Registry] Create registry for address {}', [
      address.toHexString(),
    ]);
    registry = new Registry(id);
    registry.timestamp = transaction.timestamp;
    registry.blockNumber = transaction.blockNumber;
    registry.transaction = transaction.id;
    registry.save();
  }
  return registry as Registry;
}
